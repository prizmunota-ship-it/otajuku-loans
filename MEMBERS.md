# 入会申込と入会管理（2026-09-14〜）

## 入口
- 公開の申込ページ: `/join`（`join.html`・認証なし・noindex）。送信後に会費ペイのカード登録へ案内する（STEP1 申込 → STEP2 会費ペイ → STEP3 太田からLINE）。
- 主宰専用の管理画面: `/member-admin`（`member-admin.html`）。ポータル認証＋ prizmun.ota@gmail.com のみ。操作には管理用トークンが必要（`~/.otajuku_admin/member_admin.token`。リポジトリには SHA-256 のみ）。
- 従来の Google フォーム（`docs.google.com/forms/d/e/1FAIpQLSfhDw8KgL0-.../viewform`）は**申込の入口としては使わない**が、名簿スプレッドシート `太田塾　申込みフォーム（回答）` の受け口として残す。`/join` の申込は API がサーバー側でこのフォームに転記する（設問ID は `functions/api/join.js` の `ENTRY`）。フォームの設問を変えると転記が失敗する（管理画面に「⚠︎シート未転記」が出る→設問IDを直して「再送」）。

## なぜ転記するか
既存の認証GAS（メンバー確認）は名簿シートのメールを見ている。転記を続けることで、申込直後から従来どおりメンバーサイトに入れる。

## 保存
`functions/api/join.js` が既存の `ZAIKO_KV` を使う。キーは `member:v1:<id>`（1人1キー）。他アプリのキーには触れない。
- `status`: applied（申込中・カード未登録）/ active（会員）/ left（退会）/ unknown（要確認）
- `steps`: card（会費ペイ登録）/ oc（OC招待）/ drive（Drive登録）/ calendar（カレンダー）/ referral（紹介料）— 値は日付文字列。空＝未。
- `source`: form（/join から）/ import（名簿から一括取込）/ manual（手入力）
- `sheet`: ok / failed / n/a（Googleフォームへの転記結果。form のみ）
- 申込の連投は同一IPで10分5件まで（`join:rate:*`）。ボット用の隠し項目（website）に入力があれば黙って捨てる。

## 名簿からの取込
2026-09-14 に「フォームの回答 1」65行と「退会者」10行を取込済み（id は `imp_<SHA-256(メール)の先頭12桁>`）。同じ id は上書きしない（`overwrite:true` を付けた時だけ上書き）。

## 確認
`tests/join.test.mjs` を Node で実行（申込・罠・連投制限・転記失敗の再送・管理操作）。画面はローカルのスタブサーバで確認し、本番は `test:true`（トークン付き）の申込でシートを汚さずに動作確認する。
