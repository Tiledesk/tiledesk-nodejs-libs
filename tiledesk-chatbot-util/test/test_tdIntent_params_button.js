var assert = require('assert');
const { TiledeskChatbotUtil } = require('..');

/********************************
 * test_tdIntent_params_button
 ********************************/

describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of tdIntent{WITH-PARAMS} buttons', function() {
        it('should return an Intent button (aka Action button with show_echo = true)', function() {
            const text = `Il primo test di psicologia fu realizzato da:
* [A] Simon tdIntent:question1_eval{'question1points': 0}
* [B] Binet tdIntent:question1_eval{'question1points': 10}`
            console.log("parsing text:", text);
            const reply = TiledeskChatbotUtil.parseReply(text);
            console.log("reply:", JSON.stringify(reply));
            assert(reply.message != null);
            assert(reply.message.text != null);
            assert.strictEqual(reply.message.text, 'Il primo test di psicologia fu realizzato da:');
            assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_TEXT);
            assert(reply.message.attributes != null);
            assert(reply.message.attributes.attachment != null);
            assert(reply.message.attributes.attachment.buttons != null);
            assert(reply.message.attributes.attachment.buttons.length == 2);
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_BUTTON_ACTION);
            // assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Action Button with text');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].action, 'question1_eval{\'question1points\': 0}');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].show_echo, true);
            assert.strictEqual(reply.message.attributes.attachment.buttons[1].action, 'question1_eval{\'question1points\': 10}');
            // MESSAGE:
            // {
            //     "message": {
            //         "text": "Intro text",
            //         "type": "text",
            //         "attributes": {
            //             "attachment": {
            //                 "type": "template",
            //                 "buttons": [{
            //                     "type": "action",
            //                     "value": "Action Button with text",
            //                     "action": "ACTION-CALLBACK-NAME",
            //                     "show_echo": true
            //                 }]
            //             }
            //         }
            //     }
            // }
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of tdIntent{WITH-PARAMS} buttons with spaces', function() {
        it('should return an Intent button (aka Action button with show_echo = true)', function() {
            const text = `Il primo test di psicologia fu realizzato da:
* [A] Simon tdIntent:    question1_eval{'question1points': 0}  
* [B] Binet tdIntent: question1_eval{'question1points': 10}`
            console.log("parsing text:", text);
            const reply = TiledeskChatbotUtil.parseReply(text);
            console.log("reply:", JSON.stringify(reply));
            assert(reply.message != null);
            assert(reply.message.text != null);
            assert.strictEqual(reply.message.text, 'Il primo test di psicologia fu realizzato da:');
            assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_TEXT);
            assert(reply.message.attributes != null);
            assert(reply.message.attributes.attachment != null);
            assert(reply.message.attributes.attachment.buttons != null);
            assert(reply.message.attributes.attachment.buttons.length == 2);
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_BUTTON_ACTION);
            // assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Action Button with text');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].action, 'question1_eval{\'question1points\': 0}');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].show_echo, true);
            assert.strictEqual(reply.message.attributes.attachment.buttons[1].action, 'question1_eval{\'question1points\': 10}');
            // MESSAGE:
            // {
            //     "message": {
            //         "text": "Intro text",
            //         "type": "text",
            //         "attributes": {
            //             "attachment": {
            //                 "type": "template",
            //                 "buttons": [{
            //                     "type": "action",
            //                     "value": "Action Button with text",
            //                     "action": "ACTION-CALLBACK-NAME",
            //                     "show_echo": true
            //                 }]
            //             }
            //         }
            //     }
            // }
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of tdIntent buttons', function() {
        it('should return an Intent button (aka Action button with show_echo = true)', function() {
            const text = 'Intro text\n* Action Button with text tdIntent:INTENT-NAME';
            console.log("parsing text:", text);
            const reply = TiledeskChatbotUtil.parseReply(text);
            console.log("reply:", JSON.stringify(reply));
            assert(reply.message != null);
            assert(reply.message.text != null);
            assert.strictEqual(reply.message.text, 'Intro text');
            assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_TEXT);
            assert(reply.message.attributes != null);
            assert(reply.message.attributes.attachment != null);
            assert(reply.message.attributes.attachment.buttons != null);
            assert(reply.message.attributes.attachment.buttons.length == 1);
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_BUTTON_ACTION);
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Action Button with text');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].action, 'INTENT-NAME');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].show_echo, true);
            // MESSAGE:
            // {
            //     "message": {
            //         "text": "Intro text",
            //         "type": "text",
            //         "attributes": {
            //             "attachment": {
            //                 "type": "template",
            //                 "buttons": [{
            //                     "type": "action",
            //                     "value": "Action Button with text",
            //                     "action": "ACTION-CALLBACK-NAME",
            //                     "show_echo": true
            //                 }]
            //             }
            //         }
            //     }
            // }
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of tdIntent buttons with spaces', function() {
        it('should return an Intent button (aka Action button with show_echo = true)', function() {
            const text = 'Intro text\n* Action Button with text    tdIntent:  INTENT-NAME  ';
            console.log("parsing text:", text);
            const reply = TiledeskChatbotUtil.parseReply(text);
            console.log("reply:", JSON.stringify(reply));
            assert(reply.message != null);
            assert(reply.message.text != null);
            assert.strictEqual(reply.message.text, 'Intro text');
            assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_TEXT);
            assert(reply.message.attributes != null);
            assert(reply.message.attributes.attachment != null);
            assert(reply.message.attributes.attachment.buttons != null);
            assert(reply.message.attributes.attachment.buttons.length == 1);
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_BUTTON_ACTION);
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Action Button with text');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].action, 'INTENT-NAME');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].show_echo, true);
            // MESSAGE:
            // {
            //     "message": {
            //         "text": "Intro text",
            //         "type": "text",
            //         "attributes": {
            //             "attachment": {
            //                 "type": "template",
            //                 "buttons": [{
            //                     "type": "action",
            //                     "value": "Action Button with text",
            //                     "action": "ACTION-CALLBACK-NAME",
            //                     "show_echo": true
            //                 }]
            //             }
            //         }
            //     }
            // }
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of tdIntentNoEcho buttons', function() {
        it('should return an Intent button (aka Action button with show_echo = false) with no echo text', function() {
            const text = 'Intro text\n* Action Button with text tdIntentNoEcho:INTENT-NAME';
            console.log("parsing text:", text);
            const reply = TiledeskChatbotUtil.parseReply(text);
            console.log("reply:", JSON.stringify(reply));
            assert(reply.message != null);
            assert(reply.message.text != null);
            assert.strictEqual(reply.message.text, 'Intro text');
            assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_TEXT);
            assert(reply.message.attributes != null);
            assert(reply.message.attributes.attachment != null);
            assert(reply.message.attributes.attachment.buttons != null);
            assert(reply.message.attributes.attachment.buttons.length == 1);
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_BUTTON_ACTION);
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Action Button with text');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].action, 'INTENT-NAME');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].show_echo, false);
            // MESSAGE:
            // {
            //     "message": {
            //         "text": "Intro text",
            //         "type": "text",
            //         "attributes": {
            //             "attachment": {
            //                 "type": "template",
            //                 "buttons": [{
            //                     "type": "action",
            //                     "value": "Action Button with text",
            //                     "action": "INTENT-NAME",
            //                     "show_echo": false
            //                 }]
            //             }
            //         }
            //     }
            // }
        });
    });
});