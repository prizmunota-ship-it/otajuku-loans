/*******************************************************
 * 太田塾 個別相談 予約受付GAS
 *  - action=slots : 太田カレンダーの空きから予約可能枠を返す
 *  - action=book  : 予約確定（カレンダー作成＋シート記録＋確認メール）
 *  JSONP(callback) 対応。フロント(session.html)は<script>で呼ぶ。
 *******************************************************/

// ===== 設定（ここだけ変えればOK） =====
var CFG = {
  SHEET_ID:    '1ex8bbU3JK7OsrnVezPWjrwZ56MsvehZ2P6F7nwngks8', // 予約記録スプレッドシートのID
  OWNER_EMAIL: 'prizmun.ota@gmail.com',             // 太田（予定を入れるカレンダー）
  CAL_IDS:     ['prizmun.ota@gmail.com'],           // 空き判定に使うカレンダー（複数可）
  ZOOM_URL: 'https://us06web.zoom.us/j/89108270464?pwd=bBUz4J7PrpYOG9DLka53kGzihBZlsa.1',
  ZOOM_ID:  '891 0827 0464',
  ZOOM_PW:  '454615',
  SLOT_MIN:     60,     // 1枠の長さ（分）
  DAY_START:    9,      // 受付開始（時）
  DAY_END:      21,     // 受付終了（時）※この時刻に終わる枠まで
  DAYS_AHEAD:   21,     // 何日先まで予約可能か
  MIN_NOTICE_H: 2,      // 開始まで最低これだけ空ける（時間）
  TZ: 'Asia/Tokyo'
};

var WD = ['日','月','火','水','木','金','土'];

function doGet(e){
  var cb = (e && e.parameter && e.parameter.callback) || '';
  var out;
  try{
    var action = (e && e.parameter && e.parameter.action) || 'slots';
    if(action === 'slots')      out = getSlots();
    else if(action === 'book')  out = book(e.parameter);
    else                        out = {ok:false, error:'unknown action'};
  }catch(err){
    out = {ok:false, error:String(err)};
  }
  return reply(out, cb);
}

