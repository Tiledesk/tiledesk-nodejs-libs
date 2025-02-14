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

let group_id;
let group_name;
let request;
let tagsArray = [];
let pushTagsToList = false;

describe('CHATBOT: Hidden message action', async () => {
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

            const bot = require('./chatbots/hidden_message_bot.js').bot;
           
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            })
           
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
            done();
        });
    });

    // it('Send hidden message to conversation (~1s)', () => {
    //     return new Promise((resolve, reject)=> {
    //         const tdClientTest = new TiledeskClientTest({
    //             APIURL: API_ENDPOINT,
    //             PROJECT_ID: TILEDESK_PROJECT_ID,
    //             TOKEN: USER_ADMIN_TOKEN
    //         });
    //         let buttonTextIsPressed = false;
    //         chatClient1.onMessageAdded(async (message, topic) => {
    //             const message_text = 'draft_request'
    //             if(message.recipient !== recipient_id){
    //                 reject();
    //                 return;
    //             }

    //             if (LOG_STATUS) {
    //                 console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
    //             }

    //             if (
    //                 message &&
    //                 message.attributes.intentName ===  "welcome" &&
    //                 message.sender_fullname === "Hidden message Chatbot"
    //             ) {
    //                 if (LOG_STATUS) {
    //                     console.log("> Incoming message from 'welcome' intent ok.");
    //                 }

    //                 assert.equal(request.draft, true, "Expect request.draft to be equal to true")
                    
    //                 assert(message.attributes, "Expect message.attributes exist")
    //                 assert(message.attributes.commands, "Expect message.attributes.commands")
    //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
    //                 let commands = message.attributes.commands
    //                 let command = commands[1]
    //                 assert.equal(command.type, 'message')
    //                 assert(command.message, "Expect command.message exist")
    //                 let msg = command.message
    //                 assert(msg.type)
    //                 assert.equal(msg.type, 'text', "Expect msg.type to be 'text'")
    //                 assert(msg.text, "Expect msg.text exist")
    //                 assert.equal(msg.text, 'Test hidden message', `Expect msg.text to be 'Test hidden message' but got: ${msg.text} `)
                    
    //                 //check buttons 
    //                 assert(msg.attributes, "Expect msg.attribues exist")
    //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
    //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
    //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
    //                 let button1 = msg.attributes.attachment.buttons[0]
    //                 assert.strictEqual(button1.value, message_text, 'Expect button1 to have "draft_request" as text')
    //                 assert(button1.action)

    //                 chatClient1.sendMessage(
    //                     message_text,
    //                     'text',
    //                     recipient_id,
    //                     "Test support group",
    //                     user1.fullname,
    //                     {projectId: config.TILEDESK_PROJECT_ID, action: button1.action },
    //                     null, // no metadata
    //                     'group',
    //                     (err, msg) => {
    //                         if (err) {
    //                             console.error("Error send:", err);
    //                         }
    //                         if (LOG_STATUS) {
    //                             console.log("Message Sent ok:", msg);
    //                         }
    //                         assert.equal(msg.text, message_text, `Message sent from user expected to be "${message_text}"`)
    //                         buttonTextIsPressed = true
    //                     }
    //                 );

                                 
    //             } else if(buttonTextIsPressed && 
    //                 message.sender_fullname === "Hidden message Chatbot"
    //             ){  
    //                 assert(message.attributes)
    //                 assert(message.attributes.intentName)
    //                 assert.equal(message.attributes.intentName, 'draft')

    //                 //check command of type text
    //                 assert(message.attributes, "Expect message.attributes exist")
    //                 assert(message.attributes.commands, "Expect message.attributes.commands")
    //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
    //                 let commands = message.attributes.commands
    //                 let command = commands[1]
    //                 assert.equal(command.type, 'message')
    //                 assert(command.message, "Expect command.message exist")
    //                 let msg = command.message
    //                 assert.equal(msg.text, "hidden message sent: ok")
    //                 assert.equal(msg.type, 'text')

    //                 resolve();    
    //                 return;
    //             }

    //         });
    //         if (LOG_STATUS) {
    //             console.log("Sending test message...");
    //         }
    //         let recipient_id = group_id;
    //         // let recipient_fullname = group_name;
    //         triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
    //             if (err) {
    //                 console.error("An error occurred while triggering echo bot conversation:", err);
    //             }

    //             request = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
    //                 console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
    //                 reject(err)
    //                 assert.ok(false);
    //             });
    //             request.draft = true
                
    //         });
    //     })
    // })


    it('NOT Send hidden message to conversation (~1s)', () => {
        return new Promise((resolve, reject)=> {
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            
            let buttonTextIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'no_draft_request'
                if(message.recipient !== recipient_id){
                    // reject();
                    return;
                }

                if (LOG_STATUS) {
                    console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
                }
                if (
                    message &&
                    message.attributes.intentName ===  "welcome" &&
                    message.sender_fullname === "Hidden message Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Incoming message from 'welcome' intent ok.");
                    }

                    //assert.equal(request.draft, undefined, "Expect request.draft to be equal to false")
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert(msg.type)
                    assert.equal(msg.type, 'text', "Expect msg.type to be 'text'")
                    assert(msg.text, "Expect msg.text exist")
                    assert.equal(msg.text, 'Test hidden message', `Expect msg.text to be 'Test hidden message' but got: ${msg.text} `)
                    
                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[1]
                    
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "no_draft_request" as text')
                    assert(button1.action)

                    chatClient1.sendMessage(
                        message_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID, action: button1.action },
                        null, // no metadata
                        'group',
                        (err, msg) => {
                            if (err) {
                                console.error("Error send:", err);
                            }
                            if (LOG_STATUS) {
                                console.log("Message Sent ok:", msg);
                            }
                            assert.equal(msg.text, message_text, `Message sent from user expected to be "${message_text}"`)
                            buttonTextIsPressed = true
                        }
                    );                 
                } 
                else if(buttonTextIsPressed && 
                    message.sender_fullname === "Hidden message Chatbot"
                ){  
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.attributes.intentName, 'no_draft')

                    //check command of type text
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert.equal(msg.text, "hidden message not sent: ok")
                    assert.equal(msg.type, 'text')

                    resolve();    
                }

            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            //let recipient_id = group_id+'_1';
            let recipient_id = group_id;
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
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
            tdclient.fireEvent(event,function(err, result) {
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