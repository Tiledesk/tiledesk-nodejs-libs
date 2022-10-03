var assert = require('assert');
const { TiledeskChatbotUtil } = require('..');

/************************
 * UTILS
 ************************/

 /**
  * is_agent_handoff_command()
  */
 describe('TiledeskChatbotUtil', function() {
    describe('is_agent_handoff_command()', function() {
        it('should return agent_handoff null', function() {
            const msg = {
                'text': 'Switching to \nagent'
            };
            const info = TiledeskChatbotUtil.is_agent_handoff_command(msg);
            console.log("info:", JSON.stringify(info));
            assert(info.agent_handoff === null);
            assert.strictEqual(info.text, 'Switching to \nagent');
        });
    });
});

/**
  * is_agent_handoff_command() with agent
  */
 describe('TiledeskChatbotUtil', function() {
    describe('is_agent_handoff_command()', function() {
        it('should return agent_handoff != null', function() {
            const msg = {
                'text': 'Switching to agent\n\\agent'
            };
            const info = TiledeskChatbotUtil.is_agent_handoff_command(msg);
            console.log("info:", JSON.stringify(info));
            assert.strictEqual(info.text, 'Switching to agent');
            assert.strictEqual(info.agent_handoff, TiledeskChatbotUtil.AGENT_DIRECTIVE);
        });
    });
});

/**
  * is_agent_handoff_command() with agent
  */
 describe('TiledeskChatbotUtil', function() {
    describe('is_agent_handoff_command()', function() {
        it('should return agent_handoff != null', function() {
            const msg = {
                'text': 'Switching to agent\n\\agent\nTEXT AFTER COMMAND WILL BE IGNORED!'
            };
            const info = TiledeskChatbotUtil.is_agent_handoff_command(msg);
            console.log("info:", JSON.stringify(info));
            assert.strictEqual(info.text, 'Switching to agent');
            assert.strictEqual(info.agent_handoff, TiledeskChatbotUtil.AGENT_DIRECTIVE);
        });
    });
});

/**
  * is_agent_handoff_command() with agent
  */
 describe('TiledeskChatbotUtil', function() {
    describe('is_agent_handoff_command()', function() {
        it('should return agent_handoff = null', function() {
            const msg = {
                'text': 'Switching to agent\nTEXT BEFORE INVALIDATE COMMAND\\agent\nTEXT AFTER COMMAND WILL BE IGNORED!'
            };
            const info = TiledeskChatbotUtil.is_agent_handoff_command(msg);
            console.log("info:", JSON.stringify(info));
            assert.strictEqual(info.text, 'Switching to agent\nTEXT BEFORE INVALIDATE COMMAND\\agent\nTEXT AFTER COMMAND WILL BE IGNORED!');
            assert.strictEqual(info.agent_handoff, null);
        });
    });
});

/**
  * is_agent_handoff_command() with agent
  */
describe('TiledeskChatbotUtil', function() {
    describe('This messae only contains the command', function() {
        it('should return agent_handoff != null', function() {
            const msg = {
                'text': '\\agent'
            };
            const command = TiledeskChatbotUtil.is_agent_handoff_command(msg);
            console.log("info:", JSON.stringify(command));
            assert.strictEqual(command.text, '');
            assert.strictEqual(command.agent_handoff, TiledeskChatbotUtil.AGENT_DIRECTIVE);
        });
    });
});
