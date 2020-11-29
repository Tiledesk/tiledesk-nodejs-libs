var assert = require('assert');
const { TiledeskChatbotUtil } = require('..');

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
//  * NEW BUTTON, tdButton TAG
//  ********************************/

// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdButton', function() {
//         it('should return an intro text with a couple of buttons', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = 'Intro text\ntdButton:Button 1\ntdButton:Button 2';
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

// /********************************
//  * BUTTON: tdButton, TYPE LINK
//  ********************************/

// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdLink buttons', function() {
//         it('should return a link.BLANK button (tdLink default to BLANK)', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = 'Intro text\ntdButton:Button with text tdLink:http://www.google.com';
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
//     describe('parseReply() of tdLinkBlank buttons', function() {
//         it('should return a link.BLANK button', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = 'Intro text\n*Button with text tdLinkBlank:http://www.google.com';
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

// /************************
//  * IFRAMES
//  ************************/

//  /**
//   * https
//   */
//  describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdFrame with https://FRAME_URL', function() {
//         it('should return an frame message', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = "Intro text\ntdFrame:https://FRAME_HOST/PATH";
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_FRAME);
//             assert(reply.message.metadata != null);
//             assert.strictEqual(reply.message.metadata.src, 'https://FRAME_HOST/PATH');
//             // MESSAGE:
//             // {
//             //     "message": {
//             //         "text": "Intro text",
//             //         "type": "image",
//             //         "metadata": {
//             //             "src": "IMAGE_URL"
//             //         }
//             //     }
//             // }
//         });
//     });
// });

// /************************
//  * IMAGES
//  ************************/

//  /**
//   * https
//   */
// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdImage with https://IMAGE_URL', function() {
//         it('should return an image message', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = "Intro text\ntdImage:https://IMAGE_HOST/IMAGE_PATH";
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_IMAGE);
//             assert(reply.message.metadata != null);
//             assert.strictEqual(reply.message.metadata.src, 'https://IMAGE_HOST/IMAGE_PATH');
//             // MESSAGE:
//             // {
//             //     "message": {
//             //         "text": "Intro text",
//             //         "type": "image",
//             //         "metadata": {
//             //             "src": "IMAGE_URL"
//             //         }
//             //     }
//             // }
//         });
//     });
// });

// /**
//   * http
//   */
// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdImage with http://IMAGE_URL', function() {
//         it('should return an image message', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = "Intro text\ntdImage:http://IMAGE_HOST/IMAGE_PATH";
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_IMAGE);
//             assert(reply.message.metadata != null);
//             assert.strictEqual(reply.message.metadata.src, 'http://IMAGE_HOST/IMAGE_PATH');
//         });
//     });
// });

// /**
//   * image width-height
//   */
// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdImage with width and height', function() {
//         it('should return an image message', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = "Intro text\ntdImage,w200 h400:http://IMAGE_HOST/IMAGE_PATH";
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_IMAGE);
//             assert(reply.message.metadata != null);
//             assert.strictEqual(reply.message.metadata.src, 'http://IMAGE_HOST/IMAGE_PATH');
//             assert.strictEqual(reply.message.metadata.width, 200);
//             assert.strictEqual(reply.message.metadata.height, 400);
//         });
//     });
// });

// /**
//   * image width only
//   */
// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdImage - width only', function() {
//         it('should return an image message', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = "Intro text\ntdImage, w200:http://IMAGE_HOST/IMAGE_PATH";
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_IMAGE);
//             assert(reply.message.metadata != null);
//             assert.strictEqual(reply.message.metadata.src, 'http://IMAGE_HOST/IMAGE_PATH');
//             assert.strictEqual(reply.message.metadata.width, 200);
//             assert.strictEqual(reply.message.metadata.height, undefined);
//         });
//     });
// });

// /**
//   * image height only
//   */
// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdImage - height only', function() {
//         it('should return an image message', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = "Intro text\ntdImage , h300:http://IMAGE_HOST/IMAGE_PATH";
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_IMAGE);
//             assert(reply.message.metadata != null);
//             assert.strictEqual(reply.message.metadata.src, 'http://IMAGE_HOST/IMAGE_PATH');
//             assert.strictEqual(reply.message.metadata.width, undefined);
//             assert.strictEqual(reply.message.metadata.height, 300);
//         });
//     });
// });


/***************************
 ********* LEGACY IMAGE ****
 ***************************/

// /**
//   * legacy \image
//   */
// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of legacy \image', function() {
//         it('should return an image message', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = "Intro text\n\\image:http://IMAGE_HOST/IMAGE_PATH";
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_IMAGE);
//             assert(reply.message.metadata != null);
//             assert.strictEqual(reply.message.metadata.src, 'http://IMAGE_HOST/IMAGE_PATH');
//             assert.strictEqual(reply.message.metadata.width, 200);
//             assert.strictEqual(reply.message.metadata.height, 200);
//         });
//     });
// });

// /**
//   * legacy image and bullet buttons combined 
//   */
// describe('TiledeskChatbotUtil', function() {
//     describe('parseReply() of tdImage and bullet buttons', function() {
//         it('should return an image message', function() {
//             // const cbutil = new TiledeskChatbotUtil();
//             const text = "Intro text\ntdImage,w200 h400:http://IMAGE_HOST/IMAGE_PATH\n*Button1\n*button2";
//             console.log("parsing text:", text);
//             const reply = TiledeskChatbotUtil.parseReply(text);
//             console.log("reply:", JSON.stringify(reply));
//             assert(reply.message != null);
//             assert(reply.message.text != null);
//             assert.strictEqual(reply.message.text, 'Intro text');
//             assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_IMAGE);
//             assert(reply.message.metadata != null);
//             assert.strictEqual(reply.message.metadata.src, 'http://IMAGE_HOST/IMAGE_PATH');
//             assert.strictEqual(reply.message.metadata.width, 200);
//             assert.strictEqual(reply.message.metadata.height, 400);
//         });
//     });
// });

