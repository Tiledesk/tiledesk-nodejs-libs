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

describe('CHATBOT: Web request v2 Action', async () => {
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
            
            const bot = require('./chatbots/web_request_v2_bot.json');
            let intent = bot.intents.find(intent => intent.intent_display_name === 'set variables')
            intent.actions.filter(action => action._tdActionType === 'setattribute-v2')[0].operation.operands[0].value = API_ENDPOINT
            intent.actions.filter(action => action._tdActionType === 'setattribute-v2')[1].operation.operands[0].value = USER_ADMIN_TOKEN
            
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

    it('GET request - API_URL/ ✅ (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'Get'
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
                    message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'Make a Web Request', `Expect msg.text to be 'Make a Web Request' but got: ${msg.text} `)

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
                            buttonGetIsPressed = true
                        }
                    );
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'SUCCESS', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

                    let command2 = commands[3]
                    assert.equal(command2.type, 'message')
                    assert(command2.message, "Expect command.message exist")
                    let msg2 = command2.message
                    assert(msg2.text, "Expect msg.text exist")
                    assert(msg2.text.includes("Result:"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    assert(msg2.text.includes("Hello from Tiledesk server"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

                    let command3 = commands[5]
                    assert.equal(command3.type, 'message')
                    assert(command3.message, "Expect command.message exist")
                    let msg3 = command3.message
                    assert(msg3.text, "Expect msg.text exist")
                    assert(msg3.text.includes("Status:\n200"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
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
            });
        })
    })

    it('GET request with auth - ✅ API_URL/projects/PROJECT_ID (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'Get with auth'
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
                    message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'Make a Web Request', `Expect msg.text to be 'Make a Web Request' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[1]
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
                            buttonGetIsPressed = true
                        }
                    );
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'SUCCESS', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

                    let command2 = commands[3]
                    assert.equal(command2.type, 'message')
                    assert(command2.message, "Expect command.message exist")
                    let msg2 = command2.message
                    assert(msg2.text, "Expect msg.text exist")
                    assert(msg2.text.includes("Result:"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    const match = msg2.text.match(/Result:\n([\s\S]*)/);
                    if(match){
                        const project = JSON.parse(match[1])
                        assert(project.id)
                        assert.equal(project.id, TILEDESK_PROJECT_ID)
                    }else{
                        reject();
                    }
                    
                    let command3 = commands[5]
                    assert.equal(command3.type, 'message')
                    assert(command3.message, "Expect command.message exist")
                    let msg3 = command3.message
                    assert(msg3.text, "Expect msg.text exist")
                    assert(msg3.text.includes("Status:\n200"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
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
            });
        })
    })

    it('POST request with auth - ✅ API_BASE_URL/PROJECT_ID/requests/REQUEST_ID/notes (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'Post'
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
                    message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'Make a Web Request', `Expect msg.text to be 'Make a Web Request' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[2]
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
                            buttonGetIsPressed = true
                        }
                    );
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'SUCCESS', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

                    let command2 = commands[3]
                    assert.equal(command2.type, 'message')
                    assert(command2.message, "Expect command.message exist")
                    let msg2 = command2.message
                    assert(msg2.text, "Expect msg.text exist")
                    assert(msg2.text.includes("Result:"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    const match = msg2.text.match(/Result:\n([\s\S]*)/);
                    if(match){
                        const project = JSON.parse(match[1])
                        assert(project)
                        assert(project.notes)
                        assert(project.notes[0].text)
                        assert(project.notes[0].createdBy)
                        assert.equal(project.notes[0].text, "hello")
                        assert.equal(project.notes[0].createdBy, USER_ADMIN_ID)
                    }else{
                        reject();
                    }
                    let command3 = commands[5]
                    assert.equal(command3.type, 'message')
                    assert(command3.message, "Expect command.message exist")
                    let msg3 = command3.message
                    assert(msg3.text, "Expect msg.text exist")
                    assert(msg3.text.includes("Status:\n200"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
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
            });
        })
    })

    it('POST request with auth - ❌ ERROR: API_BASE_URL/PROJECT_ID/requests/REQUEST_ID/notes (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'Post with error'
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
                    message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'Make a Web Request', `Expect msg.text to be 'Make a Web Request' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[3]
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
                            buttonGetIsPressed = true
                        }
                    );
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'FAIL', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

                    let command2 = commands[3]
                    assert.equal(command2.type, 'message')
                    assert(command2.message, "Expect command.message exist")
                    let msg2 = command2.message
                    assert(msg2.text, "Expect msg.text exist")
                    assert(msg2.text.includes("Result:"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    
                    let command3 = commands[5]
                    assert.equal(command3.type, 'message')
                    assert(command3.message, "Expect command.message exist")
                    let msg3 = command3.message
                    assert(msg3.text, "Expect msg.text exist")
                    assert(msg3.text.includes("Error:\n"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    
                    let command4 = commands[7]
                    assert.equal(command4.type, 'message')
                    assert(command4.message, "Expect command.message exist")
                    let msg4 = command4.message
                    assert(msg4.text, "Expect msg.text exist")
                    assert.equal(msg4.text, "FlowError:\nError parsing json body", `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    
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
            });
        })
    })

    it('PUT request with auth - ✅ API_BASE_URL/PROJECT_ID/requests/REQUEST_ID/participants (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'Put'
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
                    message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'Make a Web Request', `Expect msg.text to be 'Make a Web Request' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[4]
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
                            buttonGetIsPressed = true
                        }
                    );
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'SUCCESS', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

                    let command2 = commands[3]
                    assert.equal(command2.type, 'message')
                    assert(command2.message, "Expect command.message exist")
                    let msg2 = command2.message
                    assert(msg2.text, "Expect msg.text exist")
                    assert(msg2.text.includes("Result:"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    const match = msg2.text.match(/Result:\n([\s\S]*)/);
                    if(match){
                        const request = JSON.parse(match[1])
                        assert(request)
                        assert(request.id)
                        assert(request.participants)
                        assert.equal(request.participants, "bot_"+BOT_ID)
                    }else{
                        reject();
                    }
                    let command3 = commands[5]
                    assert.equal(command3.type, 'message')
                    assert(command3.message, "Expect command.message exist")
                    let msg3 = command3.message
                    assert(msg3.text, "Expect msg.text exist")
                    assert(msg3.text.includes("Status:\n200"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
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

    it('PUT request with auth - ❌ ERROR: API_BASE_URL/PROJECT_ID/requests/REQUEST_ID/participants (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'Put with error'
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
                    message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'Make a Web Request', `Expect msg.text to be 'Make a Web Request' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[5]
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
                            buttonGetIsPressed = true
                        }
                    );
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'FAIL', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

                    let command2 = commands[3]
                    assert.equal(command2.type, 'message')
                    assert(command2.message, "Expect command.message exist")
                    let msg2 = command2.message
                    assert(msg2.text, "Expect msg.text exist")
                    assert(msg2.text.includes('Result:\n"Unauthorized"'), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    
                    let command3 = commands[5]
                    assert.equal(command3.type, 'message')
                    assert(command3.message, "Expect command.message exist")
                    let msg3 = command3.message
                    assert(msg3.text, "Expect msg.text exist")
                    assert(msg3.text.includes("Error:\nRequest failed with status code 401"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    
                    let command4 = commands[7]
                    assert.equal(command4.type, 'message')
                    assert(command4.message, "Expect command.message exist")
                    let msg4 = command4.message
                    assert(msg4.text, "Expect msg.text exist")
                    assert.equal(msg4.text, "FlowError:\n", `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
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

    it('PATCH request with auth - ✅ API_BASE_URL/PROJECT_ID/requests/REQUEST_ID/attributes (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'Patch'
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
                    message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'Make a Web Request', `Expect msg.text to be 'Make a Web Request' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[6]
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
                            buttonGetIsPressed = true
                        }
                    );
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'SUCCESS', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

                    let command2 = commands[3]
                    
                    assert.equal(command2.type, 'message')
                    assert(command2.message, "Expect command.message exist")
                    let msg2 = command2.message
                    assert(msg2.text, "Expect msg.text exist")
                    assert(msg2.text.includes("Result:"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    const match = msg2.text.match(/Result:\n([\s\S]*)/);
                    if(match){
                        const request = JSON.parse(match[1])
                        assert(request)
                        assert(request.id)
                        assert(request.attributes)
                        assert(request.attributes.test)
                        assert.equal(request.attributes.test, "true")
                    }else{
                        reject();
                    }
                    let command3 = commands[5]
                    assert.equal(command3.type, 'message')
                    assert(command3.message, "Expect command.message exist")
                    let msg3 = command3.message
                    assert(msg3.text, "Expect msg.text exist")
                    assert(msg3.text.includes("Status:\n200"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
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
    
    it('PATCH request with auth - ❌ ERROR: API_BASE_URL/PROJECT_ID/requests/REQUEST_ID/attributes (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGetIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'Patch with no auth'
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
                    message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'Make a Web Request', `Expect msg.text to be 'Make a Web Request' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[7]
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
                            buttonGetIsPressed = true
                        }
                    );
                                     
                } else if( buttonGetIsPressed &&
                    message &&  message.sender_fullname === "Web Request v2 Chatbot"
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
                    assert.equal(msg.text, 'FAIL', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

                    let command2 = commands[3]
                    assert.equal(command2.type, 'message')
                    assert(command2.message, "Expect command.message exist")
                    let msg2 = command2.message
                    assert(msg2.text, "Expect msg.text exist")
                    assert(msg2.text.includes('Result:\n"Unauthorized"'), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    
                    let command3 = commands[5]
                    assert.equal(command3.type, 'message')
                    assert(command3.message, "Expect command.message exist")
                    let msg3 = command3.message
                    assert(msg3.text, "Expect msg.text exist")
                    assert(msg3.text.includes("Error:\nRequest failed with status code 401"), `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    
                    let command4 = commands[7]
                    assert.equal(command4.type, 'message')
                    assert(command4.message, "Expect command.message exist")
                    let msg4 = command4.message
                    assert(msg4.text, "Expect msg.text exist")
                    assert.equal(msg4.text, "FlowError:\n", `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)
                    
                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
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