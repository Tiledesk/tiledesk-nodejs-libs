var assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const { Chat21Client } = require('../../chat21client.js');
require('dotenv').config();
const axios = require('axios');
const { TiledeskClient } = require('../../index.js');

const Auth = require('../tiledesk_apis/TdAuthApi.js');
const TiledeskClientTest = require('../tiledesk_apis/index.js');
const Chat21Auth = require('../tiledesk_apis/Chat21Auth.js')


const LOG_STATUS = (process.env.LOG_STATUS && process.env.LOG_STATUS) === 'true' ? true : false;
let EMAIL = "";
if (process.env && process.env.EMAIL) {
	EMAIL = process.env.EMAIL
}
else {
    throw new Error(".env.EMAIL is mandatory");
}

let PASSWORD = "";
if (process.env && process.env.PASSWORD) {
	PASSWORD = process.env.PASSWORD
}
else {
    throw new Error(".env.PASSWORD is mandatory");
}

// let ECHO_BOT_ID = "";
// if (process.env && process.env.ECHO_BOT_ID) {
// 	ECHO_BOT_ID = process.env.ECHO_BOT_ID
// }
// else {
//     throw new Error(".env.ECHO_BOT_ID is mandatory");
// }

// console.log("process.env.AUTOMATION_TEST_TILEDESK_PROJECT_ID:", process.env.AUTOMATION_TEST_TILEDESK_PROJECT_ID);
let TILEDESK_PROJECT_ID = "";
if (process.env && process.env.AUTOMATION_TEST_TILEDESK_PROJECT_ID) {
	TILEDESK_PROJECT_ID = process.env.AUTOMATION_TEST_TILEDESK_PROJECT_ID
    // console.log("TILEDESK_PROJECT_ID:", TILEDESK_PROJECT_ID);
}
else {
    throw new Error(".env.AUTOMATION_TEST_TILEDESK_PROJECT_ID is mandatory");
}

// console.log("process.env.AUTOMATION_TEST_MQTT_ENDPOINT:", process.env.AUTOMATION_TEST_MQTT_ENDPOINT);
let MQTT_ENDPOINT = "";
if (process.env && process.env.AUTOMATION_TEST_MQTT_ENDPOINT) {
	MQTT_ENDPOINT = process.env.AUTOMATION_TEST_MQTT_ENDPOINT
    // console.log("MQTT_ENDPOINT:", MQTT_ENDPOINT);
}
else {
    throw new Error(".env.AUTOMATION_TEST_MQTT_ENDPOINT is mandatory");
}

let API_ENDPOINT = "";
if (process.env && process.env.AUTOMATION_TEST_API_ENDPOINT) {
	API_ENDPOINT = process.env.AUTOMATION_TEST_API_ENDPOINT
    // console.log("API_ENDPOINT:", API_ENDPOINT);
}
else {
    throw new Error(".env.AUTOMATION_TEST_API_ENDPOINT is mandatory");
}

let CHAT_API_ENDPOINT = "";
if (process.env && process.env.AUTOMATION_TEST_CHAT_API_ENDPOINT) {
	CHAT_API_ENDPOINT = process.env.AUTOMATION_TEST_CHAT_API_ENDPOINT
    // console.log("CHAT_API_ENDPOINT:", CHAT_API_ENDPOINT);
}
else {
    throw new Error(".env.AUTOMATION_TEST_CHAT_API_ENDPOINT is mandatory");
}

let BOT_ID = null;
let USER_ADMIN_TOKEN = null;

let config = {
    MQTT_ENDPOINT: MQTT_ENDPOINT,
    CHAT_API_ENDPOINT: CHAT_API_ENDPOINT,
    APPID: 'tilechat',
    TILEDESK_PROJECT_ID: TILEDESK_PROJECT_ID
}

let chatClient1 = new Chat21Client(
{
    appId: config.APPID,
    MQTTendpoint: config.MQTT_ENDPOINT,
    APIendpoint: config.CHAT_API_ENDPOINT,
    log: LOG_STATUS
});

let user1 = {
    fullname: 'User 1',
    firstname: 'User',
    lastname: '1',
};

let user_agent = {};
let agent_project_user = {};

let group_id;
let group_name;

