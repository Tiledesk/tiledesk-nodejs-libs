var assert = require('assert');
const { TiledeskChatbotUtil } = require('..');

/************************
 * TEST DIRECTIVES
 ************************/

describe('_test directives_', function() {
    // describe('A message and the \\agent directive', function() {
    //     it('should return a \\agent directive', function() {
    //         const msg = 'Moving you to an agent\n\\agent';
    //         const result = TiledeskChatbotUtil.parseDirectives(msg);
    //         console.log("result:", JSON.stringify(result));
    //         console.log("directives:", JSON.stringify(result.directives));
    //         assert(result != null);
    //         assert(result.directives != null);
    //         assert.strictEqual(result.directives.length, 1);
    //         assert(result.directives[0]);
    //         assert(result.directives[0].name === TiledeskChatbotUtil.AGENT_DIRECTIVE);
    //         assert(result.text === "Moving you to an agent");
    //         console.log("result.findDirective(\"\\agent\"):", result.findDirective(TiledeskChatbotUtil.AGENT_DIRECTIVE))
    //         assert(result.findDirective("\\agent").name === TiledeskChatbotUtil.AGENT_DIRECTIVE);
    //     });
    // });

    // describe('A message and the \\close directive', function() {
    //     it('should return a \\close directive', function() {
    //         const msg = 'Closing conversation\n\\close';
    //         const result = TiledeskChatbotUtil.parseDirectives(msg);
    //         console.log("result:", JSON.stringify(result));
    //         console.log("directives:", JSON.stringify(result.directives));
    //         assert(result != null);
    //         assert(result.directives != null);
    //         assert.strictEqual(result.directives.length, 1);
    //         assert(result.directives[0]);
    //         assert(result.directives[0].name === TiledeskChatbotUtil.CLOSE_DIRECTIVE);
    //         assert(result.text === "Closing conversation");
    //         console.log("result.findDirective(\"\\close\"):", result.findDirective(TiledeskChatbotUtil.CLOSE_DIRECTIVE))
    //         assert(result.findDirective("\\close").name === TiledeskChatbotUtil.CLOSE_DIRECTIVE);
    //     });
    // });

    // describe('A message, \\department and \\jsonmessage', function() {
    //     it('should return a \\department followed by a \\jsonmessage directives', function() {
    //         const msg = 'Moving to main menu\n\\department Default Department\n\\jsonmessage {"attributes":{"subtype":"info"}}';
    //         const result = TiledeskChatbotUtil.parseDirectives(msg);
    //         console.log("result:", JSON.stringify(result));
    //         console.log("directives:", JSON.stringify(result.directives));
    //         assert(result != null);
    //         assert(result.directives != null);
    //         assert.strictEqual(result.directives.length, 2);
    //         assert(result.directives[0]);
    //         assert(result.directives[1]);
    //         assert(result.directives[0].name === TiledeskChatbotUtil.DEPARTMENT_DIRECTIVE);
    //         assert(result.directives[0].parameter === 'Default Department');
    //         assert(result.directives[1].name === TiledeskChatbotUtil.JSONMESSAGE_DIRECTIVE);
    //         assert(result.directives[1].parameter === '{"attributes":{"subtype":"info"}}');
    //         const json_param = JSON.parse(result.directives[1].parameter);
    //         console.log("json_param:", json_param);
    //         console.log("result.directives[1].parameter:", result.directives[1].parameter);
    //         assert(result.text === "Moving to main menu");
    //         console.log("result.findDirective(\"\\department\"):", result.findDirective(TiledeskChatbotUtil.DEPARTMENT_DIRECTIVE))
    //         assert(result.findDirective(TiledeskChatbotUtil.DEPARTMENT_DIRECTIVE).name === TiledeskChatbotUtil.DEPARTMENT_DIRECTIVE);
    //         assert(result.findDirective(TiledeskChatbotUtil.DEPARTMENT_DIRECTIVE).parameter === 'Default Department');
    //         console.log("result.findDirective(\"\\jsonmessage\"):", result.findDirective(TiledeskChatbotUtil.JSONMESSAGE_DIRECTIVE))
    //         assert(result.findDirective(TiledeskChatbotUtil.JSONMESSAGE_DIRECTIVE).name === TiledeskChatbotUtil.JSONMESSAGE_DIRECTIVE);
    //         assert(result.findDirective(TiledeskChatbotUtil.JSONMESSAGE_DIRECTIVE).parameter === '{"attributes":{"subtype":"info"}}');
    //     });
    // });

    // describe('Only \\agent directive', function() {
    //     it('should return a \\agent and no text', function() {
    //         const msg = '\\agent';
    //         const result = TiledeskChatbotUtil.parseDirectives(msg);
    //         console.log("result:", JSON.stringify(result));
    //         console.log("directives:", JSON.stringify(result.directives));
    //         assert(result != null);
    //         assert(result.directives != null);
    //         assert.strictEqual(result.directives.length, 1);
    //         assert(result.directives[0]);
    //         assert(result.directives[0].name === TiledeskChatbotUtil.AGENT_DIRECTIVE);
    //         assert(result.text === "");
    //         console.log("result.findDirective(\"\\agent\"):", result.findDirective(TiledeskChatbotUtil.AGENT_DIRECTIVE))
    //         assert(result.findDirective("\\agent").name === TiledeskChatbotUtil.AGENT_DIRECTIVE);
    //     });
    // });

    describe('One more only \\agent directive', function() {
        it('should return a \\agent with text', function() {
            const msg =
`We are looking for an operator..
-
JUST WAIT A MOMENT
\\agent`;
            const result = TiledeskChatbotUtil.parseDirectives(msg);
            console.log("result:", JSON.stringify(result));
            console.log("directives:", JSON.stringify(result.directives));
            assert(result != null);
            assert(result.directives != null);
            assert.strictEqual(result.directives.length, 1);
            assert(result.directives[0]);
            assert(result.directives[0].name === TiledeskChatbotUtil.AGENT_DIRECTIVE);
            assert(result.text ===
`We are looking for an operator..
-
JUST WAIT A MOMENT`);
            console.log("result.findDirective(\"\\agent\"):", result.findDirective(TiledeskChatbotUtil.AGENT_DIRECTIVE))
            assert(result.findDirective("\\agent").name === TiledeskChatbotUtil.AGENT_DIRECTIVE);
        });
    });
});