// Project constants
const MAX_NUMBERS_OF_MEMBERS = 18;
const ADD_REX = /^\+(\d+)$/g;
const REMOVE_REX = /^\-(\d+)$/g;
const TIMEZONE = 'Asia/Taipei';
const DATETIME_FORMAT = 'MMMM dd, yyyy HH:mm:ss Z';

const LINE_PUSH_API_URL = 'https://api.line.me/v2/bot/message/push';
const LINE_REPLY_API_URL = 'https://api.line.me/v2/bot/message/reply';
const LINE_USER_PROFILE_API_URL = 'https://api.line.me/v2/bot/profile/';
const LINE_GROUP_PROFILE_API_PREFIX = 'https://api.line.me/v2/bot/group/';
const LINE_GROUP_PROFILE_API_MEMBER_PATH = '/member/';

const LOG_SHEET_NAME = 'Log';
const EVENT_TYPE_USER = 'user';
const EVENT_TYPE_GROUP = 'group';
const EVENT_TYPE_MESSAGE = 'message';
const EVENT_TYPE_POSTBACK = 'postback';
const MESSAGE_TYPE_TEXT = 'text';

const POSTBACK_ACTION_ADD = 'add';
const POSTBACK_ACTION_REMOVE = 'remove';
const POSTBACK_ACTION_LIST = 'list';