describe('CHATBOT: Agent Handoff action', async () => {
    before(() => {
        return new Promise(async (resolve, reject) => {
            if (LOG_STATUS) {
                console.log("MQTT endpoint:", config.MQTT_ENDPOINT);
                console.log("API endpoint:", config.CHAT_API_ENDPOINT);
                console.log("Tiledesk Project Id:", config.TILEDESK_PROJECT_ID);
                console.log("Connecting...");    
            }

            /** AUTH ANONYMOUS USER TILEDESK AND CHAT21 */
            const auth = new Auth(API_ENDPOINT);
            const chat21Auth = new Chat21Auth(API_ENDPOINT);
            let userdata = await auth.createAnonymousUser(TILEDESK_PROJECT_ID).catch((err) => { 
                console.error("(before) Auth -> An error occurred during anonym auth:", err);
                process.exit(0)
            });
            let chat21data = await chat21Auth.signInWithCustomToken(userdata.token).catch((err) => { 
                console.error("(before) Chat21Auth -> An error occurred during anonym auth:", err);
                process.exit(0)
            });
            user1.userid = chat21data.userid;
            user1.token = chat21data.token;
            user1.tiledesk_token = userdata.token;
            
            /**AUTH WITH CREDENTIALS TILEDESK */
            let result = await auth.authEmailPassword(EMAIL, PASSWORD).catch((err) => { 
                console.error("(before) ADMIN Auth -> An error occurred during emailPassword auth:", err);
                reject(err)
                assert.ok(false);
            });
            assert(result.success == true);
            assert(result.token != null);
            assert(result.user)
            assert(result.user._id !== null);
            assert(result.user.email !== null);
            USER_ADMIN_TOKEN = result.token;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            })
            
            /** SIGNUP AGENT */
            const result_agent = await auth.signUpEmailPassword('agent@tiledesk.com', 'agentTEST@').catch((err) => { 
                console.error("(before) ADMIN Auth -> An error occurred during emailPassword auth:", err);
                reject(err)
                assert.ok(false);
            });
            assert(result_agent.success == true);
            assert(result_agent.user)
            assert(result_agent.user._id !== null);
            assert(result_agent.user.email !== null);
            user_agent = result_agent.user
            

            /** SIGNIN AGENT */
            let result_signIn = await auth.authEmailPassword('agent@tiledesk.com', 'agentTEST@').catch((err) => { 
                console.error("(before) SIGNIN Auth -> An error occurred during emailPassword auth:", err);
                reject(err)
                assert.ok(false);
            });
            assert(result_signIn.success == true);
            assert(result_signIn.token != null, "Expect result_signIn.token exist");
            assert(result_signIn.user, "Expect result_signIn.user exist")
            assert(result_signIn.user._id !== null, "Expect result_signIn.user._id exist");
            assert(result_signIn.user.email !== null, "Expect result_signIn.user.email exist");
            user_agent['token'] = result_signIn.token;

            /** ADD AGENT TO PROJECT */
            const response_addToProject = await tdClientTest.user.addUserToProject(user_agent.email, 'admin', true).catch((err) => {
                console.error(err); 
                reject(err);
                assert.ok(false);
            });
            
            assert(response_addToProject, "Expect response_addToProject exist")
            assert(response_addToProject._id, "Expect response_addToProject._id exist")
            assert.equal(response_addToProject.id_user, user_agent._id, `Expect user_agent._id to be ${user_agent._id} but got: ${response_addToProject.id_user}`)
            agent_project_user = response_addToProject;
            /** SET AGENT AS AVAILABLE */
            /** skip if 3rd parameter of addUserToProject( .., .., true) is set to true */

            const bot = require('./chatbots/agent_handoff_bot.js').bot;
            const data = await tdClientTest.chatbot.importChatbot(bot).catch((err) => { 
                console.error(err); 
                reject(err);
            })
            BOT_ID = data._id;

            chatClient1.connect(user1.userid, user1.token, () => {
                if (LOG_STATUS) {
                    console.log("chatClient1 connected and subscribed.");
                }
                group_id = "support-group-" + TILEDESK_PROJECT_ID + "-" + uuidv4().replace(/-+/g, "");
                group_name = "Chatbot: test group => " + group_id;
                resolve();
            });

        });
    });

    after(function (done) {
        chatClient1.close(async () => {
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            const result = await tdClientTest.chatbot.deleteChatbot(BOT_ID).catch((err) => { 
                assert.ok(false);
            });
            assert(result.success === true);
            const result_remove_user_from_project = await tdClientTest.user.removeUserToProject(agent_project_user._id).catch((err) => { 
                assert.ok(false);
            });
            assert(result_remove_user_from_project);
            const result_remove_user = await tdClientTest.user.removeUser(user_agent['token']).catch((err) => { 
                assert.ok(false);
            });
            assert(result_remove_user.success === true)
            done();
        });
    });

    it('agent handoff: expect participants to not be a bot after action is triggered (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let touchingOperatorInfo = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            chatClient1.onMessageAdded(async (message, topic) => {
                if(message.recipient !== recipient_id){
                    reject();
                    return;
                }
                
                if (LOG_STATUS) {
                    console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
                }
                if (
                    message &&
                    message.sender_fullname === "Bot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Incoming message from 'welcome' intent ok.");
                    }

                    assert(message.attributes)
                    assert(message.attributes.messagelabel)
                    assert(message.attributes.messagelabel.key)
                    assert.equal(message.attributes.messagelabel.key, 'TOUCHING_OPERATOR')
                    touchingOperatorInfo = true
                      
                    // resolve()                 
                } else if( touchingOperatorInfo &&
                    message && message.sender === "system"
                ){

                    assert(message.attributes)
                    assert(message.attributes.messagelabel)
                    assert(message.attributes.messagelabel.key)
                    assert.equal(message.attributes.messagelabel.key, 'MEMBER_JOINED_GROUP')
                    assert(message.attributes.messagelabel.parameters)
                    assert(message.attributes.messagelabel.parameters.member_id)
                    let member_id = message.attributes.messagelabel.parameters.member_id;
                    assert.strictEqual(member_id, user_agent._id, `Expect member_id to be ${member_id} but got: ${user_agent._id}`)
                    
                    let request = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                        console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                        reject(err)
                        assert.ok(false);
                    });
                    
                    assert.strictEqual(request.participantsBots.length, 0, `Expect request.participantsBots.length = 0 but got: ${request.participantsBots.length}`)
                    assert(request.participants)
                    assert(request.participantsAgents)
                    assert.equal(request.participants[0],user_agent._id, `Expect request.participants to be ${user_agent._id} but got: ${request.participants[0]}`)
                    assert.equal(request.participantsAgents[0],user_agent._id, `Expect request.participantsAgents to be ${user_agent._id} but got: ${request.participantsAgents[0]}`)
                    assert.strictEqual(request.participantsAgents[0], request.participants[0], `Expect request.participantsAgents and request.participants to be equal`)
                    resolve()
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id;
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

});


