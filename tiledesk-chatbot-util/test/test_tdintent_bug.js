var assert = require('assert');
const { TiledeskChatbotUtil } = require('..');

/********************************
 * NEW BUTTON, tdButton TAG
 ********************************/



describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of tdIntent buttons', function() {
        it('should return an Intent button (aka Action button with show_echo = true)', function() {
            const text =
`Bene, posso fornirti informazioni, supporto ed assistenza sul PNRR e sui temi di Linea Amica Digitale. Confermi di essere un operatore della PA?

* Sono un operatore della PA tdIntent:menuReception1
* Altro tdIntent:agent_handoff`;
            console.log("parsing text:", text);
            const reply = TiledeskChatbotUtil.parseReply(text);
            console.log("reply:", JSON.stringify(reply));
            // assert(reply.message != null);
            // assert(reply.message.text != null);
            // assert.strictEqual(reply.message.text, 'Intro text');
            // assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_TEXT);
            // assert(reply.message.attributes != null);
            // assert(reply.message.attributes.attachment != null);
            // assert(reply.message.attributes.attachment.buttons != null);
            // assert(reply.message.attributes.attachment.buttons.length == 1);
            // assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_BUTTON_ACTION);
            // assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Action Button with text');
            // assert.strictEqual(reply.message.attributes.attachment.buttons[0].action, 'INTENT-NAME');
            // assert.strictEqual(reply.message.attributes.attachment.buttons[0].show_echo, true);
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

