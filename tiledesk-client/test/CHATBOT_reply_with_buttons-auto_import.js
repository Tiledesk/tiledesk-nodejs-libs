var assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const { Chat21Client } = require('../chat21client.js');
require('dotenv').config();
const axios = require('axios');
const { TiledeskClient } = require('../index.js');

const Auth = require('./tiledesk_apis/TdAuthApi.js');
const TiledeskCLientTest = require('./tiledesk_apis/index.js');
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

describe('CHATBOT: Reply with buttons', async () => {
    before(() => {
        return new Promise(async (resolve, reject) => {
            if (LOG_STATUS) {
                console.log("MQTT endpoint:", config.MQTT_ENDPOINT);
                console.log("API endpoint:", config.CHAT_API_ENDPOINT);
                console.log("Tiledesk Project Id:", config.TILEDESK_PROJECT_ID);
                console.log("Connecting...");    
            }

            if (LOG_STATUS) {
                console.log("MQTT endpoint:", config.MQTT_ENDPOINT);
                console.log("API endpoint:", config.CHAT_API_ENDPOINT);
                console.log("Tiledesk Project Id:", config.TILEDESK_PROJECT_ID);
                console.log("Connecting......");    
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

            const bot = require('./chatbots/CHATBOT_reply_with_buttons.js').bot;
            
            const tdClientTest = new TiledeskCLientTest({
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
            const tdClientTest = new TiledeskCLientTest({
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

    it('advanced reply: use case 1 --> btn1 is pressed (~1s)', () => {
        return new Promise((resolve, reject)=> {
            let button1IsPressed = false;
            chatClient1.onMessageAdded((message, topic) => {
                const message_text = 'usecase1'
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
                    message.sender_fullname === "Reply with buttons Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Incoming message from 'welcome' intent ok.");
                    }

                    assert(message.attributes)
                    assert(message.attributes.commands)
                    assert(message.attributes.commands.length >= 2)
                    let commands = message.attributes.commands
                    let button1 = commands.filter( comm => comm.type === 'message')[0].message.attributes.attachment.buttons[0]
                    assert(button1.action)
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "usecase1" as text')
                    
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
                        }
                    );
                }
                else if (
                    message &&
                    message.attributes.intentName ===  'usecase_1'  &&
                    message.sender_fullname === "Reply with buttons Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Got echo.");
                    }
                    assert(message.text.startsWith(message_text))
                    assert.equal(message.sender, BOT_ID)
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.attributes.intentName, 'usecase_1', `Reply from chatbot: Intent expected to be "usecase_1", but got "${message.attributes.intentName}"`)
                    //send btn 1 
                    let btn1_text = 'btn1'
                    let commands = message.attributes.commands
                    let button1 = commands.filter( comm => comm.type === 'message')[0].message.attributes.attachment.buttons[0]
                    assert(button1.action)
                    assert.equal(button1.value, btn1_text, 'Expect button1 to have "btn1" as text')
                    
                    chatClient1.sendMessage(
                        btn1_text,
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
                            button1IsPressed = true
                            assert.equal(msg.text, btn1_text, `Message sent from user expected to be "${btn1_text}"`)
                        }
                    );
                
                } else if( button1IsPressed && 
                    message.sender_fullname === "Reply with buttons Chatbot"
                ){
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.sender, BOT_ID)
                    assert.equal(message.attributes.intentName, 'btn1_intent', `Expect intent "btn1_intent" after btn1 is pressed, but got intent: ${message.attributes.intentName}` )
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
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('advanced reply: use case 1 --> button alias (~1s)', () => {
        return new Promise((resolve, reject) => {
            let button1IsPressed = false;
            let button1Intent = null;
            chatClient1.onMessageAdded((message, topic) => {
                const message_text = 'usecase1'
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
                    message.sender_fullname === "Reply with buttons Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Incoming message from 'welcome' intent ok.");
                    }

                    assert(message.attributes)
                    assert(message.attributes.commands)
                    assert(message.attributes.commands.length >= 2)
                    let commands = message.attributes.commands
                    let button1 = commands.filter( comm => comm.type === 'message')[0].message.attributes.attachment.buttons[0]
                    assert(button1.action)
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "usecase1" as text')
                    
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
                        }
                    );
                }
                else if (
                    message &&
                    message.attributes.intentName ===  'usecase_1'  &&
                    message.sender_fullname === "Reply with buttons Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Got echo.");
                    }
                    assert(message.text.startsWith(message_text))
                    assert.equal(message.sender, BOT_ID)
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.attributes.intentName, 'usecase_1', `Reply from chatbot: Intent expected to be "usecase_1", but got "${message.attributes.intentName}"`)
                    //send btn 1 
                    let btn1_text_alias = 'button_1'
                    let commands = message.attributes.commands
                    let button1 = commands.filter( comm => comm.type === 'message')[0].message.attributes.attachment.buttons[0]
                    assert(button1.action)
                    
                    chatClient1.sendMessage(
                        btn1_text_alias,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID },
                        null, // no metadata
                        'group',
                        (err, msg) => {
                            if (err) {
                                console.error("Error send:", err);
                            }
                            if (LOG_STATUS) {
                                console.log("Message Sent ok:", msg);
                            }
                            button1IsPressed = true
                            assert.equal(msg.text, btn1_text_alias, `Message sent from user expected to be "${btn1_text_alias}"`)
                            assert.ok(msg.text === 'button_1' || msg.text === 'button1', `Expect message from user is included in alias: ${button1.alias}, but got: ${msg.text} `)
                        }
                    );
                
                } else if( button1IsPressed && 
                    message.sender_fullname === "Reply with buttons Chatbot"
                ){
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.sender, BOT_ID)
                    assert.equal(message.attributes.intentName, 'btn1_intent', `Expect intent "btn1_intent" after btn1 is pressed, but got intent: ${message.attributes.intentName}` )
                    resolve();
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
            
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id+'-1';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('advanced reply: use case 2 --> no_match (~1s)', () => {
        return new Promise((resolve, reject)=>{
            let noMatchCase = false;
            chatClient1.onMessageAdded((message, topic) => {
                const message_text = 'usecase2'
                if(message.recipient !== recipient_id){
                    reject();
                    return;
                }
                if (LOG_STATUS) {
                    console.log(">(2) Incoming message [sender:" + message.sender_fullname + "]: ", message);
                }
                if (
                    message &&
                    message.attributes.intentName ===  "welcome" &&
                    message.sender_fullname === "Reply with buttons Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Incoming message from 'welcome' intent ok.");
                    }

                    assert(message.attributes)
                    assert(message.attributes.commands)
                    assert(message.attributes.commands.length >= 2)
                    let commands = message.attributes.commands
                    let button2 = commands.filter( comm => comm.type === 'message')[0].message.attributes.attachment.buttons[1]
                    assert(button2.action)
                    assert.strictEqual(button2.value, message_text, 'Expect button2 to have "usecase2" as text')
                    
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
                        }
                    );
                } else if (
                    message &&
                    message.attributes.intentName ===  'usecase_2'  &&
                    message.sender_fullname === "Reply with buttons Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Got echo.");
                    }
                    assert(message.text.startsWith(message_text))
                    assert.equal(message.sender, BOT_ID)
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.attributes.intentName, 'usecase_2', `Reply from chatbot: Intent expected to be "usecase_1", but got "${message.attributes.intentName}"`)
                    
                    
                    let btn_text = 'botton_not_match'
                    let commands = message.attributes.commands
                    let button1 = commands.filter( comm => comm.type === 'message')[0].message.attributes.attachment.buttons[0]
                    assert(button1.action)
                    
                    chatClient1.sendMessage(
                        btn_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID },
                        null, // no metadata
                        'group',
                        (err, msg) => {
                            if (err) {
                                console.error("Error send:", err);
                            }
                            if (LOG_STATUS) {
                                console.log("Message Sent ok:", msg);
                            }
                            noMatchCase = true
                            assert.equal(msg.text, btn_text, `Message sent from user expected to be "${message_text}"`)
                        }
                    );
                

                } else if( noMatchCase &&
                    message.sender_fullname === "Reply with buttons Chatbot"
                ){
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.sender, BOT_ID)
                    assert.equal(message.attributes.intentName, 'no_match_intent', `Expect triggered intent after no_match is to be "no_match_intent" but got: ${message.attributes.intentName}`)
                    assert.notEqual(message.attributes.intentName, 'btn1_intent', `Expect triggered intent after no_match is not to be "btn1_intent" but got: ${message.attributes.intentName}`)
                    assert.equal(message.text, 'no_match', `Expect message text after no_match to be "no_match" but got: ${message.text}`)
                    resolve();
                } else  {
                    // console.log("Message not computed:", message.text);
                } 
            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id+'-2';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('advanced reply: use case 2 --> no_input (~12s)', () => {
        return new Promise((resolve, reject)=>{
            let noInputCase = false;
            chatClient1.onMessageAdded((message, topic) => {
                const message_text = 'usecase2'
                if(message.recipient !== recipient_id){
                    reject();
                    return;
                }
                if (LOG_STATUS) {
                    console.log(">(2) Incoming message [sender:" + message.sender_fullname + "]: ", message);
                }
                if (
                    message &&
                    message.attributes.intentName ===  "welcome" &&
                    message.sender_fullname === "Reply with buttons Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Incoming message from 'welcome' intent ok.");
                    }

                    assert(message.attributes)
                    assert(message.attributes.commands)
                    assert(message.attributes.commands.length >= 2)
                    let commands = message.attributes.commands
                    let button2 = commands.filter( comm => comm.type === 'message')[0].message.attributes.attachment.buttons[1]
                    assert(button2.action)
                    assert.strictEqual(button2.value, message_text, 'Expect button2 to have "usecase2" as text')
                    
                    
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
                        }
                    );
                } else if (
                    message &&
                    message.attributes.intentName ===  'usecase_2'  &&
                    message.sender_fullname === "Reply with buttons Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Got echo.");
                    }
                    assert(message.text.startsWith(message_text))
                    assert.equal(message.sender, BOT_ID)
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.attributes.intentName, 'usecase_2', `Reply from chatbot: Intent expected to be "usecase_1", but got "${message.attributes.intentName}"`)
                    
                    
                    setTimeout(() => {}, 11000);
                    noInputCase = true
                

                } else if( noInputCase &&
                    message.sender_fullname === "Reply with buttons Chatbot"
                ){
                    assert(message.attributes)
                    assert(message.attributes.intentName)
                    assert.equal(message.sender, BOT_ID)
                    assert.equal(message.attributes.intentName, 'no_input_intent', `Expect triggered intent after no_input is to be "no_input_intent" but got: ${message.attributes.intentName}`)
                    assert.notEqual(message.attributes.intentName, 'btn1_intent', `Expect triggered intent after no_input is not to be "btn1_intent" but got: ${message.attributes.intentName}`)
                    assert.notEqual(message.attributes.intentName, 'btn2_intent', `Expect triggered intent after no_input is not to be "btn2_intent" but got: ${message.attributes.intentName}`)
                    assert.equal(message.text, 'no_input', `Expect message text after no_input to be "no_input" but got: ${message.text}`)
                    resolve();
                } else  {
                    // console.log("Message not computed:", message.text);
                } 
            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id+'-3';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    }).timeout(12000)
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