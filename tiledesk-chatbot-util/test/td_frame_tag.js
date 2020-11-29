var assert = require('assert');
const { TiledeskChatbotUtil } = require('..');

/************************
 * IFRAMES
 ************************/

 /**
  * https
  */
 describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of tdFrame with https://FRAME_URL', function() {
        it('should return an frame message', function() {
            // const cbutil = new TiledeskChatbotUtil();
            const text = "Intro text\ntdFrame:https://FRAME_HOST/PATH";
            console.log("parsing text:", text);
            const reply = TiledeskChatbotUtil.parseReply(text);
            console.log("reply:", JSON.stringify(reply));
            assert(reply.message != null);
            assert(reply.message.text != null);
            assert.strictEqual(reply.message.text, 'Intro text');
            assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_FRAME);
            assert(reply.message.metadata != null);
            assert.strictEqual(reply.message.metadata.src, 'https://FRAME_HOST/PATH');
            // MESSAGE:
            // {
            //     "message": {
            //         "text": "Intro text",
            //         "type": "image",
            //         "metadata": {
            //             "src": "IMAGE_URL"
            //         }
            //     }
            // }
        });
    });
});
