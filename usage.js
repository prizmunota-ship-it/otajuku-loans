/* 太田塾アプリ 利用ログ用ビーコン（全アプリ共通・軽量）
   仕組み：ログイン済みメール(otajuku_email)＋アプリ名＋日時を、
   GAS Web App 経由でハブのスプレッドシート「利用ログ」に1行追記する。
   ※ LOG_URL がまだ未設定（プレースホルダ）の間は何もしない安全設計。 */
(function () {
  try {
    var LOG_URL = "https://script.google.com/macros/s/AKfycbyZAnDfRVkEsGmaEmZoXQixgMyVHmlMJ-6aMQ4M7Pr_8_q8NwrfAna6tH-eAlYd8uwL/exec";
    if (LOG_URL.indexOf("script.google.com") < 0) return; // 未設定なら無効
    var email = "";
    try { email = (localStorage.getItem("otajuku_email") || "").trim().toLowerCase(); } catch (e) {}
    if (!email || email.indexOf("@") < 0) return; // 未ログインは記録しない
    var p = (location.pathname || "").replace(/\/+$/, "").replace(/^\//, "").replace(/\.html$/, "");
    var key = (p.split("/")[0] || "hub").toLowerCase();
    var MAP = {
      "": "AIアプリ選択画面", "hub": "AIアプリ選択画面", "index": "AIアプリ選択画面",
      "hub-ea215b88d552": "コックピット",
      "loans": "融資情報一覧", "jigyo": "事業計画書", "report": "物件補足レポート",
      "oyaryoku": "大家力ラボ", "baikyaku": "売却事例", "shiryo": "資料格納庫",
      "schedule": "年間イベント", "session": "個別相談", "zaikin": "資金繰り帳",
      "naiso": "内装状況", "kakunin": "確認"
    };
    var app = MAP[key] || key;
    // 記録しないページ（トップの選択画面＝旧「ハブ」、および太田専用のコックピット）
    var SKIP = { "AIアプリ選択画面": 1, "コックピット": 1 };
    if (SKIP[app]) return;
    var img = new Image();
    img.src = LOG_URL + "?app=" + encodeURIComponent(app) + "&email=" + encodeURIComponent(email) + "&t=" + Date.now();
  } catch (e) {}
})();
