// var assert = require('assert');
// const { TiledeskChatbotUtil } = require('..');

// /********************************
//  * LEGACY BULLET BUTTONS. NOW DEPRECATED, WHILE STILL SUPPORTED, THEY ARE NOT DOCUMENTED.
//  ********************************/

// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of basic bullet buttons', function() {
//         it('should return an intro text with a couple of buttons', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = 'Intro text\n*Button 1\n*Button 2';
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_TEXT);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert(reply.message.attributes != null);
//             assert(reply.message.attributes.attachment != null);
//             assert(reply.message.attributes.attachment.type != null);
//             assert.strictEqual(reply.message.attributes.attachment.type, 'template');
//             assert(reply.message.attributes.attachment.buttons != null);
//             assert(reply.message.attributes.attachment.buttons.length == 2);
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_BUTTON_TEXT);
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Button 1');
//             assert.strictEqual(reply.message.attributes.attachment.buttons[1].type, TiledeskChatbotUtil.TYPE_BUTTON_TEXT);
//             assert.strictEqual(reply.message.attributes.attachment.buttons[1].value, 'Button 2');
            
//             // MESSAGE:
//             // {
//             //     "message": {
//             //         "text": "Intro text",
//             //         "type": "text",
//             //         "attributes": {
//             //             "attachment": {
//             //                 "type": "template",
//             //                 "buttons": [{
//             //                     "type": "text",
//             //                     "value": "Button 1"
//             //                 }, {
//             //                     "type": "text",
//             //                     "value": "Button 2"
//             //                 }]
//             //             }
//             //         }
//             //     }
//             // }
//         });
//     });
// });

// /********************************
//  * BUTTON: LEGACY BULLET BUTTON, TYPE LINK
//  ********************************/

// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdLink buttons', function() {
//         it('should return a link.BLANK button (tdLink default to BLANK)', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = 'Intro text\n*Button with text tdLink:http://www.google.com';
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_TEXT);
//             assert(reply.message.attributes != null);
//             assert(reply.message.attributes.attachment != null);
//             assert(reply.message.attributes.attachment.buttons != null);
//             assert(reply.message.attributes.attachment.buttons.length == 1);
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_BUTTON_URL);
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Button with text');
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].link, 'http://www.google.com');
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].target, TiledeskChatbotUtil.TARGET_BUTTON_LINK_BLANK);
//             // MESSAGE:
//             // {
//             //     "message": {
//             //         "text": "Intro text",
//             //         "type": "text",
//             //         "attributes": {
//             //             "attachment": {
//             //                 "type": "template",
//             //                 "buttons": [{
//             //                     "type": "url",
//             //                     "value": "Button with text",
//             //                     "link": "http://www.google.com",
//             //                     "target": "blank"
//             //                 }]
//             //             }
//             //         }
//             //     }
//             // }
//         });
//     });
// });

// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdLinkParent buttons', function() {
//         it('should return a link.PARENT button', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = 'Intro text\n*Button with text tdLinkParent:http://www.google.com';
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_TEXT);
//             assert(reply.message.attributes != null);
//             assert(reply.message.attributes.attachment != null);
//             assert(reply.message.attributes.attachment.buttons != null);
//             assert(reply.message.attributes.attachment.buttons.length == 1);
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_BUTTON_URL);
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Button with text');
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].link, 'http://www.google.com');
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].target, TiledeskChatbotUtil.TARGET_BUTTON_LINK_PARENT);
//             // MESSAGE:
//             // {
//             //     "message": {
//             //         "text": "Intro text",
//             //         "type": "text",
//             //         "attributes": {
//             //             "attachment": {
//             //                 "type": "template",
//             //                 "buttons": [{
//             //                     "type": "url",
//             //                     "value": "Button with text",
//             //                     "link": "http://www.google.com",
//             //                     "target": "parent"
//             //                 }]
//             //             }
//             //         }
//             //     }
//             // }
            
//         });
//     });
// });

// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdAction buttons', function() {
//         it('should return a Action button with show_reply = false', function() {
//             const text = 'Intro text\n* Action Button with text tdAction:ACTION-CALLBACK-NAME';
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_TEXT);
//             assert(reply.message.attributes != null);
//             assert(reply.message.attributes.attachment != null);
//             assert(reply.message.attributes.attachment.buttons != null);
//             assert(reply.message.attributes.attachment.buttons.length == 1);
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_BUTTON_ACTION);
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Action Button with text');
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].action, 'ACTION-CALLBACK-NAME');
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].show_reply, false);
//             // MESSAGE:
//             // {
//             //     "message": {
//             //         "text": "Intro text",
//             //         "type": "text",
//             //         "attributes": {
//             //             "attachment": {
//             //                 "type": "template",
//             //                 "buttons": [{
//             //                     "type": "action",
//             //                     "value": "Action Button with text",
//             //                     "action": "ACTION-CALLBACK-NAME",
//             //                     "show_reply": false
//             //                 }]
//             //             }
//             //         }
//             //     }
//             // }
//         });
//     });
// });

// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdAction buttons', function() {
//         it('should return a Action button with show_reply = true', function() {
//             const text = 'Intro text\n* Action Button with text tdActionShowReply:ACTION-CALLBACK-NAME';
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_TEXT);
//             assert(reply.message.attributes != null);
//             assert(reply.message.attributes.attachment != null);
//             assert(reply.message.attributes.attachment.buttons != null);
//             assert(reply.message.attributes.attachment.buttons.length == 1);
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_BUTTON_ACTION);
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Action Button with text');
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].action, 'ACTION-CALLBACK-NAME');
//             assert.strictEqual(reply.message.attributes.attachment.buttons[0].show_reply, true);
//             // MESSAGE:
//             // {
//             //     "message": {
//             //         "text": "Intro text",
//             //         "type": "text",
//             //         "attributes": {
//             //             "attachment": {
//             //                 "type": "template",
//             //                 "buttons": [{
//             //                     "type": "action",
//             //                     "value": "Action Button with text",
//             //                     "action": "ACTION-CALLBACK-NAME",
//             //                     "show_reply": true
//             //                 }]
//             //             }
//             //         }
//             //     }
//             // }
//         });
//     });
// });