var assert = require('assert');
const { TiledeskChatbotUtil } = require('..');

/***************************
 ********* LEGACY IMAGE ****
 ***************************/

/**
  * legacy \image
  */
 describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of legacy \image', function() {
        it('should return an image message', function() {
            // const cbutil = new TiledeskChatbotUtil();
            const text = "Intro text\n\\image:http://IMAGE_HOST/IMAGE_PATH";
            console.log("legacy images parsing text:", text);
            const reply = TiledeskChatbotUtil.parseReply(text);
            console.log("legacy images reply:", JSON.stringify(reply));
            assert(reply.message != null);
            assert(reply.message.text != null);
            assert.strictEqual(reply.message.text, 'Intro text');
            assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_IMAGE);
            assert(reply.message.metadata != null);
            assert.strictEqual(reply.message.metadata.src, 'http://IMAGE_HOST/IMAGE_PATH');
            assert.strictEqual(reply.message.metadata.width, 200);
            assert.strictEqual(reply.message.metadata.height, 200);
        });
    });
});