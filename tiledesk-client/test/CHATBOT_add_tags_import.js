var assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const { Chat21Client } = require('../chat21client.js');
require('dotenv').config();
const axios = require('axios');
const { TiledeskClient } = require('../index.js');

const Auth = require('./tiledesk_apis/TdAuthApi.js');
const TiledeskClientTest = require('./tiledesk_apis/index.js');
const Chat21Auth = require('./tiledesk_apis/Chat21Auth.js')


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

describe('CHATBOT: Add tags action', async () => {
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

            const bot = require('./chatbots/CHATBOT_add_tags_bot.js').bot;
           
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            })
           
            const data = await tdClientTest.chatbot.importChatbot(bot).catch((err) => { 
                console.log('errrr-->', err); 
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
            //remove pushed tags
            if(pushTagsToList){
                for (const tag of tagsArray) {
                    await tdClientTest.tag.deleteTag(tag._id).catch((err) => { 
                        assert.ok(false);
                    });
                }
                done();
            }
        });
    });

    it('Add tag to conversation (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonTextIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'conversation'
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
                    message.sender_fullname === "Add tags Chatbot"
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
                    assert.equal(msg.text, 'Add tag', `Expect msg.text to be 'Add tag' but got: ${msg.text} `)

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
                    message &&  message.sender_fullname === "Add tags Chatbot"
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
                    assert.equal(msg.text, 'tag_ok', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

    
                    let requestAfter = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                        console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                        reject(err)
                        assert.ok(false);
                    });
                    assert(requestAfter.tags)
                    assert.notEqual(request.tags.length,requestAfter.tags.length, `Expect request.tags to be different after tags is added but got equals`)
                    const found_tagConv1 = requestAfter.tags.some(obj => obj.tag === 'tagConv1');
                    assert.strictEqual(found_tagConv1, true, `Expect request.tags to to have "tagConv1" tag obj, but no one is found into array`);
                    const found_tagConv2 = requestAfter.tags.some(obj => obj.tag === 'tagConv2');
                    assert.strictEqual(found_tagConv2, true, `Expect request.tags to to have "tagConv2" tag obj, but no one is found into array`);
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
        })
    })

    it('Add tag to lead (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonTextIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'lead'
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
                    message.sender_fullname === "Add tags Chatbot"
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
                    assert.equal(msg.text, 'Add tag', `Expect msg.text to be 'Add tag' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button2 = msg.attributes.attachment.buttons[1]
                    assert.strictEqual(button2.value, message_text, 'Expect button2 to have "lead" as text')
                    assert(button2.action)

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
                            buttonTextIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonTextIsPressed &&
                    message &&  message.sender_fullname === "Add tags Chatbot"
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
                    assert.equal(msg.text, 'tag_ok', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

    
                    let requestAfter = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                        console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                        reject(err)
                        assert.ok(false);
                    });
                    assert(requestAfter.lead.tags)
                    assert.notEqual(request.lead.tags.length,requestAfter.lead.tags.length, `Expect request.lead.tags to be different after tags is added but got equals`)
                    const found_tagLead1 = requestAfter.lead.tags.includes('tagLead1')
                    assert.strictEqual(found_tagLead1, true, `Expect request.lead.tags to to have "tagLead1" tag, but no one is found into array`);
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
        })
    })

    it('Add tag to conversation as variable attributes (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonTextIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'conversation_var'
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
                    message.sender_fullname === "Add tags Chatbot"
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
                    assert.equal(msg.text, 'Add tag', `Expect msg.text to be 'Add tag' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button3 = msg.attributes.attachment.buttons[2]
                    assert.strictEqual(button3.value, message_text, 'Expect button3 to have "conversation_var" as text')
                    assert(button3.action)

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
                            buttonTextIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonTextIsPressed &&
                    message &&  message.sender_fullname === "Add tags Chatbot"
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
                    assert.equal(msg.text, 'tag_ok', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

                    
                    let requestAfter = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                        console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                        reject(err)
                        assert.ok(false);
                    });
                    assert(requestAfter.tags)
                    assert.notEqual(request.tags.length,requestAfter.tags.length, `Expect request.tags to be different after tags is added but got equals`)
                    const found_tagConv1 = requestAfter.tags.some(obj => obj.tag === 'tagConv1');
                    assert.strictEqual(found_tagConv1, true, `Expect request.tags to to have "tagConv1" tag obj, but no one is found into array`);
                    const found_tagConvVar1 = requestAfter.tags.some(obj => obj.tag === 'tagConvVar1');
                    assert.strictEqual(found_tagConvVar1, true, `Expect request.tags to to have "tagConvVar1" tag obj, but no one is found into array`);
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
        })
    })

    it('Add tag to lead as variable attributes (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonTextIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'lead_var'
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
                    message.sender_fullname === "Add tags Chatbot"
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
                    assert.equal(msg.text, 'Add tag', `Expect msg.text to be 'Add tag' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button4 = msg.attributes.attachment.buttons[3]
                    assert.strictEqual(button4.value, message_text, 'Expect button4 to have "lead_var" as text')
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
                            buttonTextIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonTextIsPressed &&
                    message &&  message.sender_fullname === "Add tags Chatbot"
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
                    assert.equal(msg.text, 'tag_ok', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

                    
                    let requestAfter = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                        console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                        reject(err)
                        assert.ok(false);
                    });
                    assert(requestAfter.lead.tags)
                    assert.notEqual(request.lead.tags.length,requestAfter.lead.tags.length, `Expect request.lead.tags to be different after tags is added but got equals`)
                    const found_tagLead1 = requestAfter.lead.tags.includes('tagLead1');
                    assert.strictEqual(found_tagLead1, true, `Expect request.lead.tags to to have "found_tagLead1" tag obj, but no one is found into array`);
                    const found_tagLeadVar = (requestAfter.lead.tags.includes('tagLeadVar1') && requestAfter.lead.tags.includes('tagLeadVar2'));
                    assert.strictEqual(found_tagLeadVar, true, `Expect request.lead.tags to to have "tagLeadVar1" && "tagLeadVar2" tag obj, but no one is found into array`);
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
        })
    })

    it('Add tag to conversation and push to list (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonTextIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'conversation_and_push'
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
                    message.sender_fullname === "Add tags Chatbot"
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
                    assert.equal(msg.text, 'Add tag', `Expect msg.text to be 'Add tag' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button5 = msg.attributes.attachment.buttons[4]
                    assert.strictEqual(button5.value, message_text, 'Expect button4 to have "conversation_and_push" as text')
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
                            buttonTextIsPressed = true

                        }
                    );
                      
                    // resolve()                 
                } else if( buttonTextIsPressed &&
                    message &&  message.sender_fullname === "Add tags Chatbot"
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
                    assert.equal(msg.text, 'tag_ok', `Expect msg.text to be 'tag_ok' but got: ${msg.text} `)

                    
                    let requestAfter = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                        console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                        reject(err)
                        assert.ok(false);
                    });
                    assert(requestAfter.lead.tags)
                    assert.notEqual(request.tags.length,requestAfter.tags.length, `Expect request.tags to be different after tags is added but got equals`)
                    const found_tagConvPush1 = requestAfter.tags.some(obj => obj.tag === 'tagConvPush1');
                    assert.strictEqual(found_tagConvPush1, true, `Expect request.tags to to have "tagConvPush1" tag obj, but no one is found into array`);
                    const found_tagConvPush2 = requestAfter.tags.some(obj => obj.tag === 'tagConvPush2');
                    assert.strictEqual(found_tagConvPush2, true, `Expect request.tags to to have "tagConvPush2" tag obj, but no one is found into array`);
                    
                    let tagsList = await tdClientTest.tag.getAllTag().catch((err) => { 
                        console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                        reject(err)
                        assert.ok(false);
                    });
                    assert(tagsList)
                    const tags = tagsList.map(obj => obj.tag);
                    const expectedTags = ['tagConvPush1', 'tagConvPush2'];
                    const allTagsExist = expectedTags.every(tag => tags.includes(tag));
                    assert.strictEqual(allTagsExist, true, 'Not all required tags are present in the array');

                    tagsArray = tagsList.filter(item => ['tagConvPush1', 'tagConvPush2'].includes(item.tag));
                    pushTagsToList = true
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

                request = await tdClientTest.request.getRequestById(recipient_id).catch((err) => { 
                    console.error("(it) REQUEST API -> An error occurred during getRequestById:", err);
                    reject(err)
                    assert.ok(false);
                });
                
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