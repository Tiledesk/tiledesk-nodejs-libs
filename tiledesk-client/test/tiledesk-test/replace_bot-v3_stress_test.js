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

let requests = new Map();
let interval = 2000;
let max_iterations = 10;

describe('STRESS TEST: Replace bot v3', async () => {
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
            const auth_start = new Date().getTime();
            let userdata = await auth.createAnonymousUser(TILEDESK_PROJECT_ID).catch((err) => { 
                console.error("(before) Auth -> An error occurred during anonym auth:", err);
                process.exit(0)
            });
            let chat21data = await chat21Auth.signInWithCustomToken(userdata.token).catch((err) => { 
                console.error("(before) Chat21Auth -> An error occurred during anonym auth:", err);
                process.exit(0)
            });
            const auth_end = new Date().getTime();
            const auth_delay = auth_end - auth_start;
            console.log("Step1: User Authenticated in:", auth_delay);
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

            const bot = require('./chatbots/replace_bot_v3_stress_bots.json')["bot"];
            const replacedBot = require('./chatbots/replace_bot_v3_stress_bots.json')["replacedBot"]
           
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
            
            //replace botId for chatbot to be replaced into replace-bot-v3 action
            bot.intents.find(el => el.intent_display_name === 'replace').actions[1].botId= BOT_ID_2
            
            
            const data = await tdClientTest.chatbot.importChatbot(bot).catch((err) => { 
                console.error(err); 
                reject(err);
            })
            BOT_ID = data._id;

            const MQTT_start = new Date().getTime();
            chatClient1.connect(user1.userid, user1.token, () => {
                if (LOG_STATUS) {
                    console.log("chatClient1 connected and subscribed.");
                }
                const MQTT_end = new Date().getTime();
                const MQTT_delay = MQTT_end - MQTT_start;
                console.log("Step2: MQTT connected in:", MQTT_delay);
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

    it('Replace Bot by Id: calc average delay for 10 iteration (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let buttonTextIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'REPLACE'
                // if(message.recipient !== recipient_id){
                //     reject();
                //     return;
                // }
                
                if (LOG_STATUS) {
                    console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
                }
                if (
                    message &&
                    message.attributes.intentName ===  "welcome" &&
                    message.sender_fullname === "MAIN BOT"
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
                    assert.equal(msg.text, 'My name is Main', `Expect msg.text to be 'My name is Main' but got: ${msg.text} `)
                    
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
                        message.recipient,
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

                    requests.get(message.recipient).sent = true;
                      
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
                    message &&  message.sender_fullname === "REPLACED"
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
                    assert(msg.text.startsWith("My name is Replaced"), `Expect msg.text to be "My name is Replaced" but got: ${msg.text}`)
                    

                    
                    const parts = message.text.split(":");
                    const last = parts[parts.length - 1];
                    // console.log("last:", last);
                    const delay = parseInt(last);
                    // console.log("delay:", delay);
                    requests.get(message.recipient).delay = delay;
                    let sum = 0;
                    requests.forEach( (value, key, map) => {
                        if (delay != 0) {
                            sum += value.delay
                        }
                    });
                    let keys_number = requests.size;
                    let avg = sum/keys_number
                    // getLast20ElementsByStartAt(requests).forEach(e => {
                    //     console.log("> ", e[0],e[1]);
                    // });
                    console.log(" >> Average delay:", Math.round(avg), "ms [", keys_number,"]");
                    if(requests.size === max_iterations){
                        resolve();
                    }
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            go(0);

        });
    }).timeout(600000);
});

async function go(count) {
    let recipient_id = "support-group-" + TILEDESK_PROJECT_ID + "-" + uuidv4().replace(/-+/g, "");
    requests.set(
        recipient_id,
        {
            sent: false,
            // received_at: null,
            delay: 0
        }
    );
   
    triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
        if (err) {
            console.error("An error occurred while triggering echo bot conversation:", err);
        }
    });

    // console.log("Replacing...");
    await new Promise(r => setTimeout(r, interval));
    count++;
    if(count < max_iterations){
        go(count);
    }
}

function getLast20ElementsByStartAt(map) {
    // Converti la mappa in un array di oggetti chiave-valore
    const entries = Array.from(map.entries());

    // Ordina gli elementi per la proprietà "start_at"
    entries.sort((a, b) => a[1].start_at - b[1].start_at);

    // Ottieni gli ultimi 20 elementi
    const last20 = entries.slice(-20);

    // Restituisci gli ultimi 20 elementi, se necessario
    return last20;
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