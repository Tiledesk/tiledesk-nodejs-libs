var assert = require('assert');
const { TiledeskChatbotUtil } = require('..');

/************************
 * /SPLIT
 ************************/

describe('TiledeskChatbotUtil', function() {
    describe('findSplits()', function() {
        it('should return all the splitted messages', function() {
            const text = "Intro text\n\\split:2000\nText2\n\\split\nLast message\n* button";
            console.log("splitting text:", text);
            var commands = TiledeskChatbotUtil.findSplits(text);
            assert(commands != null);
            assert(commands.length == 5);
            console.log("Commands:", commands)
            assert.strictEqual(commands[0].type, TiledeskChatbotUtil.COMMAND_TYPE_MESSAGE);
            assert.strictEqual(commands[0].text, 'Intro text');
            assert.strictEqual(commands[1].type, TiledeskChatbotUtil.COMMAND_TYPE_WAIT);
            assert.strictEqual(commands[1].time, 2000);
            assert.strictEqual(commands[2].type, TiledeskChatbotUtil.COMMAND_TYPE_MESSAGE);
            assert.strictEqual(commands[2].text, 'Text2');
            assert.strictEqual(commands[3].type, TiledeskChatbotUtil.COMMAND_TYPE_WAIT);
            assert.strictEqual(commands[3].time, 1000);
            assert.strictEqual(commands[4].type, TiledeskChatbotUtil.COMMAND_TYPE_MESSAGE);
            assert.strictEqual(commands[4].text, 'Last message\n* button');
            // assert.strictEqual(reply.message.text, 'Intro text');
            // assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_FRAME);
            // assert(reply.message.metadata != null);
            // assert.strictEqual(reply.message.metadata[TiledeskChatbotUtil.FRAME_TYPE_KEY], TiledeskChatbotUtil.TYPE_VIDEO);
            // assert.strictEqual(reply.message.metadata.src, 'https://VIDEO_HOST/PATH');
        });
    });
});

