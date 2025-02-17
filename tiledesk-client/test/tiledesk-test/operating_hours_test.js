var assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const { Chat21Client } = require('../../chat21client.js');
require('dotenv').config();
const axios = require('axios');
const { TiledeskClient } = require('../../index.js');

const Auth = require('../tiledesk_apis/TdAuthApi.js');
const TiledeskClientTest = require('../tiledesk_apis/index.js');
const Chat21Auth = require('../tiledesk_apis/Chat21Auth.js');
const { json } = require('body-parser');


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
let project = {}
let slot_id;
let hours = {}

describe('CHATBOT: Operating hours action (~1s)', async () => {
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

            /** CREATE GENERAL OPERATING HOURS  */
            hours = {
                "1": [
                  { "start": "09:00", "end": "13:00" },
                  { "start": "14:00", "end": "18:00" }
                ],
                "2": [
                  { "start": "09:00", "end": "13:00" },
                  { "start": "14:00", "end": "18:00" }
                ],
                "3": [
                  { "start": "09:00", "end": "13:00" },
                  { "start": "14:00", "end": "18:00" }
                ],
                "4": [
                  { "start": "09:00", "end": "13:00" },
                  { "start": "14:00", "end": "18:00" }
                ],
                "5": [
                  { "start": "09:00", "end": "13:00" },
                  { "start": "14:00", "end": "18:00" }
                ],
                "tzname": "Europe/Rome"
            }
            let updatedProject_GlobalOP = { 
                activeOperatingHours : true, 
                operatingHours: JSON.stringify(hours)
            }
            project = await tdClientTest.project.updateProject(updatedProject_GlobalOP).catch((err) => { 
                console.error("(before) PROJECY updateProject -> An error occurred during updateProject:", err);
                reject(err)
                assert.ok(false);
            });
            assert(project)
            assert(project.activeOperatingHours)
            assert(project.operatingHours)
            assert.equal(project.activeOperatingHours, true)
            let operatingHours = JSON.parse(project.operatingHours)
            const keys_general = Object.keys(operatingHours);
            const requiredKeys = ["1", "2", "3", "4", "5"];
            requiredKeys.forEach((key) => {
                assert(keys_general.includes(key), `Hours obj does not contains key: ${key}`);
                assert(operatingHours[key])
                assert.equal(operatingHours[key].length, 2)
                operatingHours[key].forEach((el)=> {
                    assert(el.start)
                    assert(el.end)
                })
            });

            /** CREATE NEW TIME SLOT */
            let uuid = uuidv4();
            slot_id = uuid.substring(uuid.lastIndexOf('-') + 1)
            let updatedProject = { timeSlots : {} }  
            updatedProject.timeSlots[slot_id] = {
                name: 'custom_slot1',
                active: true,
                hours: JSON.stringify(hours)
            }

            project = await tdClientTest.project.updateProject(updatedProject).catch((err) => { 
                console.error("(before) PROJECY updateProject -> An error occurred during updateProject:", err);
                reject(err)
                assert.ok(false);
            });
            assert(project)
            assert(project.timeSlots)
            assert(project.timeSlots.hasOwnProperty(slot_id))
            assert(project.timeSlots[slot_id].name)
            assert(project.timeSlots[slot_id].active)
            assert(project.timeSlots[slot_id].hours)
            assert.equal(project.timeSlots[slot_id].name, "custom_slot1")
            assert.equal(project.timeSlots[slot_id].active, true)
            let saved_hours = JSON.parse(project.timeSlots[slot_id].hours)
            const keys = Object.keys(saved_hours);
            requiredKeys.forEach((key) => {
                assert(keys.includes(key), `Hours obj does not contains key: ${key}`);
                assert(saved_hours[key])
                assert.equal(saved_hours[key].length, 2)
                saved_hours[key].forEach((el)=> {
                    assert(el.start)
                    assert(el.end)
                })
            });

            let bot = require('./chatbots/operating_hours_bot.json');
           
            //replace botId for chatbot to be replaced into replace-bot-v3 action
            bot.intents.find(el => el.intent_display_name === 'slot_op').actions[0].slotId=slot_id
            
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
            })
            const result = await tdClientTest.chatbot.deleteChatbot(BOT_ID).catch((err) => { 
                assert.ok(false);
            });
            assert(result)

            //remove global op
            project = await tdClientTest.project.updateProject({ activeOperatingHours: false, operatingHours: null }).catch((err) => { 
                console.error("(before) PROJECT updateProject -> An error occurred during updateProject:", err);
                reject(err)
                assert.ok(false);
            });
            assert(project)
            assert.equal(project.activeOperatingHours, false)
            
            //remove slotID
            delete project.timeSlots[slot_id]
            project = await tdClientTest.project.updateProject(project.timeSlots).catch((err) => { 
                console.error("(before) PROJECT updateProject -> An error occurred during updateProject:", err);
                reject(err)
                assert.ok(false);
            });
            assert(project)
            
            done();
        });
    });

    it('Operating hours - General (open) (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let isActuallyInSlotTime = isCurrentTimeInRange(hours);
            let buttonGeneralIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'general'
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
                    message.sender_fullname === "Operating Hours Chatbot"
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
                    assert.equal(msg.text, 'Operating hours test', `Expect msg.text to be 'Operating hours test' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[0]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "general" as text')
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
                            buttonGeneralIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonGeneralIsPressed &&
                    isActuallyInSlotTime &&
                    message &&  message.sender_fullname === "Operating Hours Chatbot"
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
                    assert.equal(msg.text, 'open', `Expect msg.text to be 'open' but got: ${msg.text} `)

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

    it('Operating hours - Slot (open) (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let isActuallyInTime = isCurrentTimeInRange(hours);
            let buttonSlotIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'slot'
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
                    message.sender_fullname === "Operating Hours Chatbot"
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
                    assert.equal(msg.text, 'Operating hours test', `Expect msg.text to be 'Operating hours test' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[1]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "slot" as text')
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
                            buttonSlotIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonSlotIsPressed &&
                    isActuallyInTime &&
                    message &&  message.sender_fullname === "Operating Hours Chatbot"
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
                    assert.equal(msg.text, 'open', `Expect msg.text to be 'open' but got: ${msg.text} `)

                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id + '_0';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Operating hours - General (close) (~1s)', () => {
        return new Promise(async (resolve, reject)=> {
            let buttonGeneralIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            //REMOVE OP FOR CURRENT DAY
            hours = {
                "1": [
                { "start": "09:00", "end": "13:00" },
                { "start": "14:00", "end": "18:00" }
                ],
                "2": [
                { "start": "09:00", "end": "13:00" },
                { "start": "14:00", "end": "18:00" }
                ],
                "3": [
                { "start": "09:00", "end": "13:00" },
                { "start": "14:00", "end": "18:00" }
                ],
                "4": [
                { "start": "09:00", "end": "13:00" },
                { "start": "14:00", "end": "18:00" }
                ],
                "5": [
                { "start": "09:00", "end": "13:00" },
                { "start": "14:00", "end": "18:00" }
                ],
                "tzname": "Europe/Rome"
            }
            delete hours[new Date().getDay()]
            let updatedProject_GlobalOP = { 
                activeOperatingHours : true, 
                operatingHours: JSON.stringify(hours)
            }
            project = await tdClientTest.project.updateProject(updatedProject_GlobalOP).catch((err) => { 
                console.error("(before) PROJECY updateProject -> An error occurred during updateProject:", err);
                reject(err)
                assert.ok(false);
            });
            assert(project)
            assert(project.activeOperatingHours)
            assert(project.operatingHours)
            let updated_generalOP = JSON.parse(project.operatingHours)
            assert(!updated_generalOP.hasOwnProperty(new Date().getDay()))

            let isActuallyInTime = isCurrentTimeInRange(hours);

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'general'
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
                    message.sender_fullname === "Operating Hours Chatbot"
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
                    assert.equal(msg.text, 'Operating hours test', `Expect msg.text to be 'Operating hours test' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[0]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "general" as text')
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
                            buttonGeneralIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonGeneralIsPressed &&
                    !isActuallyInTime &&
                    message &&  message.sender_fullname === "Operating Hours Chatbot"
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
                    assert.equal(msg.text, 'close', `Expect msg.text to be 'close' but got: ${msg.text} `)

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

    it('Operating hours - Slot (close) (~1s)', () => {
        return new Promise(async (resolve, reject)=> {
            let buttonSlotIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            //REMOVE OP FOR CURRENT DAY
            hours = {
                "1": [
                { "start": "09:00", "end": "13:00" },
                { "start": "14:00", "end": "18:00" }
                ],
                "2": [
                { "start": "09:00", "end": "13:00" },
                { "start": "14:00", "end": "18:00" }
                ],
                "3": [
                { "start": "09:00", "end": "13:00" },
                { "start": "14:00", "end": "18:00" }
                ],
                "4": [
                { "start": "09:00", "end": "13:00" },
                { "start": "14:00", "end": "18:00" }
                ],
                "5": [
                { "start": "09:00", "end": "13:00" },
                { "start": "14:00", "end": "18:00" }
                ],
                "tzname": "Europe/Rome"
            }
            delete hours[new Date().getDay()]
            let updatedProject = { timeSlots : {} }  
            updatedProject.timeSlots[slot_id] = {
                name: 'custom_slot1',
                active: true,
                hours: JSON.stringify(hours)
            }

            project = await tdClientTest.project.updateProject(updatedProject).catch((err) => { 
                console.error("(before) PROJECY updateProject -> An error occurred during updateProject:", err);
                reject(err)
                assert.ok(false);
            });
            assert(project)
            assert(project.timeSlots)
            assert(project.timeSlots.hasOwnProperty(slot_id))
            let updated_slotOP = JSON.parse(project.timeSlots[slot_id].hours)
            assert(!updated_slotOP.hasOwnProperty(new Date().getDay()))

            let isActuallyInTime = isCurrentTimeInRange(hours);

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'slot'
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
                    message.sender_fullname === "Operating Hours Chatbot"
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
                    assert.equal(msg.text, 'Operating hours test', `Expect msg.text to be 'Operating hours test' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[1]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "slot" as text')
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
                            buttonSlotIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonSlotIsPressed &&
                    !isActuallyInTime &&
                    message &&  message.sender_fullname === "Operating Hours Chatbot"
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
                    assert.equal(msg.text, 'close', `Expect msg.text to be 'close' but got: ${msg.text} `)

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

function isCurrentTimeInRange(hours) {
    const now = new Date();
    const day = now.getDay(); // Ottiene il giorno della settimana (0 = Domenica, 1 = Lunedì, ...)
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Converti in minuti
  
    // Se non ci sono slot per oggi, ritorna false
    if (!hours[day]) return false;
  
    // Controlla se l'ora attuale è in uno degli intervalli
    return hours[day].some(slot => {
      const [startHour, startMin] = slot.start.split(":").map(Number);
      const [endHour, endMin] = slot.end.split(":").map(Number);
  
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
  
      return currentTime >= startTime && currentTime <= endTime;
    });
}