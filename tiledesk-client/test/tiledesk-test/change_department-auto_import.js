var assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const { Chat21Client } = require('../../chat21client.js');
require('dotenv').config();
const axios = require('axios');
const { TiledeskClient } = require('../../index.js');

const LOG_STATUS = (process.env.LOG_STATUS && process.env.LOG_STATUS) === 'true' ? true : false;


const Auth = require('../tiledesk_apis/TdAuthApi.js');
const TiledeskClientTest = require('../tiledesk_apis/index.js');
const Chat21Auth = require('../tiledesk_apis/Chat21Auth.js')

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

// let BOT_ID = "";
// if (process.env && process.env.BASIC_CAPTURE_REPLY_ID) {
// 	BOT_ID = process.env.BASIC_CAPTURE_REPLY_ID
// }
// else {
//     throw new Error(".env.BASIC_CAPTURE_REPLY_ID is mandatory");
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
let BOT_ID2 = null;
let USER_ADMIN_TOKEN = null;
let DEP_ID = null

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

describe('CHATBOT: Change department', async () => {
  
    before(() => {
        return new Promise(async (resolve, reject) => {
            if (LOG_STATUS) {
                console.log("MQTT endpoint:", config.MQTT_ENDPOINT);
                console.log("API endpoint:", config.CHAT_API_ENDPOINT);
                console.log("Tiledesk Project Id:", config.TILEDESK_PROJECT_ID);
                console.log("Connecting......");    
            }

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
            

            TiledeskClient.authEmailPassword(
                process.env.APIKEY,
                EMAIL,
                PASSWORD,
                {
                APIURL: API_ENDPOINT,
                log: LOG_STATUS
                },
            async (err, result) => {
                if (!err && result) {
                    assert(result.success == true);
                    assert(result.token != null);
                    assert(result.user)
                    assert(result.user._id !== null);
                    assert(result.user.email !== null);
                    USER_ADMIN_TOKEN = result.token;
                    // console.log("USER_ADMIN_TOKEN:", USER_ADMIN_TOKEN);
                    // USER_ID = result.user._id;
                    const bot = require('./chatbots/change_department_bot.js').bot;
                    const bot_dep2 = require('./chatbots/change_department_bot2.js').bot;

                    const tdClientTest = new TiledeskClientTest({
                        APIURL: API_ENDPOINT,
                        PROJECT_ID: TILEDESK_PROJECT_ID,
                        TOKEN: USER_ADMIN_TOKEN
                    })

                    try {

                        const data = await tdClientTest.chatbot.importChatbot(bot).catch((err) => { 
                            console.error(err);  
                            reject(err);
                        })

                        const data2 = await tdClientTest.chatbot.importChatbot(bot_dep2).catch((err) => {
                            console.error(err); 
                            reject(err);
                        })
                        const dep_test1 = await tdClientTest.department.createDepartment('dep test1', data2._id).catch((err) => {
                            console.error(err); 
                            reject(err);
                        });

                        if( !dep_test1 || !data || !data2){
                            reject({ err: 'DEP, BOT1 or BOT2 data is undefined'})
                        }

                        DEP_ID = dep_test1.id
                        BOT_ID = data._id;
                        BOT_ID2 = data2._id

                        // process.exit(0);
                        chatClient1.connect(user1.userid, user1.token, () => {
                            if (LOG_STATUS) {
                                console.log("chatClient1 connected and subscribed.");
                            }
                            group_id = "support-group-" + TILEDESK_PROJECT_ID + "-" + uuidv4().replace(/-+/g, "");
                            group_name = "Echo bot test group => " + group_id;
                            resolve();
                        });
                    }
                    catch(error) {
                        console.error("(before): Error importing DATA for test:", err);
                        reject(err);
                    }
                }
                else {
                    assert.ok(false);
                }
            });
        });
    });

    after(function  (done) {
        chatClient1.close(async () => {
            const tdClientTest = new TiledeskClientTest({
                    APIURL: API_ENDPOINT,
                    PROJECT_ID: TILEDESK_PROJECT_ID,
                    TOKEN: USER_ADMIN_TOKEN
            });
            const result = await tdClientTest.chatbot.deleteChatbot(BOT_ID).catch((err) => { 
                assert.ok(false);
            });
            const result2 = await tdClientTest.chatbot.deleteChatbot(BOT_ID2).catch((err) => { 
                assert.ok(false);
            });
            const result3 = await tdClientTest.department.deleteDepartment(DEP_ID).catch((err) => { 
                assert.ok(false);
            });
            assert(result.success === true);
            assert(result2.success === true);
            assert(result3._id === DEP_ID);
            done();
        });
    });

    it('change department from DEFAULT to "dep test1" (~2s)', (done) => {
        let handler = chatClient1.onMessageAdded((message, topic) => {            
            if (LOG_STATUS) {
                console.log("> Incoming message [sender:" + message.sender_fullname + "]: ", message);
            }
            if ( message && message.sender_fullname === "Echo bot" ) {
                if (LOG_STATUS) {
                    console.log("> Got:" , message.text);
                }
                assert(message.text ==="Hi, I'm an echo bot. You write and I echo your text");
                assert(message.sender === BOT_ID2);
                done();
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
    }).timeout(10000);
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
            console.log("Got Anonymous Tiledesk Token:", JSON.stringify(response.data.token));
            if (LOG_STATUS) {
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