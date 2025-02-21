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

describe('CHATBOT: Reply types', async () => {
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

            const bot = require('./chatbots/reply_types_bot.json');
            
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

    it('Type text: expect to receive intent "text" (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonTextIsPressed = false;
            chatClient1.onMessageAdded((message, topic) => {
                const message_text = 'text'
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
                    message.sender_fullname === "Reply types Chatbot"
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
                    assert.equal(msg.text, 'Test reply type', `Expect msg.text to be 'Test reply type' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[0]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "usecase1" as text')
                    assert(button1.action)
                    
                    // done();
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
                    message.sender_fullname === "Reply types Chatbot"
                ){  
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.attributes.intentName, 'text')

                    //check command of type text
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert.equal(msg.text, "text_type")
                    assert.equal(msg.type, 'text')
                    //intent 'text
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

    it('Type image: expect to receive intent "image" (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonImageIsPressed = false;
            chatClient1.onMessageAdded((message, topic) => {
                const message_text = 'image'
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
                    message.sender_fullname === "Reply types Chatbot"
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
                    assert.equal(msg.text, 'Test reply type', `Expect msg.text to be 'Test reply type' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button2 = msg.attributes.attachment.buttons[1]
                    assert.strictEqual(button2.value, message_text, 'Expect button2 to have "image" as text')
                    assert(button2.action)
                    
                    // done();
                    chatClient1.sendMessage(
                        message_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID, action: button2.action },
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
                            buttonImageIsPressed = true
                        }
                    );

                                  
                }
                else if(buttonImageIsPressed && 
                    message.sender_fullname === "Reply types Chatbot"
                ){  
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.attributes.intentName, 'image')

                    //check command of type text
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert.equal(msg.text, "image_type")
                    assert.equal(msg.type, 'image')
                    assert(msg.metadata, "Expect msg.metadata exist")
                    assert(msg.metadata.src, "Expect msg.metadata.src exist")
                    assert(msg.metadata.downloadURL, "Expect msg.metadata.downloadURL exist")
                    assert.equal(msg.metadata.type, 'image/png', "Expect msg.metadata.type === 'image/png'")
                
                    //intent 'text
                    resolve()   
                }
                else {
                    // console.log("Message not computed:", message.text);
                }
                
            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id +'_1';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Type frame: expect to receive intent "frame" (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonFrameIsPressed = false;
            chatClient1.onMessageAdded((message, topic) => {
                const message_text = 'frame'
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
                    message.sender_fullname === "Reply types Chatbot"
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
                    assert.equal(msg.text, 'Test reply type', `Expect msg.text to be 'Test reply type' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button3 = msg.attributes.attachment.buttons[2]
                    assert.strictEqual(button3.value, message_text, 'Expect button3 to have "frame" as text')
                    assert(button3.action)
                    
                    // done();
                    chatClient1.sendMessage(
                        message_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID, action: button3.action },
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
                            buttonFrameIsPressed = true
                        }
                    );

                                  
                }
                else if(buttonFrameIsPressed && 
                    message.sender_fullname === "Reply types Chatbot"
                ){  
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.attributes.intentName, 'frame')

                    //check command of type text
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert.equal(msg.text, "frame_type")
                    assert.equal(msg.type, 'frame')
                    assert(msg.metadata, "Expect msg.metadata exist")
                    assert(msg.metadata.src, "Expect msg.metadata.src exist")
                    assert.equal(msg.metadata.type, 'frame', "Expect msg.metadata.type === 'frame'")
                
                    //intent 'text
                    resolve()   
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

                

                
            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id +'_2';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Type gallery: expect to receive intent "gallery" (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonGalleryIsPressed = false;
            chatClient1.onMessageAdded((message, topic) => {
                const message_text = 'gallery'
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
                    message.sender_fullname === "Reply types Chatbot"
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
                    assert.equal(msg.text, 'Test reply type', `Expect msg.text to be 'Test reply type' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button4 = msg.attributes.attachment.buttons[3]
                    assert.strictEqual(button4.value, message_text, 'Expect button4 to have "gallery" as text')
                    assert(button4.action)
                    
                    chatClient1.sendMessage(
                        message_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID, action: button4.action },
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
                            buttonGalleryIsPressed = true
                        }
                    );

                                  
                }
                else if(buttonGalleryIsPressed && 
                    message.sender_fullname === "Reply types Chatbot"
                ){  
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.attributes.intentName, 'gallery')

                    //check command of type text
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert.equal(msg.type, 'gallery')
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.type, "Expect msg.attributes.attachment.type exist")
                    assert(msg.attributes.attachment.gallery, "Expect msg.attributes.attachment.gallery exist")
                    assert(msg.attributes.attachment.gallery.length > 0, "Expect msg.attributes.attachment.gallery.length > 0 exist")

                    let galleryElem = msg.attributes.attachment.gallery
                    galleryElem.forEach((el) => {
                        assert(el.title, "Expect el.title exist")
                        assert(el.description, "Expect el.description exist")
                        assert(el.buttons, "Expect el.buttons exist")
                        assert(el.preview, "Expect el.preview exist")
                        assert(el.preview.name, "Expect el.preview.name exist")
                        assert(el.preview.src, "Expect el.preview.src exist")
                        assert(el.preview.downloadURL, "Expect el.preview.downloadURL exist")
                        assert(el.preview.name, "Expect el.preview.name exist")

                        let buttons = el.buttons
                        buttons.forEach((button) => {
                            assert(button.value)
                            assert(button.type)
                            assert.equal(button.type, 'action')
                            assert(button.action)
                            assert.ok(button.action.startsWith('#'))
                        })
                    })
                
                    //intent 'text
                    resolve()   
                }
                else {
                    // console.log("Message not computed:", message.text);
                }                
            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id +'_3';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Type redirect: expect to receive intent "redirect" (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonRedirectIsPressed = false;
            chatClient1.onMessageAdded((message, topic) => {
                const message_text = 'redirect'
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
                    message.sender_fullname === "Reply types Chatbot"
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
                    assert.equal(msg.text, 'Test reply type', `Expect msg.text to be 'Test reply type' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button5 = msg.attributes.attachment.buttons[4]
                    assert.strictEqual(button5.value, message_text, 'Expect button5 to have "redirect" as text')
                    assert(button5.action)
                    
                    chatClient1.sendMessage(
                        message_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID, action: button5.action },
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
                            buttonRedirectIsPressed = true
                        }
                    );

                                  
                }
                else if(buttonRedirectIsPressed && 
                    message.sender_fullname === "Reply types Chatbot"
                ){  
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.attributes.intentName, 'redirect')


                    //check command of type text
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert.equal(msg.type, 'redirect')
                    assert(msg.metadata, "Expect msg.metadata exist")
                    assert(msg.metadata.src, "Expect msg.metadata.src exist")
                    assert(msg.metadata.target, "Expect msg.metadata.target exist")
                    assert.equal(msg.metadata.target, 'blank', "Expect msg.metadata.target to be 'blank'")

                    resolve()   
                }
                else {
                    // console.log("Message not computed:", message.text);
                }                
            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id +'_4';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Type text with buttons: expect to receive intent "text_buttons" (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonTextButtonsIsPressed = false;
            let buttonActionIsPressed = false;
            chatClient1.onMessageAdded((message, topic) => {
                const message_text = 'text with buttons'
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
                    message.sender_fullname === "Reply types Chatbot"
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
                    assert.equal(msg.text, 'Test reply type', `Expect msg.text to be 'Test reply type' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button6 = msg.attributes.attachment.buttons[5]
                    assert.strictEqual(button6.value, message_text, 'Expect button6 to have "text with buttons" as text')
                    assert(button6.action)
                    
                    chatClient1.sendMessage(
                        message_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID, action: button6.action },
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
                            buttonTextButtonsIsPressed = true
                        }
                    );

                                  
                }
                else if(buttonTextButtonsIsPressed && 
                    message.sender_fullname === "Reply types Chatbot"
                ){  

                    buttonTextButtonsIsPressed = false
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.attributes.intentName, 'text_with_buttons')

                    //check command of type text
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert.equal(msg.text, "text with buttons")
                    assert.equal(msg.type, 'text')
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.type, "Expect msg.attributes.attachment.type exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    assert(msg.attributes.attachment.buttons.length === 3, "Expect msg.attributes.attachment.buttons.length = 3 ")

                    let button_text = msg.attributes.attachment.buttons[0]
                    let button_action = msg.attributes.attachment.buttons[1]
                    let button_url = msg.attributes.attachment.buttons[2]
                    
                    //check button_text
                    assert(button_text.value)
                    assert.equal(button_text.value, 'button_text')
                    assert(button_text.type)
                    assert.equal(button_text.type, 'text')
                    assert.strictEqual(button_text.action, '', "Expect button_text.action === ''");

                    //check button_url
                    assert(button_url.value)
                    assert.equal(button_url.value, 'button_url')
                    assert(button_url.link)
                    assert.equal(button_url.link, 'www.tiledesk.com')
                    assert(button_url.target)
                    assert.equal(button_url.target, 'blank')
                    assert(button_text.type)
                    assert.equal(button_url.type, 'url')
                    assert.strictEqual(button_url.action, '', "Expect button_text.action === ''");

                    //check button_action
                    assert(button_action.value)
                    assert.equal(button_action.value, 'button_action')
                    assert(button_action.type)
                    assert.equal(button_action.type, 'action')
                    assert(button_action.action)
                    assert.ok(button_action.action.startsWith('#'))
                    assert.ok(button_action.action.includes('{') && button_action.action.includes('}'))
                    let button_attributes = button_action.action.substring(button_action.action.indexOf('{'))
                    try {

                        let attributes = JSON.parse(button_attributes);
                        assert(attributes)
                        assert(attributes.user_city)
                        assert.equal(attributes.user_city, 'italy')

                        chatClient1.sendMessage(
                            button_action.value,
                            'text',
                            recipient_id,
                            "Test support group",
                            user1.fullname,
                            {projectId: config.TILEDESK_PROJECT_ID, action: button_action.action },
                            null, // no metadata
                            'group',
                            (err, msg) => {
                                if (err) {
                                    console.error("Error send:", err);
                                }
                                if (LOG_STATUS) {
                                    console.log("Message Sent ok:", msg);
                                }
                                assert.equal(msg.text, button_action.value, `Message sent from user expected to be "${button_action.value}"`)
                                buttonActionIsPressed = true
                            }
                        );

                    } catch (error) {
                        reject(error)
                    }

  
                }else if(   buttonActionIsPressed &&
                    message.sender_fullname === "Reply types Chatbot"
                ){
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.attributes.intentName, 'buttons')
                    
                    //check command of type text
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert.equal(msg.text, "button: italy")
                    assert.equal(msg.type, 'text')

                    resolve() 
                }
                else {
                    // console.log("Message not computed:", message.text);
                }                
            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id +'_5';
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