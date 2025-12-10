var assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const { Chat21Client } = require('../../chat21client.js');
require('dotenv').config();
const axios = require('axios');
const { TiledeskClient } = require('../../index.js');

const Auth = require('../tiledesk_apis/TdAuthApi.js');
const TiledeskClientTest = require('../tiledesk_apis/index.js');
const Chat21Auth = require('../tiledesk_apis/Chat21Auth.js');
const { before } = require('mocha');


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
let USER_ADMIN_ID = null;

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

describe('CHATBOT: Ai prompt action', async () => {
    let handlerId;
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
            USER_ADMIN_ID = result.user._id
            
            const bot = require('./chatbots/ai_prompt_bot.json');
            
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
            assert(result)
            done()
        });
    });

    afterEach(() => {
        if (handlerId) {
            chatClient1.removeOnMessageAddedHandler(handlerId);
            handlerId = null;
        }
    });

    describe('Google Gemini', function() {
        integration_id = null;
        before(() => {
            return new Promise(async(resolve, reject)=> {
                const tdClientTest = new TiledeskClientTest({
                    APIURL: API_ENDPOINT,
                    PROJECT_ID: TILEDESK_PROJECT_ID,
                    TOKEN: USER_ADMIN_TOKEN
                });
                
                const integration = await tdClientTest.integration.addIntegration("google", { apikey: process.env.GOOGLE_KEY, organization: 'test-gemini' }).catch((err) => { 
                    console.error(err); 
                    reject(err);
                })
                assert(integration)
                assert(integration._id)
                assert(integration.name)
                assert.equal(integration.name, 'google')
                assert(integration.value)
                assert(integration.value.apikey)
                assert(integration.value.organization)
                assert.equal(integration.value.apikey, process.env.GOOGLE_KEY)
                assert.equal(integration.value.organization, 'test-gemini')
                integration_id = integration._id

                resolve();
            })
        });

        after(async function () {
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            const integration_result = await tdClientTest.integration.deleteIntegration(integration_id).catch((err) => { 
                console.error(err); 
                throw err;
            })
            assert(integration_result)
            assert(integration_result.success===true)
        });

        it('gemini-2.5-flash (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Google Gemini'
                    const model = 'gemini-2.5-flash'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[0]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Google Gemini" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Google Gemini', `Expect msg.text to be 'Ask a question to Google Gemini' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[0]
                        assert.strictEqual(button1.value, model, 'Expect button1 to have "gemini-2.5-flash" as text')
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id;
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('gemini-2.5-flash-lite (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Google Gemini'
                    const model = 'gemini-2.5-flash-lite'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[0]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Google Gemini" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Google Gemini', `Expect msg.text to be 'Ask a question to Google Gemini' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[1]
                        assert.strictEqual(button1.value, model, 'Expect button1 to have "gemini-2.5-flash-lite" as text')
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id+ '_1';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        // Commented for api key problem
        // it('gemini-2.0-flash (~1s)', () => {
        //     return new Promise(async (resolve, reject)=> {
        //         let buttonGetIsPressed = false;
        //         let generatePrompt = false;

        //         const messageHandler = async (message, topic) => {
        //             const message_text = 'Google Gemini'
        //             const model = 'gemini-2.0-flash'
        //             if(message.recipient !== recipient_id){
        //                 // reject();
        //                 return;
        //             }
        //             if (LOG_STATUS) {
        //                 console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
        //             }
        //             if (
        //                 message &&
        //                 message.attributes.intentName ===  "welcome" &&
        //                 message.sender_fullname === "Ai Prompt Chatbot"
        //             ) {
        //                 if (LOG_STATUS) {
        //                     console.log("> Incoming message from 'welcome' intent ok.");
        //                 }
                        
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
        //                 let command = commands[1]
        //                 assert.equal(command.type, 'message')
        //                 assert(command.message, "Expect command.message exist")
        //                 let msg = command.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

        //                 //check buttons 
        //                 assert(msg.attributes, "Expect msg.attribues exist")
        //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
        //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
        //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
        //                 let button1 = msg.attributes.attachment.buttons[0]
        //                 assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Google Gemini" as text')
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
        //                         buttonGetIsPressed = true
        //                     }
        //                 );
                                        
        //             } else if( buttonGetIsPressed && !generatePrompt &&
        //                 message &&  message.sender_fullname === "Ai Prompt Chatbot"
        //             ){
                        
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
                        
        //                 let command1 = commands[1]
        //                 assert.equal(command1.type, 'message')
        //                 assert(command1.message, "Expect command.message exist")
        //                 let msg = command1.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 assert.equal(msg.text, 'Ask a question to Google Gemini', `Expect msg.text to be 'Ask a question to Google Gemini' but got: ${msg.text} `)
                        
        //                 //check buttons 
        //                 assert(msg.attributes, "Expect msg.attribues exist")
        //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
        //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
        //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
        //                 let button1 = msg.attributes.attachment.buttons[2]
        //                 assert.strictEqual(button1.value, model, 'Expect button1 to have "gemini-2.0-flash" as text')
        //                 assert(button1.action)

        //                 chatClient1.sendMessage(
        //                     model,
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

        //                         assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
        //                         generatePrompt = true 
        //                     }
        //                 );

        //                 // resolve();
                        
        //             } else if( generatePrompt &&
        //                 message &&  message.sender_fullname === "Ai Prompt Chatbot"
        //             ){
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.intentName);
        //                 assert.equal(message.attributes.intentName, 'ai_reply')
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
                        
        //                 let command1 = commands[1]
        //                 assert.equal(command1.type, 'message')
        //                 assert(command1.message, "Expect command.message exist")
        //                 let msg = command1.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 resolve();
        //             }
        //             else {
        //                 // console.log("Message not computed:", message.text);
        //             }

        //         };

        //         //add handler to list
        //         handlerId = chatClient1.onMessageAdded(messageHandler);

        //         if (LOG_STATUS) {
        //             console.log("Sending test message...");
        //         }
        //         let recipient_id = group_id+ '_2';
        //         // let recipient_fullname = group_name;
        //         triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
        //             if (err) {
        //                 console.error("An error occurred while triggering echo bot conversation:", err);
        //             }
        //         });
        //     })
        // }).timeout(20000);

        // Commented for api key problem
        // it('gemini-2.0-flash-lite (~1s)', () => {
        //     return new Promise(async (resolve, reject)=> {
        //         let buttonGetIsPressed = false;
        //         let generatePrompt = false;

        //         const messageHandler = async (message, topic) => {
        //             const message_text = 'Google Gemini'
        //             const model = 'gemini-2.0-flash-lite'
        //             if(message.recipient !== recipient_id){
        //                 // reject();
        //                 return;
        //             }
        //             if (LOG_STATUS) {
        //                 console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
        //             }
        //             if (
        //                 message &&
        //                 message.attributes.intentName ===  "welcome" &&
        //                 message.sender_fullname === "Ai Prompt Chatbot"
        //             ) {
        //                 if (LOG_STATUS) {
        //                     console.log("> Incoming message from 'welcome' intent ok.");
        //                 }
                        
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
        //                 let command = commands[1]
        //                 assert.equal(command.type, 'message')
        //                 assert(command.message, "Expect command.message exist")
        //                 let msg = command.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

        //                 //check buttons 
        //                 assert(msg.attributes, "Expect msg.attribues exist")
        //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
        //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
        //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
        //                 let button1 = msg.attributes.attachment.buttons[0]
        //                 assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Google Gemini" as text')
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
        //                         buttonGetIsPressed = true
        //                     }
        //                 );
                                        
        //             } else if( buttonGetIsPressed && !generatePrompt &&
        //                 message &&  message.sender_fullname === "Ai Prompt Chatbot"
        //             ){
                        
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
                        
        //                 let command1 = commands[1]
        //                 assert.equal(command1.type, 'message')
        //                 assert(command1.message, "Expect command.message exist")
        //                 let msg = command1.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 assert.equal(msg.text, 'Ask a question to Google Gemini', `Expect msg.text to be 'Ask a question to Google Gemini' but got: ${msg.text} `)
                        
        //                 //check buttons 
        //                 assert(msg.attributes, "Expect msg.attribues exist")
        //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
        //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
        //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
        //                 let button1 = msg.attributes.attachment.buttons[3]
        //                 assert.strictEqual(button1.value, model, 'Expect button1 to have "gemini-2.0-flash-lite" as text')
        //                 assert(button1.action)

        //                 chatClient1.sendMessage(
        //                     model,
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

        //                         assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
        //                         generatePrompt = true 
        //                     }
        //                 );

        //                 // resolve();
                        
        //             } else if( generatePrompt &&
        //                 message &&  message.sender_fullname === "Ai Prompt Chatbot"
        //             ){
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.intentName);
        //                 assert.equal(message.attributes.intentName, 'ai_reply')
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
                        
        //                 let command1 = commands[1]
        //                 assert.equal(command1.type, 'message')
        //                 assert(command1.message, "Expect command.message exist")
        //                 let msg = command1.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 resolve();
        //             }
        //             else {
        //                 // console.log("Message not computed:", message.text);
        //             }

        //         };

        //         //add handler to list
        //         handlerId = chatClient1.onMessageAdded(messageHandler);

        //         if (LOG_STATUS) {
        //             console.log("Sending test message...");
        //         }
        //         let recipient_id = group_id+ '_3';
        //         // let recipient_fullname = group_name;
        //         triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
        //             if (err) {
        //                 console.error("An error occurred while triggering echo bot conversation:", err);
        //             }
        //         });
        //     })
        // }).timeout(20000);

    });

    describe('Anthropic', function() {
        integration_id = null;
        before(() => {
            return new Promise(async(resolve, reject)=> {
                const tdClientTest = new TiledeskClientTest({
                    APIURL: API_ENDPOINT,
                    PROJECT_ID: TILEDESK_PROJECT_ID,
                    TOKEN: USER_ADMIN_TOKEN
                });
                
                const integration = await tdClientTest.integration.addIntegration("anthropic", { apikey: process.env.ANTHROPIC_KEY, organization: 'test-anthropic' }).catch((err) => { 
                    console.error(err); 
                    reject(err);
                })
                assert(integration)
                assert(integration._id)
                assert(integration.name)
                assert.equal(integration.name, 'anthropic')
                assert(integration.value)
                assert(integration.value.apikey)
                assert(integration.value.organization)
                assert.equal(integration.value.apikey, process.env.ANTHROPIC_KEY)
                assert.equal(integration.value.organization, 'test-anthropic')
                integration_id = integration._id

                resolve();
            })
        });

        after(async function () {
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            const integration_result = await tdClientTest.integration.deleteIntegration(integration_id).catch((err) => { 
                console.error(err); 
                throw err;
            })
            assert(integration_result)
            assert(integration_result.success===true)
        });

        it('claude-opus-4-0 (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Anthropic'
                    const model = 'claude-opus-4-0'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[1]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Google Gemini" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Anthropic', `Expect msg.text to be 'Ask a question to Anthropic' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[0]
                        assert.strictEqual(button1.value, model, 'Expect button1 to have "claude-opus-4-0" as text')
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_4';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('claude-sonnet-4-0 (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Anthropic'
                    const model = 'claude-sonnet-4-0'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[1]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Anthropic" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Anthropic', `Expect msg.text to be 'Ask a question to Anthropic' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[1]
                        assert.strictEqual(button1.value, model, 'Expect button1 to have "claude-sonnet-4-0" as text')
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_5';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('claude-3-7-sonnet-latest (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Anthropic'
                    const model = 'claude-3-7-sonnet-latest'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[1]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Anthropic" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Anthropic', `Expect msg.text to be 'Ask a question to Anthropic' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[2]
                        assert.strictEqual(button1.value, model, 'Expect button1 to have "claude-3-7-sonnet-latest" as text')
                        assert(button1.action)
                        
                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_6';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        // Model DEPRECATED
        // it('claude-3-5-sonnet-20240620 (~1s)', () => {
        //     return new Promise(async (resolve, reject)=> {
        //         let buttonGetIsPressed = false;
        //         let generatePrompt = false;

        //         const messageHandler = async (message, topic) => {
        //             const message_text = 'Anthropic'
        //             const model = 'claude-3-5-sonnet-20240620'
        //             if(message.recipient !== recipient_id){
        //                 // reject();
        //                 return;
        //             }
        //             if (LOG_STATUS) {
        //                 console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
        //             }
        //             if (
        //                 message &&
        //                 message.attributes.intentName ===  "welcome" &&
        //                 message.sender_fullname === "Ai Prompt Chatbot"
        //             ) {
        //                 if (LOG_STATUS) {
        //                     console.log("> Incoming message from 'welcome' intent ok.");
        //                 }
                        
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
        //                 let command = commands[1]
        //                 assert.equal(command.type, 'message')
        //                 assert(command.message, "Expect command.message exist")
        //                 let msg = command.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

        //                 //check buttons 
        //                 assert(msg.attributes, "Expect msg.attribues exist")
        //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
        //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
        //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
        //                 let button1 = msg.attributes.attachment.buttons[1]
        //                 assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Google Gemini" as text')
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
        //                         buttonGetIsPressed = true
        //                     }
        //                 );
                                        
        //             } else if( buttonGetIsPressed && !generatePrompt &&
        //                 message &&  message.sender_fullname === "Ai Prompt Chatbot"
        //             ){
                        
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
                        
        //                 let command1 = commands[1]
        //                 assert.equal(command1.type, 'message')
        //                 assert(command1.message, "Expect command.message exist")
        //                 let msg = command1.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 assert.equal(msg.text, 'Ask a question to Anthropic', `Expect msg.text to be 'Ask a question to Anthropic' but got: ${msg.text} `)
                        
        //                 //check buttons 
        //                 assert(msg.attributes, "Expect msg.attribues exist")
        //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
        //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
        //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
        //                 let button1 = msg.attributes.attachment.buttons[3]
        //                 assert.strictEqual(button1.value, model, 'Expect button1 to have "claude-3-5-sonnet-20240620" as text')
        //                 assert(button1.action)

        //                 chatClient1.sendMessage(
        //                     model,
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

        //                         assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
        //                         generatePrompt = true 
        //                     }
        //                 );

        //                 // resolve();
                        
        //             } else if( generatePrompt &&
        //                 message &&  message.sender_fullname === "Ai Prompt Chatbot"
        //             ){
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.intentName);
        //                 assert.equal(message.attributes.intentName, 'ai_reply')
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
                        
        //                 let command1 = commands[1]
        //                 assert.equal(command1.type, 'message')
        //                 assert(command1.message, "Expect command.message exist")
        //                 let msg = command1.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 resolve();
        //             }
        //             else {
        //                 // console.log("Message not computed:", message.text);
        //             }

        //         };

        //         //add handler to list
        //         handlerId = chatClient1.onMessageAdded(messageHandler);

        //         if (LOG_STATUS) {
        //             console.log("Sending test message...");
        //         }
        //         let recipient_id = group_id + '_7';
        //         // let recipient_fullname = group_name;
        //         triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
        //             if (err) {
        //                 console.error("An error occurred while triggering echo bot conversation:", err);
        //             }
        //         });
        //     })
        // }).timeout(20000);

        it('claude-3-5-haiku-latest (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Anthropic'
                    const model = 'claude-3-5-haiku-latest'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[1]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Google Gemini" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Anthropic', `Expect msg.text to be 'Ask a question to Anthropic' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[4]
                        assert.strictEqual(button1.value, model, 'Expect button1 to have "claude-3-5-haiku-latest" as text')
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_8';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

    });

    describe('Cohere', function() {
        integration_id = null;
        before(() => {
            return new Promise(async(resolve, reject)=> {
                const tdClientTest = new TiledeskClientTest({
                    APIURL: API_ENDPOINT,
                    PROJECT_ID: TILEDESK_PROJECT_ID,
                    TOKEN: USER_ADMIN_TOKEN
                });
                
                const integration = await tdClientTest.integration.addIntegration("cohere", { apikey: process.env.COHERE_KEY, organization: 'test-cohere' }).catch((err) => { 
                    console.error(err); 
                    reject(err);
                })
                assert(integration)
                assert(integration._id)
                assert(integration.name)
                assert.equal(integration.name, 'cohere')
                assert(integration.value)
                assert(integration.value.apikey)
                assert(integration.value.organization)
                assert.equal(integration.value.apikey, process.env.COHERE_KEY)
                assert.equal(integration.value.organization, 'test-cohere')
                integration_id = integration._id

                resolve();
            })
        });

        after(async function () {
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            const integration_result = await tdClientTest.integration.deleteIntegration(integration_id).catch((err) => { 
                console.error(err); 
                throw err;
            })
            assert(integration_result)
            assert(integration_result.success===true)
        });

        it('command-a-03-2025 (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Cohere'
                    const model = 'command-a-03-2025'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[3]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Cohere" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Cohere', `Expect msg.text to be 'Ask a question to Cohere' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[0]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_9';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('command-r7b-12-2024 (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Cohere'
                    const model = 'command-r7b-12-2024'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[3]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Cohere" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Cohere', `Expect msg.text to be 'Ask a question to Cohere' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[1]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_10';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('command-a-vision-07-2025 (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Cohere'
                    const model = 'command-a-vision-07-2025'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[3]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Cohere" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Cohere', `Expect msg.text to be 'Ask a question to Cohere' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[2]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_11';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('command-r-plus-08-2024 (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Cohere'
                    const model = 'command-r-plus-08-2024'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[3]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Cohere" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Cohere', `Expect msg.text to be 'Ask a question to Cohere' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[3]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_12';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

    });

    describe('Groq', function() {
        integration_id = null;
        before(() => {
            return new Promise(async(resolve, reject)=> {
                const tdClientTest = new TiledeskClientTest({
                    APIURL: API_ENDPOINT,
                    PROJECT_ID: TILEDESK_PROJECT_ID,
                    TOKEN: USER_ADMIN_TOKEN
                });
                
                const integration = await tdClientTest.integration.addIntegration("groq", { apikey: process.env.GROQ_KEY, organization: 'test-groq' }).catch((err) => { 
                    console.error(err); 
                    reject(err);
                })
                assert(integration)
                assert(integration._id)
                assert(integration.name)
                assert.equal(integration.name, 'groq')
                assert(integration.value)
                assert(integration.value.apikey)
                assert(integration.value.organization)
                assert.equal(integration.value.apikey, process.env.GROQ_KEY)
                assert.equal(integration.value.organization, 'test-groq')
                integration_id = integration._id

                resolve();
            })
        });

        after(async function () {
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            const integration_result = await tdClientTest.integration.deleteIntegration(integration_id).catch((err) => { 
                console.error(err); 
                throw err;
            })
            assert(integration_result)
            assert(integration_result.success===true)
        });

        it('llama-3.1-8b-instant (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Groq'
                    const model = 'llama-3.1-8b-instant'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[2]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Groq" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Groq', `Expect msg.text to be 'Ask a question to Groq' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[0]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_15';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('llama-3.3-70b-versatile (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Groq'
                    const model = 'llama-3.3-70b-versatile'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[2]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Groq" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Groq', `Expect msg.text to be 'Ask a question to Groq' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[1]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_16';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        // Removed from Tiledesk
        // it('deepseek-r1-distill-llama-70b (~1s)', () => {
        //     return new Promise(async (resolve, reject)=> {
        //         let buttonGetIsPressed = false;
        //         let generatePrompt = false;

        //         const messageHandler = async (message, topic) => {
        //             const message_text = 'Groq'
        //             const model = 'deepseek-r1-distill-llama-70b'
        //             if(message.recipient !== recipient_id){
        //                 // reject();
        //                 return;
        //             }
        //             if (LOG_STATUS) {
        //                 console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
        //             }
        //             if (
        //                 message &&
        //                 message.attributes.intentName ===  "welcome" &&
        //                 message.sender_fullname === "Ai Prompt Chatbot"
        //             ) {
        //                 if (LOG_STATUS) {
        //                     console.log("> Incoming message from 'welcome' intent ok.");
        //                 }
                        
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
        //                 let command = commands[1]
        //                 assert.equal(command.type, 'message')
        //                 assert(command.message, "Expect command.message exist")
        //                 let msg = command.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

        //                 //check buttons 
        //                 assert(msg.attributes, "Expect msg.attribues exist")
        //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
        //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
        //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
        //                 let button1 = msg.attributes.attachment.buttons[2]
        //                 assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Groq" as text')
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
        //                         buttonGetIsPressed = true
        //                     }
        //                 );
                                        
        //             } else if( buttonGetIsPressed && !generatePrompt &&
        //                 message &&  message.sender_fullname === "Ai Prompt Chatbot"
        //             ){
                        
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
                        
        //                 let command1 = commands[1]
        //                 assert.equal(command1.type, 'message')
        //                 assert(command1.message, "Expect command.message exist")
        //                 let msg = command1.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 assert.equal(msg.text, 'Ask a question to Groq', `Expect msg.text to be 'Ask a question to Groq' but got: ${msg.text} `)
                        
        //                 //check buttons 
        //                 assert(msg.attributes, "Expect msg.attribues exist")
        //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
        //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
        //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
        //                 let button1 = msg.attributes.attachment.buttons[2]
        //                 assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
        //                 assert(button1.action)

        //                 chatClient1.sendMessage(
        //                     model,
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

        //                         assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
        //                         generatePrompt = true
        //                     }
        //                 );

        //                 // resolve();
                        
        //             } else if( generatePrompt &&
        //                 message &&  message.sender_fullname === "Ai Prompt Chatbot"
        //             ){
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.intentName);
        //                 assert.equal(message.attributes.intentName, 'ai_reply')
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
                        
        //                 let command1 = commands[1]
        //                 assert.equal(command1.type, 'message')
        //                 assert(command1.message, "Expect command.message exist")
        //                 let msg = command1.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 resolve();
        //             }
        //             else {
        //                 // console.log("Message not computed:", message.text);
        //             }

        //         };

        //         //add handler to list
        //         handlerId = chatClient1.onMessageAdded(messageHandler);

        //         if (LOG_STATUS) {
        //             console.log("Sending test message...");
        //         }
        //         let recipient_id = group_id + '_18';
        //         // let recipient_fullname = group_name;
        //         triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
        //             if (err) {
        //                 console.error("An error occurred while triggering echo bot conversation:", err);
        //             }
        //         });
        //     })
        // }).timeout(20000);

        it('meta-llama/llama-guard-4-12b (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Groq'
                    const model = 'meta-llama/llama-guard-4-12b'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[2]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Groq" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Groq', `Expect msg.text to be 'Ask a question to Groq' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[3]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_19';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('meta-llama/llama-4-maverick-17b-128e-instruct (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Groq'
                    const model = 'meta-llama/llama-4-maverick-17b-128e-instruct'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[2]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Groq" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Groq', `Expect msg.text to be 'Ask a question to Groq' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[4]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_20';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('meta-llama/llama-4-scout-17b-16e-instruct (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Groq'
                    const model = 'meta-llama/llama-4-scout-17b-16e-instruct'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[2]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Groq" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Groq', `Expect msg.text to be 'Ask a question to Groq' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[5]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_21';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('moonshotai/kimi-k2-instruct (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Groq'
                    const model = 'moonshotai/kimi-k2-instruct'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[2]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Groq" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Groq', `Expect msg.text to be 'Ask a question to Groq' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[6]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_22';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('qwen/qwen3-32b (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Groq'
                    const model = 'qwen/qwen3-32b'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[2]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Groq" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Groq', `Expect msg.text to be 'Ask a question to Groq' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[7]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_23';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        // Removed from Tiledesk
        // it('gemma2-9b-it (~1s)', () => {
        //     return new Promise(async (resolve, reject)=> {
        //         let buttonGetIsPressed = false;
        //         let generatePrompt = false;

        //         const messageHandler = async (message, topic) => {
        //             const message_text = 'Groq'
        //             const model = 'gemma2-9b-it'
        //             if(message.recipient !== recipient_id){
        //                 // reject();
        //                 return;
        //             }
        //             if (LOG_STATUS) {
        //                 console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
        //             }
        //             if (
        //                 message &&
        //                 message.attributes.intentName ===  "welcome" &&
        //                 message.sender_fullname === "Ai Prompt Chatbot"
        //             ) {
        //                 if (LOG_STATUS) {
        //                     console.log("> Incoming message from 'welcome' intent ok.");
        //                 }
                        
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
        //                 let command = commands[1]
        //                 assert.equal(command.type, 'message')
        //                 assert(command.message, "Expect command.message exist")
        //                 let msg = command.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

        //                 //check buttons 
        //                 assert(msg.attributes, "Expect msg.attribues exist")
        //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
        //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
        //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
        //                 let button1 = msg.attributes.attachment.buttons[2]
        //                 assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Groq" as text')
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
        //                         buttonGetIsPressed = true
        //                     }
        //                 );
                                        
        //             } else if( buttonGetIsPressed && !generatePrompt &&
        //                 message &&  message.sender_fullname === "Ai Prompt Chatbot"
        //             ){
                        
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
                        
        //                 let command1 = commands[1]
        //                 assert.equal(command1.type, 'message')
        //                 assert(command1.message, "Expect command.message exist")
        //                 let msg = command1.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 assert.equal(msg.text, 'Ask a question to Groq', `Expect msg.text to be 'Ask a question to Groq' but got: ${msg.text} `)
                        
        //                 //check buttons 
        //                 assert(msg.attributes, "Expect msg.attribues exist")
        //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
        //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
        //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
        //                 let button1 = msg.attributes.attachment.buttons[8]
        //                 assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
        //                 assert(button1.action)

        //                 chatClient1.sendMessage(
        //                     model,
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

        //                         assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
        //                         generatePrompt = true 
        //                     }
        //                 );

        //                 // resolve();
                        
        //             } else if( generatePrompt &&
        //                 message &&  message.sender_fullname === "Ai Prompt Chatbot"
        //             ){
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.intentName);
        //                 assert.equal(message.attributes.intentName, 'ai_reply')
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
                        
        //                 let command1 = commands[1]
        //                 assert.equal(command1.type, 'message')
        //                 assert(command1.message, "Expect command.message exist")
        //                 let msg = command1.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 resolve();
        //             }
        //             else {
        //                 // console.log("Message not computed:", message.text);
        //             }

        //         };

        //         //add handler to list
        //         handlerId = chatClient1.onMessageAdded(messageHandler);

        //         if (LOG_STATUS) {
        //             console.log("Sending test message...");
        //         }
        //         let recipient_id = group_id + '_24';
        //         // let recipient_fullname = group_name;
        //         triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
        //             if (err) {
        //                 console.error("An error occurred while triggering echo bot conversation:", err);
        //             }
        //         });
        //     })
        // }).timeout(20000);

        it('allam-2-7b (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Groq'
                    const model = 'allam-2-7b'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[2]
                        assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Groq" as text')
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Ask a question to Groq', `Expect msg.text to be 'Ask a question to Groq' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[9]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_25';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

    });

    describe('Deepseek', function() {
        integration_id = null;
        before(() => {
            return new Promise(async(resolve, reject)=> {
                const tdClientTest = new TiledeskClientTest({
                    APIURL: API_ENDPOINT,
                    PROJECT_ID: TILEDESK_PROJECT_ID,
                    TOKEN: USER_ADMIN_TOKEN
                });
                
                const integration = await tdClientTest.integration.addIntegration("deepseek", { apikey: process.env.DEEPSEEK_KEY, organization: 'test-deepseek' }).catch((err) => { 
                    console.error(err); 
                    reject(err);
                })
                assert(integration)
                assert(integration._id)
                assert(integration.name)
                assert.equal(integration.name, 'deepseek')
                assert(integration.value)
                assert(integration.value.apikey)
                assert(integration.value.organization)
                assert.equal(integration.value.apikey, process.env.DEEPSEEK_KEY)
                assert.equal(integration.value.organization, 'test-deepseek')
                integration_id = integration._id
                
                resolve();
            })
        });

        after(async function () {
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            const integration_result = await tdClientTest.integration.deleteIntegration(integration_id).catch((err) => { 
                console.error(err); 
                throw err;
            })
            assert(integration_result)
            assert(integration_result.success===true)
        });

        // Free-tier Not Available
        // it('deepseek-chat (~1s)', () => {
        //     return new Promise(async (resolve, reject)=> {
        //         let buttonGetIsPressed = false;
        //         let generatePrompt = false;

        //         const messageHandler = async (message, topic) => {
        //             const message_text = 'Deepseek'
        //             const model = 'deepseek-chat'
        //             if(message.recipient !== recipient_id){
        //                 // reject();
        //                 return;
        //             }
        //             if (LOG_STATUS) {
        //                 console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
        //             }
        //             if (
        //                 message &&
        //                 message.attributes.intentName ===  "welcome" &&
        //                 message.sender_fullname === "Ai Prompt Chatbot"
        //             ) {
        //                 if (LOG_STATUS) {
        //                     console.log("> Incoming message from 'welcome' intent ok.");
        //                 }
                        
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
        //                 let command = commands[1]
        //                 assert.equal(command.type, 'message')
        //                 assert(command.message, "Expect command.message exist")
        //                 let msg = command.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

        //                 //check buttons 
        //                 assert(msg.attributes, "Expect msg.attribues exist")
        //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
        //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
        //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
        //                 let button1 = msg.attributes.attachment.buttons[5]
        //                 assert.strictEqual(button1.value, message_text, 'Expect button1 to have "Deepseek" as text')
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
        //                         buttonGetIsPressed = true
        //                     }
        //                 );
                                        
        //             } else if( buttonGetIsPressed && !generatePrompt &&
        //                 message &&  message.sender_fullname === "Ai Prompt Chatbot"
        //             ){
                        
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
                        
        //                 let command1 = commands[1]
        //                 assert.equal(command1.type, 'message')
        //                 assert(command1.message, "Expect command.message exist")
        //                 let msg = command1.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 assert.equal(msg.text, `Ask a question to ${message_text}`, `Expect msg.text to be 'Ask a question to ${message_text}' but got: ${msg.text} `)
                        
        //                 //check buttons 
        //                 assert(msg.attributes, "Expect msg.attribues exist")
        //                 assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
        //                 assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
        //                 assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
        //                 let button1 = msg.attributes.attachment.buttons[0]
        //                 assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
        //                 assert(button1.action)

        //                 chatClient1.sendMessage(
        //                     model,
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

        //                         assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
        //                         generatePrompt = true 
        //                     }
        //                 );

        //                 // resolve();
                        
        //             } else if( generatePrompt &&
        //                 message &&  message.sender_fullname === "Ai Prompt Chatbot"
        //             ){
        //                 assert(message.attributes, "Expect message.attributes exist")
        //                 assert(message.attributes.intentName);
        //                 assert.equal(message.attributes.intentName, 'ai_reply')
        //                 assert(message.attributes.commands, "Expect message.attributes.commands")
        //                 assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
        //                 let commands = message.attributes.commands
                        
        //                 let command1 = commands[1]
        //                 assert.equal(command1.type, 'message')
        //                 assert(command1.message, "Expect command.message exist")
        //                 let msg = command1.message
        //                 assert(msg.text, "Expect msg.text exist")
        //                 resolve();
        //             }
        //             else {
        //                 // console.log("Message not computed:", message.text);
        //             }

        //         };

        //         //add handler to list
        //         handlerId = chatClient1.onMessageAdded(messageHandler);

        //         if (LOG_STATUS) {
        //             console.log("Sending test message...");
        //         }
        //         let recipient_id = group_id + '_26';
        //         // let recipient_fullname = group_name;
        //         triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
        //             if (err) {
        //                 console.error("An error occurred while triggering echo bot conversation:", err);
        //             }
        //         });
        //     })
        // }).timeout(20000);
    });

    describe('Openai', function() {
        integration_id = null;
        before(() => {
            return new Promise(async(resolve, reject)=> {
                const tdClientTest = new TiledeskClientTest({
                    APIURL: API_ENDPOINT,
                    PROJECT_ID: TILEDESK_PROJECT_ID,
                    TOKEN: USER_ADMIN_TOKEN
                });
                
                const integration = await tdClientTest.integration.addIntegration("openai", { apikey: process.env.GPT_KEY, organization: 'test-openai' }).catch((err) => { 
                    console.error(err); 
                    reject(err);
                })
                assert(integration)
                assert(integration._id)
                assert(integration.name)
                assert.equal(integration.name, 'openai')
                assert(integration.value)
                assert(integration.value.apikey)
                assert(integration.value.organization)
                assert.equal(integration.value.apikey, process.env.GPT_KEY)
                assert.equal(integration.value.organization, 'test-openai')
                integration_id = integration._id
                resolve();
            })
        });

        after(async function () {
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            const integration_result = await tdClientTest.integration.deleteIntegration(integration_id).catch((err) => { 
                console.error(err); 
                throw err;
            })
            assert(integration_result)
            assert(integration_result.success===true)
        });

        it('gpt-3.5-turbo (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Openai'
                    const model = 'gpt-3.5-turbo'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[6]
                        assert.strictEqual(button1.value, message_text, `Expect button1 to have "${message_text} as text`)
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, `Ask a question to ${message_text}`, `Expect msg.text to be 'Ask a question to ${message_text}' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[0]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_27';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('gpt-4-turbo-preview (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Openai'
                    const model = 'gpt-4-turbo-preview'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[6]
                        assert.strictEqual(button1.value, message_text, `Expect button1 to have "${message_text} as text`)
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, `Ask a question to ${message_text}`, `Expect msg.text to be 'Ask a question to ${message_text}' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[1]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_28';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('gpt-4 (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Openai'
                    const model = 'gpt-4'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[6]
                        assert.strictEqual(button1.value, message_text, `Expect button1 to have "${message_text} as text`)
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, `Ask a question to ${message_text}`, `Expect msg.text to be 'Ask a question to ${message_text}' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[2]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_29';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('gpt-4o-mini (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Openai'
                    const model = 'gpt-4o-mini'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[6]
                        assert.strictEqual(button1.value, message_text, `Expect button1 to have "${message_text} as text`)
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, `Ask a question to ${message_text}`, `Expect msg.text to be 'Ask a question to ${message_text}' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[3]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_30';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('gpt-4o (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Openai'
                    const model = 'gpt-4o'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[6]
                        assert.strictEqual(button1.value, message_text, `Expect button1 to have "${message_text} as text`)
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, `Ask a question to ${message_text}`, `Expect msg.text to be 'Ask a question to ${message_text}' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[4]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_31';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(20000);

        it('gpt-5-nano (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Openai'
                    const model = 'gpt-5-nano'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[6]
                        assert.strictEqual(button1.value, message_text, `Expect button1 to have "${message_text} as text`)
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, `Ask a question to ${message_text}`, `Expect msg.text to be 'Ask a question to ${message_text}' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[5]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_32';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(12000);

        it('gpt-5-mini (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Openai'
                    const model = 'gpt-5-mini'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[6]
                        assert.strictEqual(button1.value, message_text, `Expect button1 to have "${message_text} as text`)
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, `Ask a question to ${message_text}`, `Expect msg.text to be 'Ask a question to ${message_text}' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[6]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_33';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(8000);

        it('gpt-5 (~1s)', () => {
            return new Promise(async (resolve, reject)=> {
                let buttonGetIsPressed = false;
                let generatePrompt = false;

                const messageHandler = async (message, topic) => {
                    const message_text = 'Openai'
                    const model = 'gpt-5'
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
                        message.sender_fullname === "Ai Prompt Chatbot"
                    ) {
                        if (LOG_STATUS) {
                            console.log("> Incoming message from 'welcome' intent ok.");
                        }
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        let command = commands[1]
                        assert.equal(command.type, 'message')
                        assert(command.message, "Expect command.message exist")
                        let msg = command.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, 'Hi, which LLM would you like to try?', `Expect msg.text to be 'Hi, which LLM would you like to try?' but got: ${msg.text} `)

                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[6]
                        assert.strictEqual(button1.value, message_text, `Expect button1 to have "${message_text} as text`)
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
                                buttonGetIsPressed = true
                            }
                        );
                                        
                    } else if( buttonGetIsPressed && !generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        assert.equal(msg.text, `Ask a question to ${message_text}`, `Expect msg.text to be 'Ask a question to ${message_text}' but got: ${msg.text} `)
                        
                        //check buttons 
                        assert(msg.attributes, "Expect msg.attribues exist")
                        assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                        assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                        assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                        
                        let button1 = msg.attributes.attachment.buttons[7]
                        assert.strictEqual(button1.value, model, `Expect button1 to have "${model}" as text`)
                        assert(button1.action)

                        chatClient1.sendMessage(
                            model,
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

                                assert.equal(msg.text, model, `Message sent from user expected to be "${message_text}"`)
                                generatePrompt = true 
                            }
                        );

                        // resolve();
                        
                    } else if( generatePrompt &&
                        message &&  message.sender_fullname === "Ai Prompt Chatbot"
                    ){
                        assert(message.attributes, "Expect message.attributes exist")
                        assert(message.attributes.intentName);
                        assert.equal(message.attributes.intentName, 'ai_reply')
                        assert(message.attributes.commands, "Expect message.attributes.commands")
                        assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                        let commands = message.attributes.commands
                        
                        let command1 = commands[1]
                        assert.equal(command1.type, 'message')
                        assert(command1.message, "Expect command.message exist")
                        let msg = command1.message
                        assert(msg.text, "Expect msg.text exist")
                        resolve();
                    }
                    else {
                        // console.log("Message not computed:", message.text);
                    }

                };

                //add handler to list
                handlerId = chatClient1.onMessageAdded(messageHandler);

                if (LOG_STATUS) {
                    console.log("Sending test message...");
                }
                let recipient_id = group_id + '_34';
                // let recipient_fullname = group_name;
                triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                    if (err) {
                        console.error("An error occurred while triggering echo bot conversation:", err);
                    }
                });
            })
        }).timeout(12000);
    });

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
                    "attributes": { }
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