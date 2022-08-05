var assert = require('assert');
const { TiledeskChatbotUtil } = require('..');

/************************
 * /SPLIT PARS COMMANDS
 ************************/

describe('TiledeskChatbotUtil', function() {
    describe('splitPars() 1', function() {
        it('should return multiple commands', function() {
            const text = "Intro text\n\nsecond message\n\nthird message";
            console.log("splitting text:", text);
            var commands = TiledeskChatbotUtil.splitPars(text.trim());
            console.log("Commands:", commands)
            assert(commands != null);
            assert(commands.length == 5);
            
            assert.strictEqual(commands[0].type, TiledeskChatbotUtil.COMMAND_TYPE_MESSAGE);
            assert.strictEqual(commands[0].message.text, 'Intro text');
            assert.strictEqual(commands[1].type, TiledeskChatbotUtil.COMMAND_TYPE_WAIT);
            assert.strictEqual(commands[1].time, TiledeskChatbotUtil.WAIT_TIME);
            assert.strictEqual(commands[2].type, TiledeskChatbotUtil.COMMAND_TYPE_MESSAGE);
            assert.strictEqual(commands[2].message.text, 'second message');
            assert.strictEqual(commands[3].type, TiledeskChatbotUtil.COMMAND_TYPE_WAIT);
            assert.strictEqual(commands[3].time, TiledeskChatbotUtil.WAIT_TIME);
            assert.strictEqual(commands[4].type, TiledeskChatbotUtil.COMMAND_TYPE_MESSAGE);
            assert.strictEqual(commands[4].message.text, 'third message');
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('splitPars() 2', function() {
        it('should return multiple commands, first is type MESSAGE', function() {
            const text = "\n\nIntro text\n\nsecond message";
            console.log("splitting text 2:", text.trim());
            var commands = TiledeskChatbotUtil.splitPars(text.trim());
            console.log("Commands:", commands)
            console.log("commands[1].type:", commands[1].type)
            assert(commands != null);
            assert(commands.length == 3);
            
            assert.strictEqual(commands[0].type, TiledeskChatbotUtil.COMMAND_TYPE_MESSAGE);
            assert.strictEqual(commands[0].message.text, 'Intro text');
            assert.strictEqual(commands[1].type, TiledeskChatbotUtil.COMMAND_TYPE_WAIT);
            assert.strictEqual(commands[1].time, TiledeskChatbotUtil.WAIT_TIME);
            assert.strictEqual(commands[2].type, TiledeskChatbotUtil.COMMAND_TYPE_MESSAGE);
            assert.strictEqual(commands[2].message.text, 'second message');
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('splitPars() 3', function() {
        it('should return NO commands', function() {
            const text = "One message";
            console.log("splitting text:", text);
            var commands = TiledeskChatbotUtil.splitPars(text.trim());
            console.log("Commands:", commands);
            assert(commands == null);
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('splitPars() 4', function() {
        it('should remove empty paragraphs', function() {
            const text = "\n\n\n\nOne message\n\nSecond Message\nThird\n\n\n\n\n\n\n\nFourth\n\n\n";
            console.log("splitting text:", text);
            var commands = TiledeskChatbotUtil.splitPars(text.trim());
            console.log("Commands:", commands);
            assert(commands != null);
            assert(commands.length == 5);
            
            assert.strictEqual(commands[0].type, TiledeskChatbotUtil.COMMAND_TYPE_MESSAGE);
            assert.strictEqual(commands[0].message.text, 'One message');
            assert.strictEqual(commands[1].type, TiledeskChatbotUtil.COMMAND_TYPE_WAIT);
            assert.strictEqual(commands[1].time, TiledeskChatbotUtil.WAIT_TIME);
            assert.strictEqual(commands[2].type, TiledeskChatbotUtil.COMMAND_TYPE_MESSAGE);
            assert.strictEqual(commands[2].message.text, 'Second Message\nThird');
            assert.strictEqual(commands[3].type, TiledeskChatbotUtil.COMMAND_TYPE_WAIT);
            assert.strictEqual(commands[3].time, TiledeskChatbotUtil.WAIT_TIME);
            assert.strictEqual(commands[4].type, TiledeskChatbotUtil.COMMAND_TYPE_MESSAGE);
            assert.strictEqual(commands[4].message.text, 'Fourth');
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('splitPars() 5', function() {
        it('should return NO commands', function() {
            const text = "\n\n\n\n\nOne message\n\n\n\n\n";
            console.log("splitting text:", text);
            var commands = TiledeskChatbotUtil.splitPars(text.trim());
            console.log("Commands:", commands);
            assert(commands == null);
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('splitPars() 6', function() {
        it('should return ONE command', function() {
            const text = "\n\n\n\n\nFirst message\nSecond one\n\n\n\n\n";
            console.log("splitting text:", text);
            var commands = TiledeskChatbotUtil.splitPars(text.trim());
            console.log("Commands:", commands);
            assert(commands == null);
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('splitPars() 7', function() {
        it('should return no split', function() {
            const text = "Hey! choose an option\n* Ciao";
            console.log("splitting text:", text);
            var commands = TiledeskChatbotUtil.splitPars(text.trim());
            console.log("Commands:", commands);
            assert(commands == null);
        });
    });
});

describe('TiledeskChatbotUtil', function() {
    describe('splitPars() 8', function() {
        it('should return 2 splits', function() {
            const text = "Welcome to RASA Connector!\n\nChoose an option\n* RASA Connector howto\n* More on RASA https://rasa.com/\n *I want an agent";
            console.log("splitting text:", text);
            var commands = TiledeskChatbotUtil.splitPars(text.trim());
            console.log("Commands:", commands);
            assert(commands != null);
            assert(commands.length == 3);
        });
    });
});
