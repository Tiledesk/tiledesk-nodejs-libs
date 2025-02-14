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

let TILEDESK_PROJECT_ID = "";
if (process.env && process.env.AUTOMATION_TEST_TILEDESK_PROJECT_ID) {
	TILEDESK_PROJECT_ID = process.env.AUTOMATION_TEST_TILEDESK_PROJECT_ID
}
else {
    throw new Error(".env.AUTOMATION_TEST_TILEDESK_PROJECT_ID is mandatory");
}

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
let BOT_ID_2 = null;
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
let request;
let chatbot_2_slug;

describe('CHATBOT: Replace bot v3', async () => {
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

            const bot = require('./chatbots/CHATBOT_replace_bot_v3_bots.js').bot;
            const replacedBot = require('./chatbots/CHATBOT_replace_bot_v3_bots.js').replacedBot
           
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            })

            const data2 = await tdClientTest.chatbot.importChatbot(replacedBot).catch((err) => { 
                console.error(err); 
                reject(err);
            })
            BOT_ID_2 = data2._id;
            chatbot_2_slug = data2.slug

            //replace botId for chatbot to be replaced into replace-bot-v3 action
            bot.intents.find(el => el.intent_display_name === 'replace_by_id').actions[0].botId= BOT_ID_2

            
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
            const result2 = await tdClientTest.chatbot.deleteChatbot(BOT_ID_2).catch((err) => { 
                assert.ok(false);
            });
            done();
        });
    });

    it('Replace Bot by Id (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonTextIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'replace by id'
                if(message.recipient !== recipient_id){
                    reject();
                    return;
                }
                
                if (LOG_STATUS) {
                    console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
                }
                if (
                    message &&
                    message.attributes.intentName ===  "welcome" &&
                    message.sender_fullname === "ReplaceBotV3 Chatbot"
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
                    assert.equal(msg.text, 'Replace bot v3', `Expect msg.text to be 'Replace bot v3' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[0]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "conversation" as text')
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
                      
                    // resolve()                 
                } else if( buttonTextIsPressed &&
                    message &&  message.sender_fullname === "System"
                ){
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.subtype, "Expect message.attributes.subtype exist")
                    assert.equal(message.attributes.subtype, 'info', `Expect message.attributes.subtype to be 'info' but got: ${message.attributes.subtype}`)

                    assert(message.attributes.messagelabel, "Expect message.attributes.messagelabel exist")
                    assert(message.attributes.messagelabel.key, "Expect message.attributes.messagelabel.key exist")
                    assert(message.attributes.messagelabel.parameters, "Expect message.attributes.messagelabel.parameters exist")
                    assert.equal(message.attributes.messagelabel.key,'MEMBER_JOINED_GROUP' , `Expect message.attributes.subtype to be 'info' but got: ${message.attributes.messagelabel.key}`)
                    assert.equal(message.attributes.messagelabel.parameters.member_id,'bot_'+BOT_ID_2 , `Expect message.attributes.messagelabel.parameters.member_id 'bot_'${BOT_ID_2} but got: ${message.attributes.messagelabel.parameters.member_id}`)
                }
                else if( buttonTextIsPressed &&
                    message &&  message.sender_fullname === "Replace Chatbot v3"
                ){
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert(msg.text, "Expect msg.text exist")
                    assert.equal(msg.text, "Hi, i'm Replace Chatbot v3", `Expect msg.text to be "Hi, i'm Replace Chatbot " but got: ${msg.text}`)
                    
    
                    let requestAfter = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                        console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                        reject(err)
                        assert.ok(false);
                    });
                    assert(requestAfter.participantsBots)
                    assert(requestAfter.participantsBots.length > 0)
                    assert.equal(requestAfter.participantsBots[0], BOT_ID_2, `Expect requestAfter.participantsBots to be ${BOT_ID_2}, but got: ${requestAfter.participantsBots[0]}`);
                    resolve();
                    
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
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }

                request = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                    console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                    reject(err)
                    assert.ok(false);
                });
                
            });

        });
    });

    it('Replace Bot by slug (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonTextIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'replace by slug'
                if(message.recipient !== recipient_id){
                    reject();
                    return;
                }
                
                if (LOG_STATUS) {
                    console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
                }
                if (
                    message &&
                    message.attributes.intentName ===  "welcome" &&
                    message.sender_fullname === "ReplaceBotV3 Chatbot"
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
                    assert.equal(msg.text, 'Replace bot v3', `Expect msg.text to be 'Replace bot v3' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[1]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "replace by slug" as text')
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
                      
                    // resolve()                 
                } else if( buttonTextIsPressed &&
                    message &&  message.sender_fullname === "System"
                ){
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.subtype, "Expect message.attributes.subtype exist")
                    assert.equal(message.attributes.subtype, 'info', `Expect message.attributes.subtype to be 'info' but got: ${message.attributes.subtype}`)

                    assert(message.attributes.messagelabel, "Expect message.attributes.messagelabel exist")
                    assert(message.attributes.messagelabel.key, "Expect message.attributes.messagelabel.key exist")
                    assert(message.attributes.messagelabel.parameters, "Expect message.attributes.messagelabel.parameters exist")
                    assert.equal(message.attributes.messagelabel.key,'MEMBER_JOINED_GROUP' , `Expect message.attributes.subtype to be 'info' but got: ${message.attributes.messagelabel.key}`)
                    assert.equal(message.attributes.messagelabel.parameters.member_id,'bot_'+BOT_ID_2 , `Expect message.attributes.messagelabel.parameters.member_id 'bot_'${BOT_ID_2} but got: ${message.attributes.messagelabel.parameters.member_id}`)
                }
                else if( buttonTextIsPressed &&
                    message &&  message.sender_fullname === "Replace Chatbot v3"
                ){
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert(msg.text, "Expect msg.text exist")
                    assert.equal(msg.text, "Hi, i'm Replace Chatbot v3", `Expect msg.text to be "Hi, i'm Replace Chatbot " but got: ${msg.text}`)
                    
    
                    let requestAfter = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                        console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                        reject(err)
                        assert.ok(false);
                    });
                    assert(requestAfter.participantsBots)
                    assert(requestAfter.participantsBots.length > 0)
                    assert.equal(requestAfter.participantsBots[0], BOT_ID_2, `Expect requestAfter.participantsBots to be ${BOT_ID_2}, but got: ${requestAfter.participantsBots[0]}`);
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id + '_1';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }

                request = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                    console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                    reject(err)
                    assert.ok(false);
                });
                
            });

        });
    });

    it('Replace Bot by slug (with a variable for slug value) (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonTextIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'replace by slug var'
                if(message.recipient !== recipient_id){
                    reject();
                    return;
                }
                
                if (LOG_STATUS) {
                    console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
                }
                if (
                    message &&
                    message.attributes.intentName ===  "welcome" &&
                    message.sender_fullname === "ReplaceBotV3 Chatbot"
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
                    assert.equal(msg.text, 'Replace bot v3', `Expect msg.text to be 'Replace bot v3' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[2]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "replace by slug var" as text')
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
                      
                    // resolve()                 
                } else if( buttonTextIsPressed &&
                    message &&  message.sender_fullname === "System"
                ){
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.subtype, "Expect message.attributes.subtype exist")
                    assert.equal(message.attributes.subtype, 'info', `Expect message.attributes.subtype to be 'info' but got: ${message.attributes.subtype}`)

                    assert(message.attributes.messagelabel, "Expect message.attributes.messagelabel exist")
                    assert(message.attributes.messagelabel.key, "Expect message.attributes.messagelabel.key exist")
                    assert(message.attributes.messagelabel.parameters, "Expect message.attributes.messagelabel.parameters exist")
                    assert.equal(message.attributes.messagelabel.key,'MEMBER_JOINED_GROUP' , `Expect message.attributes.subtype to be 'info' but got: ${message.attributes.messagelabel.key}`)
                    assert.equal(message.attributes.messagelabel.parameters.member_id,'bot_'+BOT_ID_2 , `Expect message.attributes.messagelabel.parameters.member_id 'bot_'${BOT_ID_2} but got: ${message.attributes.messagelabel.parameters.member_id}`)
                }
                else if( buttonTextIsPressed &&
                    message &&  message.sender_fullname === "Replace Chatbot v3"
                ){
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert(msg.text, "Expect msg.text exist")
                    assert.equal(msg.text, "Hi, i'm Replace Chatbot v3", `Expect msg.text to be "Hi, i'm Replace Chatbot " but got: ${msg.text}`)
                    
    
                    let requestAfter = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                        console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                        reject(err)
                        assert.ok(false);
                    });
                    assert(requestAfter.participantsBots)
                    assert(requestAfter.participantsBots.length > 0)
                    assert.equal(requestAfter.participantsBots[0], BOT_ID_2, `Expect requestAfter.participantsBots to be ${BOT_ID_2}, but got: ${requestAfter.participantsBots[0]}`);
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id + '_2';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }

                request = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                    console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                    reject(err)
                    assert.ok(false);
                });
                
            });

        });
    });

    it('Replace Bot by slug and block (with variables for both slug and block value) (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonTextIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'replace by slag and block var'
                if(message.recipient !== recipient_id){
                    reject();
                    return;
                }
                
                if (LOG_STATUS) {
                    console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
                }
                if (
                    message &&
                    message.attributes.intentName ===  "welcome" &&
                    message.sender_fullname === "ReplaceBotV3 Chatbot"
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
                    assert.equal(msg.text, 'Replace bot v3', `Expect msg.text to be 'Replace bot v3' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[3]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "replace by slag and block var" as text')
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
                      
                    // resolve()                 
                } else if( buttonTextIsPressed &&
                    message &&  message.sender_fullname === "System"
                ){
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.subtype, "Expect message.attributes.subtype exist")
                    assert.equal(message.attributes.subtype, 'info', `Expect message.attributes.subtype to be 'info' but got: ${message.attributes.subtype}`)

                    assert(message.attributes.messagelabel, "Expect message.attributes.messagelabel exist")
                    assert(message.attributes.messagelabel.key, "Expect message.attributes.messagelabel.key exist")
                    assert(message.attributes.messagelabel.parameters, "Expect message.attributes.messagelabel.parameters exist")
                    assert.equal(message.attributes.messagelabel.key,'MEMBER_JOINED_GROUP' , `Expect message.attributes.subtype to be 'info' but got: ${message.attributes.messagelabel.key}`)
                    assert.equal(message.attributes.messagelabel.parameters.member_id,'bot_'+BOT_ID_2 , `Expect message.attributes.messagelabel.parameters.member_id 'bot_'${BOT_ID_2} but got: ${message.attributes.messagelabel.parameters.member_id}`)
                }
                else if( buttonTextIsPressed &&
                    message &&  message.sender_fullname === "Replace Chatbot v3"
                ){
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert(msg.text, "Expect msg.text exist")
                    assert.equal(msg.text, "Hi, i'm Replace Chatbot v3", `Expect msg.text to be "Hi, i'm Replace Chatbot " but got: ${msg.text}`)
                    
    
                    let requestAfter = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                        console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                        reject(err)
                        assert.ok(false);
                    });
                    assert(requestAfter.participantsBots)
                    assert(requestAfter.participantsBots.length > 0)
                    assert.equal(requestAfter.participantsBots[0], BOT_ID_2, `Expect requestAfter.participantsBots to be ${BOT_ID_2}, but got: ${requestAfter.participantsBots[0]}`);
                    
                    
                    const chatbotReplaced = await tdClientTest.chatbot.getChatbotById(BOT_ID_2).catch((err) => { 
                        assert.ok(false);
                    });
                    assert(chatbotReplaced._id)
                    assert(chatbotReplaced.slug)
                    assert.equal(chatbotReplaced._id, BOT_ID_2, `Expect chatbotReplaced._id to be ${BOT_ID_2}, but got: ${chatbotReplaced._id}`);
                    assert.equal(chatbotReplaced.slug, chatbot_2_slug, `Expect chatbotReplaced.slug to be ${chatbot_2_slug}, but got: ${chatbotReplaced.slug}`);
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id + '_3';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }

                request = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                    console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                    reject(err)
                    assert.ok(false);
                });
                
            });

        });
    });
});

