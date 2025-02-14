var assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const { Chat21Client } = require('../../chat21client.js');
require('dotenv').config();
const axios = require('axios');
const { TiledeskClient } = require('../../index.js');

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

describe('CHATBOT: Replace bot', async () => {
  
    before(() => {
        return new Promise(async (resolve, reject) => {
            let userdata;
            try {
                userdata = await createAnonymousUser(TILEDESK_PROJECT_ID);
                // console.log("Anonymous login ok:", userdata);
            }
            catch(error) {
                console.error("An error occurred during anonym auth:", error);
                process.exit(0);
            }
            user1.userid = userdata.userid;
            user1.token = userdata.token;
            user1.tiledesk_token = userdata.tiledesk_token;
            
            // console.log("Message delay check.");
            if (LOG_STATUS) {
                console.log("MQTT endpoint:", config.MQTT_ENDPOINT);
                console.log("API endpoint:", config.CHAT_API_ENDPOINT);
                console.log("Tiledesk Project Id:", config.TILEDESK_PROJECT_ID);
                console.log("Connecting...");    
            }
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
                    const bot1 = require('./chatbots/replace_bot.json');
                    const bot2 = require('./chatbots/replaced_bot_1.json');
                    // console.log("bot:", bot);
                    try {
                        const bot1_data = await importChatbot(bot1, TILEDESK_PROJECT_ID, USER_ADMIN_TOKEN);
                        const bot2_data = await importChatbot(bot2, TILEDESK_PROJECT_ID, USER_ADMIN_TOKEN);
                        // UNUSED: bot2_data
                        // console.log("chatbot_id:", data._id);
                        BOT_ID = bot1_data._id;
                        BOT_ID_2 = bot2_data._id;
                        // process.exit(0);
                        chatClient1.connect(user1.userid, user1.token, () => {
                            if (LOG_STATUS) {
                                console.log("chatClient1 connected and subscribed.");
                            }
                            group_id = "support-group-" + TILEDESK_PROJECT_ID + "-" + uuidv4().replace(/-+/g, "");
                            resolve();
                        });
                    }
                    catch(error) {
                        console.error("Error importing chatbot:", err);
                        reject(err);
                    }
                }
                else {
                    assert.ok(false);
                }
            });
        });
    });

    after(function (done) {
        chatClient1.close(() => {
            const tdclient = new TiledeskClient(
                {
                    APIKEY: process.env.APIKEY,
                    APIURL: API_ENDPOINT,
                    projectId: TILEDESK_PROJECT_ID,
                    token: USER_ADMIN_TOKEN,
                    log: LOG_STATUS
                })
            tdclient.deleteBot(BOT_ID, (err, result) => {
                assert(!err);
                assert(result);
                tdclient.deleteBot(BOT_ID_2, (err, result) => {
                    assert(!err);
                    assert(result);
                    done();
                });
            });
        });
    });

    it('get replace bot 1 reply  (~2s)', (done) => {
        const message_text = uuidv4().replace(/-+/g, "");
        let time_sent = Date.now();
        let handler = chatClient1.onMessageAdded((message, topic) => {
            if (LOG_STATUS) {
                console.log("> Incoming message [sender:" + message.sender_fullname + "]: ", message);
            }
            if (
                message &&
                message.sender_fullname === "Replaced bot 1" &&
                message.text === "I'm replace bot 1"
            ) {
                if (LOG_STATUS) {
                    console.log("> Incoming message from 'Replaced bot 1' is ok.");
                }
                done();
                // chatClient1.sendMessage(
                //     message_text,
                //     'text',
                //     recipient_id,
                //     "Test support group",
                //     user1.fullname,
                //     {projectId: config.TILEDESK_PROJECT_ID},
                //     null, // no metadata
                //     'group',
                //     (err, msg) => {
                //         if (err) {
                //             console.error("Error send:", err);
                //         }
                //         if (LOG_STATUS) {
                //             console.log("Message Sent ok:", msg);
                //         }
                //     }
                // );
            }
            // else if (
            //     message &&
            //     message.text ===  message_text &&
            //     message.sender_fullname === "Echo bot"
            // ) {
            //     if (LOG_STATUS) {
            //         console.log("> Got echo.");
            //     }
            //     done();
            // }
            // else {
            //     // console.log("Message not computed:", message.text);
            // }
        });
        if (LOG_STATUS) {
            console.log("Triggering Conversation...");
        }
        let recipient_id = group_id;
        triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, (err) => {
            if (err) {
                console.error("An error occurred while triggering echo bot conversation:", err);
            }
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