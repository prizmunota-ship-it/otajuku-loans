// Preserve the existing membership decision, without loading Google scripts in
// the member's browser (Google account/cookie state must not affect login).
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyZAnDfRVkEsGmaEmZoXQixgMyVHmlMJ-6aMQ4M7Pr_8_q8NwrfAna6tH-eAlYd8uwL/exec';
const reply = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}
});
export function createHandler(fetcher = fetch) {
  return async ({request}) => {
    if (request.method !== 'POST') return reply({error: 'method'}, 405);
    try {
      const {email} = await request.json();
      if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return reply({error: 'email'}, 400);
      const url = new URL(GAS_URL);
      url.searchParams.set('email', email.trim().toLowerCase());
      url.searchParams.set('callback', '_memberCheck');
      const upstream = await fetcher(url.toString(), {redirect: 'follow', signal: AbortSignal.timeout(20000)});
      if (!upstream.ok) return reply({error: 'unavailable'}, 503);
      const match = (await upstream.text()).trim().match(/^_memberCheck\(\s*["'](ok|ng)["']\s*\);?$/);
      if (!match) return reply({error: 'unavailable'}, 503);
      return reply({result: match[1]});
    } catch {
      return reply({error: 'unavailable'}, 503);
    }
  };
}
export const onRequest = createHandler();