function reply(obj, cb){
  var json = JSON.stringify(obj);
  if(cb){
    return ContentService.createTextOutput(cb + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== 空き枠を返す =====
function getSlots(){
  var now = new Date();
  var minStart = new Date(now.getTime() + CFG.MIN_NOTICE_H*3600*1000);
  var base = new Date(); base.setHours(0,0,0,0);
  var days = [];
  for(var d=0; d<=CFG.DAYS_AHEAD; d++){
    var day = new Date(base.getTime() + d*86400000);
    var rStart = new Date(day); rStart.setHours(CFG.DAY_START,0,0,0);
    var rEnd   = new Date(day); rEnd.setHours(CFG.DAY_END,0,0,0);
    var busy = getBusy(rStart, rEnd);
    var slots = [];
    for(var t=new Date(rStart); t.getTime()+CFG.SLOT_MIN*60000 <= rEnd.getTime(); t=new Date(t.getTime()+CFG.SLOT_MIN*60000)){
      var sEnd = new Date(t.getTime()+CFG.SLOT_MIN*60000);
      if(t < minStart) continue;
      if(overlapsBusy(t, sEnd, busy)) continue;
      slots.push(fmt(t,'HH:mm'));
    }
    if(slots.length){
      days.push({ date: fmt(day,'yyyy-MM-dd'), label: fmt(day,'M/d')+'('+WD[day.getDay()]+')', slots: slots });
    }
  }
  return {ok:true, days:days, slotMin:CFG.SLOT_MIN};
}

function getBusy(start, end){
  var events = [];
  CFG.CAL_IDS.forEach(function(id){
    var cal = (id==='default') ? CalendarApp.getDefaultCalendar() : CalendarApp.getCalendarById(id);
    if(!cal) return;
    cal.getEvents(start, end).forEach(function(ev){
      if(ev.isAllDayEvent()) return;              // 終日予定は空き判定に含めない
      events.push({s: ev.getStartTime(), e: ev.getEndTime()});
    });
  });
  return events;
}

function overlapsBusy(s, e, busy){
  for(var i=0;i<busy.length;i++){
    if(s < busy[i].e && e > busy[i].s) return true;
  }
  return false;
}

// ===== 予約確定 =====
function book(p){
  var name  = (p.name||'').trim();
  var email = (p.email||'').trim();
  var date  = (p.date||'').trim();   // yyyy-MM-dd
  var time  = (p.time||'').trim();   // HH:mm
  var memo  = (p.memo||'').trim();
  if(!name || !date || !time) return {ok:false, error:'必須項目が不足しています'};
  var start = parseDT(date, time);
  if(!start) return {ok:false, error:'日時が不正です'};
  var end = new Date(start.getTime()+CFG.SLOT_MIN*60000);

  var lock = LockService.getScriptLock();
  try{ lock.waitLock(10000); }catch(e){ return {ok:false, error:'混み合っています。もう一度お試しください'}; }
  try{
    // 直前に埋まっていないか再チェック（ダブルブッキング防止）
    var busy = getBusy(new Date(start.getTime()-1), new Date(end.getTime()+1));
    if(overlapsBusy(start, end, busy)) return {ok:false, error:'この枠は満席になりました', taken:true};

    var cal = CalendarApp.getCalendarById(CFG.OWNER_EMAIL) || CalendarApp.getDefaultCalendar();
    var desc = '太田塾 個別相談\n\n▼ZOOM入室\n'+CFG.ZOOM_URL+'\nID: '+CFG.ZOOM_ID+' / パスコード: '+CFG.ZOOM_PW
             + '\n\n申込者: '+name+' <'+email+'>\n相談内容: '+(memo||'（なし）');
    var ev = cal.createEvent('個別相談（'+name+'）', start, end, {description: desc});

    if(CFG.SHEET_ID && CFG.SHEET_ID.indexOf('PUT_')<0){
      SpreadsheetApp.openById(CFG.SHEET_ID).getSheets()[0]
        .appendRow([new Date(), date, time, name, email, memo, ev.getId()]);
    }

    var dtLabel = fmt(start,'yyyy年M月d日')+'('+WD[start.getDay()]+') '+fmt(start,'HH:mm')+'〜'+fmt(end,'HH:mm');
    if(email){
      MailApp.sendEmail({ to: email, name: '太田塾',
        subject: '【太田塾】個別相談のご予約を受け付けました（'+fmt(start,'M/d')+' '+time+'）',
        body: name+' 様\n\n個別相談のご予約を受け付けました。\n\n日時：'+dtLabel
            + '\n\n▼オンラインの方はこちらから入室（ZOOM）\n'+CFG.ZOOM_URL
            + '\nミーティングID：'+CFG.ZOOM_ID+'\nパスコード：'+CFG.ZOOM_PW
            + '\n\n※事務所にお越しの方はZOOM不要です。\n※日時変更・キャンセルは太田LINEへご連絡ください。\n\n太田塾' });
    }
    MailApp.sendEmail(CFG.OWNER_EMAIL,
      '【個別相談】新規予約 '+fmt(start,'M/d')+' '+time+'（'+name+'）',
      name+' さんから個別相談の予約が入りました。\n日時：'+dtLabel+'\nメール：'+email+'\n相談内容：'+(memo||'（なし）'));

    return {ok:true, date:date, time:time, label:dtLabel};
  } finally { lock.releaseLock(); }
}

// ===== ユーティリティ =====
function fmt(d, pat){ return Utilities.formatDate(d, CFG.TZ, pat); }
function parseDT(date, time){
  var m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/), t = time.match(/^(\d{1,2}):(\d{2})$/);
  if(!m || !t) return null;
  return new Date(Number(m[1]), Number(m[2])-1, Number(m[3]), Number(t[1]), Number(t[2]), 0);
}
