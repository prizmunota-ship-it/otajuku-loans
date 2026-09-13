import schedule from '../../events.json';

// Reuse the portal's membership check; localStorage alone never authorizes a request.
// Each member has a separate key so simultaneous replies cannot overwrite a group snapshot.
const MEMBER_URL = 'https://script.google.com/macros/s/AKfycbyZAnDfRVkEsGmaEmZoXQixgMyVHmlMJ-6aMQ4M7Pr_8_q8NwrfAna6tH-eAlYd8uwL/exec';
const EVENTS = new Map(schedule.flatMap(month => month.events).map(event => [event.id, event]));
const PREFIX = 'event-rsvp:v1:';
const json = (data, status = 200) => new Response(JSON.stringify(data), {status, headers: {
  'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff', 'Vary': 'Origin'
}});
const hash = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))).map(n => n.toString(16).padStart(2, '0')).join('');

async function verifyMember(email, fetcher) {
  const url = new URL(MEMBER_URL);
  url.searchParams.set('email', email);
  url.searchParams.set('callback', '_member');
  const response = await fetcher(url, {signal: AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error('member_unavailable');
  const text = (await response.text()).trim();
  if (/^_member\(\s*["']ok["']\s*\);?$/.test(text)) return true;
  if (/^_member\(\s*["']ng["']\s*\);?$/.test(text)) return false;
  throw new Error('member_unavailable');
}

function validateReply(input, event) {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const comment = typeof input.comment === 'string' ? input.comment.trim() : '';
  if (!name || name.length > 60 || /[\u0000-\u001f\u007f]/.test(name) || comment.length > 300) return null;
  if (!input.answers || typeof input.answers !== 'object' || Array.isArray(input.answers)) return null;
  const allowed = event.sessions.map(session => session.id);
  if (Object.keys(input.answers).length !== allowed.length) return null;
  const answers = {};
  for (const id of allowed) {
    if (!['yes', 'no'].includes(input.answers[id])) return null;
    answers[id] = input.answers[id];
  }
  return {name, answers, comment};
}

async function loadReplies(kv, eventId) {
  let cursor, all = [];
  do {
    const page = await kv.list({prefix: PREFIX + eventId + ':', limit: 200, ...(cursor ? {cursor} : {})});
    const values = await Promise.all(page.keys.map(key => kv.get(key.name, 'json')));
    all.push(...values.filter(Boolean));
    if (page.list_complete) break;
    cursor = page.cursor;
    if (!cursor || all.length > 2000) throw new Error('list_failed');
  } while (true);
  return all.filter(reply => !reply.withdrawn);
}

function summarize(replies, event) {
  const totals = Object.fromEntries(event.sessions.map(session => [session.id, {yes: 0, no: 0}]));
  for (const reply of replies) for (const session of event.sessions) {
    const answer = reply.answers[session.id];
    if (answer === 'yes' || answer === 'no') totals[session.id][answer]++;
  }
  return totals;
}

export function createHandler(fetcher = fetch, now = () => new Date()) {
  return async ({request, env}) => {
    if (request.method !== 'POST') return json({ok: false, error: 'method'}, 405);
    const origin = request.headers.get('Origin');
    if (origin && origin !== new URL(request.url).origin) return json({ok: false, error: 'origin'}, 403);
    if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) return json({ok: false, error: 'content_type'}, 415);
    let body;
    try {
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > 24000) return json({ok: false, error: 'too_large'}, 413);
      body = JSON.parse(raw);
    } catch { return json({ok: false, error: 'bad_json'}, 400); }
    if (!body || typeof body !== 'object') return json({ok: false, error: 'bad_json'}, 400);
    const event = EVENTS.get(body.eventId);
    if (!event) return json({ok: false, error: 'event_not_found'}, 404);
    if (event.attendanceUrl) return json({ok: false, error: 'external_attendance'}, 409);
    const kv = env.ZAIKO_KV;
    if (!kv) return json({ok: false, error: 'storage_unavailable'}, 503);
    try {
      if (!['read', 'save', 'clear'].includes(body.action)) return json({ok: false, error: 'bad_action'}, 400);
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ok: false, error: 'membership_required'}, 401);
      if (!await verifyMember(email, fetcher)) return json({ok: false, error: 'membership_required'}, 403);
      const id = await hash(email);
      const key = PREFIX + event.id + ':' + id;
      const closed = now() >= new Date(event.endAt);
      if (body.action === 'clear') {
        if (closed) return json({ok: false, error: 'closed'}, 409);
        // Write a tombstone even when a replica still caches a missing/old reply.
        await kv.put(key, JSON.stringify({id, withdrawn: true, updatedAt: now().toISOString()}));
        return json({ok: true});
      }
      if (body.action === 'save') {
        if (closed) return json({ok: false, error: 'closed'}, 409);
        const fields = validateReply(body, event);
        if (!fields) return json({ok: false, error: 'invalid_reply'}, 400);
        const mine = {...fields, id, updatedAt: now().toISOString()};
        await kv.put(key, JSON.stringify(mine));
        // Do not read-after-write: KV replicas may still contain an earlier value.
        return json({ok: true, mine, closed: false});
      }
      const replies = await loadReplies(kv, event.id);
      replies.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
      return json({ok: true, replies, totals: summarize(replies, event), mine: replies.find(reply => reply.id === id) || null, closed, checkedAt: now().toISOString()});
    } catch (error) {
      const member = error.message === 'member_unavailable' || error.name === 'TimeoutError';
      return json({ok: false, error: member ? 'membership_unavailable' : 'storage_unavailable'}, 503);
    }
  };
}

export const onRequest = createHandler();
