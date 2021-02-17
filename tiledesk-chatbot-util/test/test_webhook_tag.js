var assert = require('assert');
const { TiledeskChatbotUtil } = require('..');

/***************************
 ***** WEBHOOK \webhook ****
 ***************************/

/**
  * \webhook:URL
  */
 describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of legacy \webhook', function() {
        it('should return a webhook link and the message text', function() {
            // const cbutil = new TiledeskChatbotUtil();
            const text = "Message text\n\\webhook:https://WEBHOOK/ENDPOINT";
            //console.log("legacy images parsing text:", text);
            const reply = TiledeskChatbotUtil.parseReply(text);
            //console.log("legacy images reply:", JSON.stringify(reply));
            assert(reply.message != null);
            assert(reply.message.text != null);
            assert.strictEqual(reply.message.text, 'Message text');
            assert(reply.webhook , "https://WEBHOOK/ENDPOINT");
        });
    });
});

/**
  * \webhook = true
  */
 describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of legacy \webhook', function() {
        it('should return "webhook == true" and the message text', function() {
            // const cbutil = new TiledeskChatbotUtil();
            const text = "Message text\n\\webhook";
            //console.log("legacy images parsing text:", text);
            const reply = TiledeskChatbotUtil.parseReply(text);
            assert(reply.message != null);
            assert(reply.message.text != null);
            assert.strictEqual(reply.message.text, 'Message text');
            assert(reply.webhook === true);
        });
    });
});