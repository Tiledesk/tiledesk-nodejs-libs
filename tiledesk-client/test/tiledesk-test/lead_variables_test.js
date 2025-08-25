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

describe('CHATBOT: Check lead variables', async () => {
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
            
            const bot = require('./chatbots/check_lead_variables_bot.json');
            
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

    it('UserEmail (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            const messageHandler = async (message, topic) => {
                const message_text = 'userEmail'
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
                    message.sender_fullname === "Check lead variables"
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
                    assert.equal(msg.text, 'Choose variable to check', `Expect msg.text to be 'Choose variable to check' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[0]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "userEmail" as text')
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
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Check lead variables"
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
                    assert(msg.text.startsWith('userEmail:'), `Expect msg.text to start with 'userEmail:' but got: ${msg.text} `)
                    let userEmail = msg.text.substring('userEmail: '.length).trim();
                    assert(userEmail)
                    assert.equal(userEmail, 'test@email.com', `Expected userEmail to be 'test@email.com', but got: '${userEmail}'`);
                    // chatClient1.removeOnMessageAddedHandler(handlerId);
                    resolve();
                    
                }else if(buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Bot"
                ){
                    // console.log('hereeeee 111 message.attributes', message.attributes)
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.subtype, "Expect message.attributes.subtype")
                    assert.equal(message.attributes.subtype, 'info/support', "Expect message.attributes.subtype to be 'bot'")
                    assert(message.attributes.messagelabel, "Expect message.attributes.intemessagelabelntName")
                    assert(message.attributes.messagelabel.key, "Expect message.attributes.key")
                    assert.equal(message.attributes.messagelabel.key, 'LEAD_UPDATED', "Expect message.attributes.messagelabel.key to be 'LEAD_UPDATED'")
                    // resolve();
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
    })

    it('UserFullname (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            const messageHandler = async (message, topic) => {
                const message_text = 'userFullname'
                if(message.recipient !== recipient_id){
                    // console.log('message.recipient !== recipient_id', message.recipient, recipient_id, message)
                    // reject();
                    return;
                }
                if (LOG_STATUS) {
                    console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
                }
                if (
                    message &&
                    message.attributes.intentName ===  "welcome" &&
                    message.sender_fullname === "Check lead variables"
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
                    assert.equal(msg.text, 'Choose variable to check', `Expect msg.text to be 'Choose variable to check' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[1]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "userFullname" as text')
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
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Check lead variables"
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
                    assert(msg.text.startsWith('userFullname:'), `Expect msg.text to start with 'userFullname:' but got: ${msg.text} `)
                    const userFullname = msg.text.substring('userFullname: '.length).trim();
                    assert(userFullname)
                    assert.equal(userFullname, 'Test User', `Expected userFullname to be 'Test User', but got: '${userFullname}'`);
                    // chatClient1.removeOnMessageAddedHandler(handlerId);
                    resolve()
                    
                }else if(buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Bot"
                ){
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.subtype, "Expect message.attributes.subtype")
                    assert.equal(message.attributes.subtype, 'info/support', "Expect message.attributes.subtype to be 'bot'")
                    assert(message.attributes.messagelabel, "Expect message.attributes.intemessagelabelntName")
                    assert(message.attributes.messagelabel.key, "Expect message.attributes.key")
                    assert.equal(message.attributes.messagelabel.key, 'LEAD_UPDATED', "Expect message.attributes.messagelabel.key to be 'LEAD_UPDATED'")
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
            let recipient_id = group_id + '_1';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('UserPhone (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            const messageHandler = async (message, topic) => {
                const message_text = 'userPhone'
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
                    message.sender_fullname === "Check lead variables"
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
                    assert.equal(msg.text, 'Choose variable to check', `Expect msg.text to be 'Choose variable to check' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[2]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "userPhone" as text')
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
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Check lead variables"
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
                    assert(msg.text.startsWith('userPhone:'), `Expect msg.text to start with 'userPhone:' but got: ${msg.text} `)
                    const userPhone = msg.text.substring('userPhone: '.length).trim();
                    assert(userPhone)
                    assert.equal(userPhone, '+393332342123')
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            }
            //add handler to list
            handlerId = chatClient1.onMessageAdded(messageHandler);

            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id + '_2';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('UserLeadId (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            const messageHandler = async (message, topic) => {
                const message_text = 'userLeadId'
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
                    message.sender_fullname === "Check lead variables"
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
                    assert.equal(msg.text, 'Choose variable to check', `Expect msg.text to be 'Choose variable to check' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[3]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "userLeadId" as text')
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
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Check lead variables"
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
                    assert(msg.text.startsWith('userLeadId:'), `Expect msg.text to start with 'userLeadId:' but got: ${msg.text} `)
                    const userLeadId = msg.text.substring('userLeadId:'.length).trim();
                    assert(userLeadId)
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            }
            //add handler to list
            handlerId = chatClient1.onMessageAdded(messageHandler);

            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id + '_3';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('UserCompany (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            const messageHandler = async (message, topic) => {
                const message_text = 'userCompany'
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
                    message.sender_fullname === "Check lead variables"
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
                    assert.equal(msg.text, 'Choose variable to check', `Expect msg.text to be 'Choose variable to check' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[4]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "userCompany" as text')
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
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Check lead variables"
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
                    assert(msg.text.startsWith('userCompany:'), `Expect msg.text to start with 'userCompany:' but got: ${msg.text} `)
                    const userCompany = msg.text.substring('userCompany:'.length).trim();
                    assert(userCompany);
                    assert.equal(userCompany, 'MyCompany', `Expected userCompany to be 'MyCompany', but got: '${userCompany}'`);
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            }
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
    })

    it('CurrentPhoneNumber (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            const messageHandler = async (message, topic) => {
                const message_text = 'currentPhoneNumber'
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
                    message.sender_fullname === "Check lead variables"
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
                    assert.equal(msg.text, 'Choose variable to check', `Expect msg.text to be 'Choose variable to check' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[5]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "currentPhoneNumber" as text')
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
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Check lead variables"
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
                    assert(msg.text.startsWith('currentPhoneNumber:'), `Expect msg.text to start with 'currentPhoneNumber:' but got: ${msg.text} `)
                    const currentPhoneNumber = msg.text.substring('currentPhoneNumber: '.length).trim();
                    console.log('userrrrr currentPhoneNumber', currentPhoneNumber)
                    assert(currentPhoneNumber)
                    assert.equal(currentPhoneNumber, '+393332342123', `Expected currentPhoneNumber to be '+393332342123', but got: '${currentPhoneNumber}'`);
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            }
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
    })

    it('DecodedCustomJWT (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            const messageHandler = async (message, topic) => {
                const message_text = 'decodedCustomJWT'
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
                    message.sender_fullname === "Check lead variables"
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
                    assert.equal(msg.text, 'Choose variable to check', `Expect msg.text to be 'Choose variable to check' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[6]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "decodedCustomJWT" as text')
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
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Check lead variables"
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
                    assert(msg.text.startsWith('decodedCustomJWT:'), `Expect msg.text to start with 'decodedCustomJWT:' but got: ${msg.text} `)
                    const decodedCustomJWT = msg.text.substring('decodedCustomJWT: '.length).trim();
                    assert(decodedCustomJWT)
                    let json = JSON.parse(decodedCustomJWT);
                    assert(Object.keys(json).length > 0, `Expected something after 'decodedCustomJWT:', but got: '${msg.text}'`);
                    assert.equal(json.id, user1.userid, `Expected decodedCustomJWT.id to be '${user1.userid}', but got: '${json.id}'`);
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            }
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
    })

    it('StrongAuthenticated (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            const messageHandler = async (message, topic) => {
                const message_text = 'strongAuthenticated'
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
                    message.sender_fullname === "Check lead variables"
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
                    assert.equal(msg.text, 'Choose variable to check', `Expect msg.text to be 'Choose variable to check' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[7]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "strongAuthenticated" as text')
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
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Check lead variables"
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
                    assert(msg.text.startsWith('strongAuthenticated:'), `Expect msg.text to start with 'strongAuthenticated:' but got: ${msg.text} `)
                    const strongAuthenticated = msg.text.substring('strongAuthenticated: '.length).trim();
                    assert.equal(strongAuthenticated, "false")
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            }
            //add handler to list
            handlerId = chatClient1.onMessageAdded(messageHandler);

            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id + '_7';
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
                    "attributes": {
                        "departmentId": default_dep.id,
                        "departmentName": default_dep.name,
                        "ipAddress": "x.x.x.x",
                        "client": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
                        "sourcePage": "https://<widget-test>/",
                        "payload": {
                            "test": true
                        },
                        "requester_id": user1.userid
            
                    }
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