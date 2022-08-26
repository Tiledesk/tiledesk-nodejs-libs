var assert = require('assert');
const { TiledeskChatbotUtil } = require('..');

/************************
 * TEST DIRECTIVES
 ************************/

describe('_test directives_', function() {
    
    it('A message and the \\agent directive. Should return a \\agent directive', function() {
        const msg = 'Moving you to an agent\n\\agent';
        const result = TiledeskChatbotUtil.parseDirectives(msg);
        console.log("result:", JSON.stringify(result));
        console.log("directives:", JSON.stringify(result.directives));
        assert(result != null);
        assert(result.directives != null);
        assert.strictEqual(result.directives.length, 1);
        assert(result.directives[0]);
        assert(result.directives[0].name === TiledeskChatbotUtil.AGENT_DIRECTIVE);
        assert(result.text === "Moving you to an agent");
        assert(result.findDirective(TiledeskChatbotUtil.AGENT_DIRECTIVE).name != null);
    });

    it('Should return a \\close directive. A message and the \\close directive', function() {
        const msg = 'Closing conversation\n\\_tdclose';
        const result = TiledeskChatbotUtil.parseDirectives(msg);
        console.log("result:", JSON.stringify(result));
        console.log("directives:", JSON.stringify(result.directives));
        assert(result != null);
        assert(result.directives != null);
        assert.strictEqual(result.directives.length, 1);
        assert(result.directives[0]);
        assert(result.directives[0].name === TiledeskChatbotUtil.CLOSE_DIRECTIVE);
        assert(result.text === "Closing conversation");
        console.log("result.findDirective(\"\\close\"):", result.findDirective(TiledeskChatbotUtil.CLOSE_DIRECTIVE))
        assert(result.findDirective(TiledeskChatbotUtil.CLOSE_DIRECTIVE).name != null);
    });
    
    it('A message, \\department and \\jsonmessage. Should return a \\department followed by a \\jsonmessage directives', function() {
        const msg =
`Moving to main menu
\\_tddepartment Default Department
\\_tdjsonmessage {"attributes":{"subtype":"info"}}`;
        const result = TiledeskChatbotUtil.parseDirectives(msg);
        console.log("result:", JSON.stringify(result));
        console.log("directives:", JSON.stringify(result.directives));
        assert(result != null);
        assert(result.directives != null);
        assert.strictEqual(result.directives.length, 2);
        assert(result.directives[0]);
        assert(result.directives[1]);
        assert(result.directives[0].name === TiledeskChatbotUtil.DEPARTMENT_DIRECTIVE);
        assert(result.directives[0].parameter === 'Default Department');
        assert(result.directives[1].name === TiledeskChatbotUtil.JSONMESSAGE_DIRECTIVE);
        assert(result.directives[1].parameter === '{"attributes":{"subtype":"info"}}');
        const json_param = JSON.parse(result.directives[1].parameter);
        assert(json_param.attributes.subtype === "info");
        console.log("result.directives[1].parameter:", result.directives[1].parameter);
        assert(result.text === "Moving to main menu");
        console.log("result.findDirective(\"\\department\"):", result.findDirective(TiledeskChatbotUtil.DEPARTMENT_DIRECTIVE))
        assert(result.findDirective(TiledeskChatbotUtil.DEPARTMENT_DIRECTIVE).name === TiledeskChatbotUtil.DEPARTMENT_DIRECTIVE);
        assert(result.findDirective(TiledeskChatbotUtil.DEPARTMENT_DIRECTIVE).parameter === 'Default Department');
        console.log("result.findDirective(\"\\jsonmessage\"):", result.findDirective(TiledeskChatbotUtil.JSONMESSAGE_DIRECTIVE))
        assert(result.findDirective(TiledeskChatbotUtil.JSONMESSAGE_DIRECTIVE).name === TiledeskChatbotUtil.JSONMESSAGE_DIRECTIVE);
        assert(result.findDirective(TiledeskChatbotUtil.JSONMESSAGE_DIRECTIVE).parameter === '{"attributes":{"subtype":"info"}}');
    });
    
    it('Only \\agent directive. Should return a \\agent and no text.', function() {
        const msg = '\\agent';
        const result = TiledeskChatbotUtil.parseDirectives(msg);
        console.log("result:", JSON.stringify(result));
        console.log("directives:", JSON.stringify(result.directives));
        assert(result != null);
        assert(result.directives != null);
        assert.strictEqual(result.directives.length, 1);
        assert(result.directives[0]);
        assert(result.directives[0].name === TiledeskChatbotUtil.AGENT_DIRECTIVE);
        assert(result.text === "");
        assert(result.findDirective(TiledeskChatbotUtil.AGENT_DIRECTIVE).name != null);
    });

    it('should return a \\agent with text. One more only \\agent directive', function() {
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
        assert(result.findDirective(TiledeskChatbotUtil.AGENT_DIRECTIVE).name != null);
    });

    it('Finds no directives', function() {
        const msg =
`We are looking for an operator..
-
\\not_a_directive
JUST WAIT A MOMENT
\\not_a_directive`;
        const result = TiledeskChatbotUtil.parseDirectives(msg);
        console.log("result:", JSON.stringify(result));
        console.log("directives:", JSON.stringify(result.directives));
        assert(result != null);
        assert(result.directives != null);
        assert.strictEqual(result.directives.length, 0);
        assert(result.text === msg);
    });

    it('Finds 3 directives', function() {
        const msg =
`We are looking for an operator..
-
JUST WAIT A MOMENT
\\_tdDir1 with params
\\_tdDir2NoParam
\\_tdDir3 one_param`;
        const result = TiledeskChatbotUtil.parseDirectives(msg);
        console.log("result:", JSON.stringify(result));
        console.log("directives:", JSON.stringify(result.directives));
        assert(result != null);
        assert(result.directives != null);
        assert.strictEqual(result.directives.length, 3);
        assert(result.directives[0]);
        assert(result.directives[1]);
        assert(result.directives[2]);
        
        assert(result.directives[0].name === "Dir1");
        assert(result.directives[0].parameter === "with params");
        assert(result.directives[1].name === "Dir2NoParam");
        assert(result.directives[1].parameter == null);
        assert(result.directives[2].name === "Dir3");
        assert(result.directives[2].parameter === "one_param");
        
        assert(result.text.trim() ===
`We are looking for an operator..
-
JUST WAIT A MOMENT`);
        assert(result.findDirective("Dir1").name === "Dir1");
        assert(result.findDirective("Dir2NoParam").name === "Dir2NoParam");
        assert(result.findDirective("Dir3").name === "Dir3");
    });

    it('Finds 1 directive', function() {
        const msg = "Andrea\n\\_tdWhenOfflineHours reply_with:offline_message";
        let result = TiledeskChatbotUtil.parseDirectives(msg);
        console.log("result:", JSON.stringify(result));
        console.log("directives:", JSON.stringify(result.directives));
        assert(result != null);
        assert(result.directives != null);
        assert.strictEqual(result.directives.length, 1);
        assert(result.directives[0]);
        
        assert(result.directives[0].name === "WhenOfflineHours");
        assert(result.directives[0].parameter === "reply_with:offline_message");
        assert(result.text.trim() === "Andrea");
        assert(result.findDirective("WhenOfflineHours").name === "WhenOfflineHours");
    });
});