var assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const { Chat21Client } = require('../../chat21client.js');
require('dotenv').config();
const axios = require('axios');
const { TiledeskClient } = require('../../index.js');

const fs = require("fs");
const path = require("path");

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
let integration_id;
let uploadRes;

describe('CHATBOT: Audio message is sent from client', async () => {
    let handlerId;
    before(function() {
        this.timeout(4000)
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

            const bot = require('./chatbots/audio_bot.json');
           
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


            const filePath = path.join(__dirname, "assets", "hello_audio.mp3");
            fileContent = fs.createReadStream(filePath);
            const file = {
                file: fileContent,
                name: "hello_audio.mp3",
                type: "audio/mp3"
            }
            const upload = await tdClientTest.upload.upload(file).catch((err) => { 
                console.error(err); 
                reject(err);
            })
            assert(upload)
            assert(upload.message)
            assert(upload.message === 'File uploded successfully')
            assert(upload.filename)
            assert(upload.filename.includes('hello_audio.mp3'))
            assert(upload.downloadURL)
            assert(upload.src)
            const regex = new RegExp( /^uploads\/users\/.*\/files\/.*\/hello_audio\.mp3$/ )
            assert(regex.test(upload.filename))
            uploadRes = upload

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

            const integration_result = await tdClientTest.integration.deleteIntegration(integration_id).catch((err) => { 
                console.error(err); 
                reject(err);
            })
            assert(integration_result)
            assert(integration_result.success===true)
            done();
        });
    });

    afterEach((done) => {
        if (handlerId) {
            chatClient1.removeOnMessageAddedHandler(handlerId);
            handlerId = null;
        }
        chatClient1.close(() => {
            chatClient1.connect(user1.userid, user1.token, () => {
            done();
            });
        });
    });

    it('Send Audio url (project has not a valid GPT key) (~1s)', () => {
        return new Promise((resolve, reject)=> { 
            const messageHandler = async (message, topic) => { 
                const message_text = ''     
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
                    message.sender_fullname === "Audio Chatbot"
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
                    assert.equal(msg.text, 'send audio file to translate in text', `Expect msg.text to be 'send audio file to translate in text' but got: ${msg.text} `)
                    
                    chatClient1.sendMessage(
                        '',
                        'file',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID},
                        {   src: uploadRes.src,
                            downloadURL: uploadRes.downloadURL,
                            type:"audio/mpeg", 
                            name: "audio-file",  
                            size:"37168",
                            uid: "qwe32dsa"
                        },
                        'group',
                        (err, msg) => {
                            if (err) {
                                console.error("Error send:", err);
                            }
                            if (LOG_STATUS) {
                                console.log("Message Sent ok:", msg);
                            }
                            assert.equal(msg.text, message_text, `Message sent from user expected to be "${message_text}"`)
                            assert(msg.type)
                            assert.equal(msg.type, 'file')
                            assert(msg.metadata)
                            assert(msg.metadata.src)
                            assert(msg.metadata.downloadURL)
                            assert(msg.metadata.type)
                            assert(msg.metadata.name)
                            assert(msg.metadata.size)
                            assert(msg.metadata.uid)
                            assert.equal(msg.metadata.type, "audio/mpeg")
                            assert.equal(msg.metadata.name, "audio-file")
                            //remove handler from list
                            resolve();                 
                        }
                    );
                      
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
            let recipient_id = group_id;
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    }).timeout(8000)

    it('Send Audio url (project has a valid GPT key) (~4s)', () => {
        return new Promise(async (resolve, reject)=> {
            let hasSentAudioRecord = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN,
                GPT_KEY: process.env.GPT_KEY
            });

            const validate = await tdClientTest.ai.validateOpenAiKey().catch((err) => { 
                console.error(err); 
                reject(err);
            })
            assert(validate)
            assert(validate.object)
            assert(validate.data)

            const integration = await tdClientTest.integration.addIntegration("openai", { apikey: tdClientTest.ai.getKEY(), organization: 'test-lib' }).catch((err) => { 
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
            assert.equal(integration.value.apikey, tdClientTest.ai.getKEY())
            assert.equal(integration.value.organization, 'test-lib')
            integration_id = integration._id

            const messageHandler = async (message, topic) => { 
                const message_text = ''
                if(message.recipient !== recipient_id){
                    return;
                }
                if (LOG_STATUS) {
                    console.log(">(1) Incoming message [sender:" + message.sender_fullname + "]: ", message);
                } 
                if (
                    message &&
                    message.attributes.intentName ===  "welcome" &&
                    message.sender_fullname === "Audio Chatbot"
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
                    assert.equal(msg.text, 'send audio file to translate in text', `Expect msg.text to be 'send audio file to translate in text' but got: ${msg.text} `)
                    chatClient1.sendMessage(
                        '',
                        'file',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID },
                        {   src: uploadRes.src,
                            downloadURL: uploadRes.downloadURL,
                            type:"audio/mpeg", 
                            name: "audio-file",  
                            size:"37168",
                            uid: "qwe32dsa"
                        },
                        'group',
                        (err, msg) => {
                            if (err) {
                                console.error("Error send:", err);
                            }
                            if (LOG_STATUS) {
                                console.log("Message Sent ok:", msg);
                            }
                            assert.equal(msg.text, message_text, `Message sent from user expected to be "${message_text}"`)
                            assert(msg.type)
                            assert.equal(msg.type, 'file')
                            assert(msg.metadata)
                            assert(msg.metadata.src)
                            assert(msg.metadata.downloadURL)
                            assert(msg.metadata.type)
                            assert(msg.metadata.name)
                            assert(msg.metadata.size)
                            assert(msg.metadata.uid)
                            assert.equal(msg.metadata.type, "audio/mpeg")
                            assert.equal(msg.metadata.name, "audio-file")
                            hasSentAudioRecord = true
                            // resolve();
                        }
                    );
        
                }
                else if(hasSentAudioRecord &&
                    message &&  message.sender_fullname === "Audio Chatbot"
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
                    assert.equal(msg.text, 'Hey, how are you?', `Expect msg.text to be 'messaggio di test' but got: ${msg.text} `)
                    resolve();  
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            }
            
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
    }).timeout(8000)

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
                // console.log('ressssss', result)
                callback(null);
            });
        }
        else {
            callback(err);
        }
    });
    
}