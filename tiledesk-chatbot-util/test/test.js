var assert = require('assert');
const { TiledeskChatbotUtil } = require('..');

describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of basic buttons', function() {
        it('should return an intro text with a couple of buttons', function() {
            // const cbutil = new TiledeskChatbotUtil();
            const text = 'Intro text\n*Button 1\n*Button 2';
            console.log("parsing text:", text);
            const reply = TiledeskChatbotUtil.parseReply(text);
            console.log("reply:", JSON.stringify(reply));
            assert(reply.message != null);
            assert(reply.message.text != null);
            assert.strictEqual(reply.message.type, TiledeskChatbotUtil.TYPE_TEXT);
            assert.strictEqual(reply.message.text, 'Intro text');
            assert(reply.message.attributes != null);
            assert(reply.message.attributes.attachment != null);
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of tdLink buttons', function() {
        it('should return a link.BLANK button (tdLink default to BLANK)', function() {
            // const cbutil = new TiledeskChatbotUtil();
            const text = 'Intro text\n*Button with text tdLink:http://www.google.com';
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
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_URL);
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Button with text');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].link, 'http://www.google.com');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].target, TiledeskChatbotUtil.TARGET_BLANK);
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of tdLinkBlank buttons', function() {
        it('should return a link.BLANK button', function() {
            // const cbutil = new TiledeskChatbotUtil();
            const text = 'Intro text\n*Button with text tdLinkBlank:http://www.google.com';
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
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_URL);
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Button with text');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].link, 'http://www.google.com');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].target, TiledeskChatbotUtil.TARGET_BLANK);
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('parseReply() of tdLinkParent buttons', function() {
        it('should return a link.PARENT button', function() {
            // const cbutil = new TiledeskChatbotUtil();
            const text = 'Intro text\n*Button with text tdLinkParent:http://www.google.com';
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
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].type, TiledeskChatbotUtil.TYPE_URL);
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].value, 'Button with text');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].link, 'http://www.google.com');
            assert.strictEqual(reply.message.attributes.attachment.buttons[0].target, TiledeskChatbotUtil.TARGET_PARENT);
        });
    });
});