async function triggerConversation(request_id, chatbot_id, token, callback) {
    const tdclient = new TiledeskClient(
    {
        APIKEY: "__APIKEY__",
        APIURL: API_ENDPOINT,
        projectId: TILEDESK_PROJECT_ID,
        token: token,
        log: LOG_STATUS
    });
    tdclient.getWidgetSettings((err, result) => {
        if (LOG_STATUS) {
            console.log("Project departments:", result.departments);
        }
        if (result && result.departments) {
            let default_dep = null;
            result.departments.forEach(d => {
                if (d.default === true) {
                    default_dep = d;
                }
            });
            if (default_dep === null) {
                console.error("Error. Default department not found");
                callback("Error. Default department not found");
            }
            const event = {
                name: "new_conversation",
                attributes: {
                    "request_id": request_id, 
                    "department": default_dep.id,
                    "participants": ["bot_" + chatbot_id], 
                    "language": "en", 
                    "subtype": "info", 
                    "fullname": "me", 
                    "email": "me@email.com", 
                    "attributes": {}
                }
            };
            if (LOG_STATUS) {
                console.log("Firing trigger conversation event:", event);
            }
            tdclient.fireEvent(event, function(err, result) {
                if (err) {
                    console.error("An error occurred invoking an event:", err);
                    process.exit(1);
                }
                callback(null);
            });
        }
        else {
            callback(err);
        }
    });
    
}