async function createAnonymousUser(tiledeskProjectId) {
    ANONYMOUS_TOKEN_URL = API_ENDPOINT + '/auth/signinAnonymously';
    if (LOG_STATUS) {
        console.log("Getting ANONYMOUS_TOKEN_URL:", ANONYMOUS_TOKEN_URL);
    }
    return new Promise((resolve, reject) => {
        let data = JSON.stringify({
            "id_project": tiledeskProjectId
        });
    
        let axios_config = {
            method: 'post',
            url: ANONYMOUS_TOKEN_URL, //'https://api.tiledesk.com/v3/auth/signinAnonymously',
            headers: { 
                'Content-Type': 'application/json'
            },
            data : data
        };
        if (LOG_STATUS) {
            console.log("HTTP Params ANONYMOUS_TOKEN_URL:", axios_config);
        }
        axios.request(axios_config)
        .then((response) => {
            if (LOG_STATUS) {
                console.log("Got Anonymous Tiledesk Token:", JSON.stringify(response.data.token));
            }
            const tiledesk_token = response.data.token
            CHAT21_TOKEN_URL = API_ENDPOINT + '/chat21/native/auth/createCustomToken';
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: CHAT21_TOKEN_URL,
                headers: { 
                    'Authorization': tiledesk_token
                }
            };

            axios.request(config)
            .then((response) => {
                const mqtt_token = response.data.token;
                const chat21_userid = response.data.userid;
                resolve({
                    userid: chat21_userid,
                    token:  mqtt_token,
                    tiledesk_token: tiledesk_token
                });
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            });
        })
        .catch((error) => {
            console.log(error);
            reject(error)
        });
    });
}

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

async function importChatbot(bot_data, tiledeskProjectId, token) {
    IMPORT_URL = API_ENDPOINT + `/${tiledeskProjectId}/faq_kb/importjson/null/?create=true`;
    if (LOG_STATUS) {
        console.log("IMPORT_URL:", IMPORT_URL);
    }
    return new Promise((resolve, reject) => {
        let axios_config = {
            method: 'post',
            url: IMPORT_URL,
            headers: { 
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            data : bot_data
        };
        if (LOG_STATUS) {
            console.log("HTTP Params chatbot API URL:", axios_config);
        }
        axios.request(axios_config)
        .then((response) => {
            if (LOG_STATUS) {
                console.log("Import response:", JSON.stringify(response.data));
            }
            resolve(response.data);
        })
        .catch((error) => {
            console.error(error);
            reject(error)
        });
    });
}