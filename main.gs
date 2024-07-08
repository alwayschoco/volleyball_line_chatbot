// FIXME: LINE Messenging API Token
const CHANNEL_ACCESS_TOKEN = '';
// FIXME: LINE Group ID, get from api response
const GROUP_ID = '';

// FIXME: Google Sheet ID and sheet name
const SHEET_ID = '';
const SHEET_NAME = '';

// Constants
const MAX_NUMBERS_OF_MEMBERS = 18;
const ADD_REX = /^\+(\d+)$/g;
const REMOVE_REX = /^\-(\d+)$/g;

// Strings
const REACHED_MAXIMUM_OPACITY = '已額滿, 下次請早';
const CANNOT_ADD_MORE_THAN_ONE = '現在只開放給社團成員 +1';

// Log to another sheet
/*
function _LogToSheet(username, token, msg) {
  const spreadSheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadSheet.getSheetByName("Log");
  if (!sheet) {
  }
  const currentListRow = sheet.getLastRow();
  const v = `${username}/${token}: [${msg}]`;
  sheet.getRange(currentListRow + 1, 1, 1).setValue(v);
}
*/

function _openSheet() {
  const spreadSheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadSheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return null;
  }
  return sheet;
}

function _getDayAndHours() {
  const now = Utilities.formatDate(new Date(), 'Asia/Taipei', 'MMMM dd, yyyy HH:mm:ss Z');
  const taipeiNow = new Date(now);
  return { day: taipeiNow.getDay(), hours: taipeiNow.getHours() };
};

// Get next play date, following will get date for next Thursday
function _getThurDate() {
  const nowStr = Utilities.formatDate(new Date(), 'Asia/Taipei', 'MMMM dd, yyyy HH:mm:ss Z');
  const targetDate = new Date(nowStr);
  const nowDay = targetDate.getDay();
  let originDay = nowDay;

  if (nowDay === 4 && targetDate.getHours() >= 22) {
    originDay = nowDay + 1;
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const addedDays = originDay > 4 ? 11 - originDay : 4 - originDay;
  targetDate.setDate(targetDate.getDate() + addedDays);
  return `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;
};

function _addToSheet(username, number) {
  if (number < 1) {
    return;
  }
  const sheet = _openSheet();

  const currentListRow = sheet.getLastRow();
  if (currentListRow === MAX_NUMBERS_OF_MEMBERS) {
    return { msg: REACHED_MAXIMUM_OPACITY };
  }

  const { day, hours } = _getDayAndHours();
  // FIXME: you can only add friends after certain day
  if ((day === 4 && hours > 21) || (day > 4 && day < 7) || day === 0) {
    const isExisted = _getReserveList().some(item => item === username);
    if (isExisted || number > 1) {
      return { msg: CANNOT_ADD_MORE_THAN_ONE };
    }
  }

  const addableNumber = currentListRow + number > MAX_NUMBERS_OF_MEMBERS ? MAX_NUMBERS_OF_MEMBERS - currentListRow : number;

  const newValues = new Array(addableNumber).fill([username]);
  sheet.getRange(currentListRow + 1, 1, addableNumber).setValues(newValues);
  const totalCount = sheet.getLastRow();
  let msg = `已成功報名 ${addableNumber} 個名額, 總人數: ${totalCount}`;
  if (totalCount === MAX_NUMBERS_OF_MEMBERS) {
    msg += `\n本周已滿 ${MAX_NUMBERS_OF_MEMBERS} 人!`;
  }
  return { msg };
}

// Get current list
function _getReserveList() {
  const sheet = _openSheet();
  if (sheet.getLastRow() === 0 ) {
    return [];
  }
  const list = sheet.getDataRange().getValues();
  const reserveList = list.flat();

  return reserveList;
}

function _removeFromList(username, number) {
  if (number < 1) {
    return;
  }
  const sheet = _openSheet();
  let i;
  for (i = 0; i < number; i++) {
    const list = _getReserveList();
    const idx = list.findIndex(item => item === username);
    if (idx === -1) {
      break;
    }
    sheet.deleteRow(idx + 1);
  }
  return { msg: `已移除 ${i} 個名額, 總人數: ${sheet.getLastRow()}` };
}

// Hook call by Google App Script Trigger
function doNotifyFriendsAddable() {
  const thurDay = _getThurDate();
  const replyMessage = [{
    type: 'text',
    text: `[ 本期 ${thurDay} 開放幫朋友報名囉 ]`,
  }];

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': GROUP_ID,
      'messages': replyMessage,
    }),
  });
}

// Hook call by Google App Script Trigger
function doReset() {
  const sheet = _openSheet();
  sheet.getDataRange().clearContent();

  const thurDay = _getThurDate();

  const replyMessage = [{
    type: 'text',
    text: `[ 本期 ${thurDay} 開放報名 ]`,
  }];

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': GROUP_ID,
      'messages': replyMessage,
    }),
  });
};

function _getUsername(eventType, userId, groupId) {
  let nameUrl;
  switch (eventType) {
    case "user":
      nameUrl = "https://api.line.me/v2/bot/profile/" + userId;
      break;
    case "group":
      nameUrl = "https://api.line.me/v2/bot/group/" + groupId + "/member/" + userId;
      break;
  }

  try {
    //  呼叫 LINE User Info API，以 user ID 取得該帳號的使用者名稱
    const response = UrlFetchApp.fetch(nameUrl, {
      "method": "GET",
      "headers": {
        "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
    });
    const namedata = JSON.parse(response);
    return namedata.displayName;
  }
  catch {
    return "not avaliable";
  }
}

function _sendResponse(replyToken, msg) {
  const url = 'https://api.line.me/v2/bot/message/reply';
  const replyMessage = [{
    "type": "text",
    "text": msg
  }];
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': replyMessage,
    }),
  });
}

function doPost(e) {
  const msg = JSON.parse(e.postData.contents);

  const replyToken = msg.events[0].replyToken;
  const userId = msg.events[0].source.userId;
  const groupId = msg.events[0].source.groupId;
  const userMessage = msg.events[0].message.text;
  const eventType = msg.events[0].source.type;
  const username = _getUsername(eventType, userId, groupId);

  if (typeof replyToken === 'undefined') {
    return;
  };

  _LogToSheet(username, replyToken, userMessage);
  if ((found = [...userMessage.matchAll(ADD_REX)]).length > 0) {
    /* ADD */
    const resp = _addToSheet(username, parseInt(found[0][1]));
    _sendResponse(replyToken, resp.msg);

  } else if ((found = [...userMessage.matchAll(REMOVE_REX)]).length > 0) {
    /* Remove */
    const resp = _removeFromList(username, parseInt(found[0][1]));
    _sendResponse(replyToken, resp.msg);

  } else if (userMessage === '名單') {
    const reserveList = _getReserveList();

    let msg = `[ 本周 ${_getThurDate()} 打球名單 ]\n已報名人數: ${reserveList.length}\n`;
    reserveList.forEach((name, idx) => {
      msg += `${idx + 1}. ${name}\n`;
    });
    _sendResponse(replyToken, msg);

  } else {
  }
}