function _LogToSheet(username, token, msg) {
  const spreadSheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadSheet.getSheetByName(LOG_SHEET_NAME);
  if (!sheet) {
    return;
  }
  const currentListRow = sheet.getLastRow();
  const v = `${username}/${token}: [${msg}]`;
  sheet.getRange(currentListRow + 1, 1, 1).setValue(v);
}

function _openSheet() {
  const spreadSheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadSheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return null;
  }
  return sheet;
}

function _getDayAndHours() {
  const now = Utilities.formatDate(new Date(), TIMEZONE, DATETIME_FORMAT);
  const taipeiNow = new Date(now);
  return { day: taipeiNow.getDay(), hours: taipeiNow.getHours() };
};

function _getThurDate() {
  const nowStr = Utilities.formatDate(new Date(), TIMEZONE, DATETIME_FORMAT);
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
    return { msg: MSG_INPUT_ADD_INVALID };
  }
  const sheet = _openSheet();
  if (!sheet) {
    return { msg: MSG_SHEET_NOT_FOUND };
  }

  const currentListRow = sheet.getLastRow();
  if (currentListRow === MAX_NUMBERS_OF_MEMBERS) {
    return { msg: REACHED_MAXIMUM_OPACITY };
  }

  const { day, hours } = _getDayAndHours();
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
  let msg = Utilities.formatString(MSG_SIGNUP_SUCCESS, username, addableNumber, totalCount);
  if (totalCount === MAX_NUMBERS_OF_MEMBERS) {
    msg += `\n${Utilities.formatString(MSG_WEEKLY_FULL, MAX_NUMBERS_OF_MEMBERS)}`;
  }
  return { msg };
}

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
    return { msg: MSG_INPUT_REMOVE_INVALID };
  }
  const sheet = _openSheet();
  if (!sheet) {
    return { msg: MSG_SHEET_NOT_FOUND };
  }
  let i;
  for (i = 0; i < number; i++) {
    const list = _getReserveList();
    const idx = list.findIndex(item => item === username);
    if (idx === -1) {
      break;
    }
    sheet.deleteRow(idx + 1);
  }
  return { msg: Utilities.formatString(MSG_REMOVE_SUCCESS, username, i, sheet.getLastRow()) };
}

function doNotifyFriendsAddable() {
  const thurDay = _getThurDate();
  const replyMessage = [{
    type: 'text',
    text: Utilities.formatString(MSG_NOTIFY_FRIEND_ADDABLE, thurDay),
  }];

  UrlFetchApp.fetch(LINE_PUSH_API_URL, {
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

function doReset() {
  const sheet = _openSheet();
  sheet.getDataRange().clearContent();

  const thurDay = _getThurDate();
  const replyMessage = _buildResetReplyMessage(thurDay);

  UrlFetchApp.fetch(LINE_PUSH_API_URL, {
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
    case EVENT_TYPE_USER:
      nameUrl = LINE_USER_PROFILE_API_URL + userId;
      break;
    case EVENT_TYPE_GROUP:
      nameUrl = LINE_GROUP_PROFILE_API_PREFIX + groupId + LINE_GROUP_PROFILE_API_MEMBER_PATH + userId;
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
    const namedata = JSON.parse(response.getContentText());
    return namedata.displayName;
  }
  catch {
    return MSG_USERNAME_UNAVAILABLE;
  }
}

function _sendResponse(replyToken, msg) {
  const url = LINE_REPLY_API_URL;
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

function _buildReserveListMessage() {
  const reserveList = _getReserveList();
  const thurDay = _getThurDate();
  let listMsg = Utilities.formatString(MSG_LIST_HEADER, thurDay, reserveList.length);
  reserveList.forEach((name, idx) => {
    listMsg += `${idx + 1}. ${name}\n`;
  });
  return listMsg;
}

function _getPostbackAction(postbackData) {
  if (!postbackData) {
    return '';
  }

  const raw = String(postbackData).trim();
  const lowerRaw = raw.toLowerCase();
  if (lowerRaw === POSTBACK_ACTION_ADD || lowerRaw === POSTBACK_ACTION_REMOVE || lowerRaw === POSTBACK_ACTION_LIST) {
    return lowerRaw;
  }

  // Support JSON style payloads like {"action":"add"}
  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      const obj = JSON.parse(raw);
      if (obj && obj.action) {
        return String(obj.action).trim().toLowerCase();
      }
    } catch {
    }
  }

  const parts = raw.split('&');
  for (let i = 0; i < parts.length; i++) {
    const kv = parts[i].split('=');
    if (kv[0] === 'action') {
      return kv[1] ? decodeURIComponent(kv[1]).trim().toLowerCase() : '';
    }
  }
  return '';
}

function _handlePostBack(replyToken, username, postbackData) {
  const action = _getPostbackAction(postbackData);

  if (action === POSTBACK_ACTION_ADD) {
    const resp = _addToSheet(username, 1);
    _sendResponse(replyToken, resp && resp.msg ? resp.msg : MSG_POSTBACK_ADD_FAILED);

  } else if (action === POSTBACK_ACTION_REMOVE) {
    const resp = _removeFromList(username, 1);
    _sendResponse(replyToken, resp && resp.msg ? resp.msg : MSG_POSTBACK_REMOVE_FAILED);

  } else if (action === POSTBACK_ACTION_LIST) {
    _sendResponse(replyToken, _buildReserveListMessage());
  } else {
    _sendResponse(replyToken, `${MSG_UNKNOWN_POSTBACK_PREFIX}${postbackData}`);
  }
}

function _handleMessage(replyToken, username, userMessage) {
  if (([...userMessage.matchAll(ADD_REX)]).length > 0) {
    /* Add */
    const found = [...userMessage.matchAll(ADD_REX)];
    const resp = _addToSheet(username, parseInt(found[0][1], 10));
    _sendResponse(replyToken, resp.msg);

  } else if (([...userMessage.matchAll(REMOVE_REX)]).length > 0) {
    /* Remove */
    const found = [...userMessage.matchAll(REMOVE_REX)];
    const resp = _removeFromList(username, parseInt(found[0][1], 10));
    _sendResponse(replyToken, resp.msg);

  } else if (userMessage === COMMAND_LIST) {
    /* List */
    _sendResponse(replyToken, _buildReserveListMessage());
  }
}

function doPost(e) {
  const msg = JSON.parse(e.postData.contents);
  const event = msg.events && msg.events[0];

  if (!event || typeof event.replyToken === 'undefined') {
    return;
  }

  const replyToken = event.replyToken;
  const userId = event.source && event.source.userId;
  const groupId = event.source && event.source.groupId;
  const userMessage = event.message && event.message.type === MESSAGE_TYPE_TEXT ? event.message.text : '';
  const postbackData = event.postback && event.postback.data ? event.postback.data : '';
  const eventType = event.source && event.source.type;
  const username = _getUsername(eventType, userId, groupId);
  _LogToSheet(username, replyToken, postbackData || userMessage);

  if (event.type === EVENT_TYPE_POSTBACK) {
    _handlePostBack(replyToken, username, postbackData);
  } else if (event.type === EVENT_TYPE_MESSAGE && event.message && event.message.type === MESSAGE_TYPE_TEXT) {
    _handleMessage(replyToken, username, userMessage);
  }
}