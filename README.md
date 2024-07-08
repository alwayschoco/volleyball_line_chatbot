# volleyball_line_chatbot

主要透過以下服務建立 line chat bot 來管理:
- [Line Messaging API](https://developers.line.biz/en/docs/messaging-api/)
- [Google App Script](https://developers.google.com/apps-script/)
- Google Sheet

### Line Messaging API
1. 在 LINE Developers 登入後, 可以建立 Channels > Messaging API,'
2. 建立完點進去後的 Messaging API > Webhook settings > 開啟 Use webhook, Webhook URL 輸入 Google App Scripts public 的網址 > Verify
3. 下面的 Channel access token 就是 main.gs 內要填的那個

### Google App Script
1. [Google App Script](https://script.google.com/home) 新增專案
2. 貼 code, 把該填的 FIXME 填一下
    - `group id` 是 line 群組的 id, 我這邊偷懶, 是先把機器人加到 line 群組後, 先拿一次 msg 印 log 直接寫死, 可以改一下透過群組人員的 msg 取得比較有彈性XD
3. 右上角 Deploy, 貼到 Line Message API 的 Webhook url
4. 如果有一些定期通知推播想要設定, 可以到處發條件那邊設定:
    - 新增觸發條件 > 選擇要執行的 function (如 `doReset` ), 設定時間 (只能是一個區間, 不能特定時間點), done