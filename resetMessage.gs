// Reset message strings and constants
const RESET_MSG_NOTIFY_SIGNUP_OPEN = '本期 %s 開放報名';

const RESET_POSTBACK_DATA_ADD = 'action=add';
const RESET_POSTBACK_DATA_REMOVE = 'action=remove';
const RESET_POSTBACK_DATA_LIST = 'action=list';

const RESET_FLEX_HERO_IMAGE_URL = 'https://developers-resource.landpress.line.me/fx/img/01_1_cafe.png';
const RESET_FLEX_ASPECT_RATIO = '20:13';
const RESET_FLEX_PLACE_LABEL = 'Place';
const RESET_FLEX_PLACE_VALUE = '貓球俱樂部';
const RESET_FLEX_TIME_LABEL = 'Time';
const RESET_FLEX_TIME_VALUE = '19:00 - 22:00';
const RESET_FLEX_SUBTITLE = 'Sign-up Now Open';
const RESET_FLEX_JOIN_BUTTON_LABEL = '🏐 Join';
const RESET_FLEX_CANCEL_BUTTON_LABEL = '❌ Cancel';
const RESET_FLEX_LIST_BUTTON_LABEL = '📋 Player List';

function _buildResetReplyMessage(thurDay) {
  return [{
    type: 'flex',
    altText: Utilities.formatString(RESET_MSG_NOTIFY_SIGNUP_OPEN, thurDay),
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: RESET_FLEX_HERO_IMAGE_URL,
        size: 'full',
        aspectRatio: RESET_FLEX_ASPECT_RATIO,
        aspectMode: 'cover',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: Utilities.formatString(RESET_MSG_NOTIFY_SIGNUP_OPEN, thurDay),
            weight: 'bold',
            size: 'xl',
          },
          {
            type: 'text',
            text: RESET_FLEX_SUBTITLE,
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: RESET_FLEX_PLACE_LABEL,
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: RESET_FLEX_PLACE_VALUE,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: RESET_FLEX_TIME_LABEL,
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 1,
                  },
                  {
                    type: 'text',
                    text: RESET_FLEX_TIME_VALUE,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5,
                  },
                ],
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'link',
            height: 'sm',
            action: {
              type: 'postback',
              label: RESET_FLEX_JOIN_BUTTON_LABEL,
              data: RESET_POSTBACK_DATA_ADD,
            },
          },
          {
            type: 'button',
            style: 'link',
            height: 'sm',
            action: {
              type: 'postback',
              label: RESET_FLEX_CANCEL_BUTTON_LABEL,
              data: RESET_POSTBACK_DATA_REMOVE,
            },
          },
          {
            type: 'button',
            style: 'link',
            height: 'sm',
            action: {
              type: 'postback',
              label: RESET_FLEX_LIST_BUTTON_LABEL,
              data: RESET_POSTBACK_DATA_LIST,
            },
          },
        ],
        flex: 0,
      },
    },
  }];
}
