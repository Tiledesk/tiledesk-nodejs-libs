var assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const { Chat21Client } = require('../chat21client.js');
require('dotenv').config();
const axios = require('axios');
const { TiledeskClient } = require('..');

const LOG_STATUS = (process.env.LOG_STATUS && process.env.LOG_STATUS) === 'true' ? true : false;

let BOT_ID = "";
if (process.env && process.env.DELETE_ATTRIBUTE_WITH_FORM_ID) {
	BOT_ID = process.env.DELETE_ATTRIBUTE_WITH_FORM_ID
}
else {
    throw new Error(".env.BASIC_CAPTURE_REPLY_ID is mandatory");
}

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

describe('Delete attribute with form test', async () => {
    // this.timeout(20000);
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
            chatClient1.connect(user1.userid, user1.token, () => {
                if (LOG_STATUS) {
                    console.log("chatClient1 connected and subscribed.");
                }
                group_id = "support-group-" + TILEDESK_PROJECT_ID + "-" + uuidv4().replace(/-+/g, "");
                group_name = "Echo bot test group => " + group_id;
                resolve();
            });
        });
    });

    after(function (done) {
        chatClient1.close(() => {
            done();
        })
    });

    it('ask data and restart with deleted attribute', (done) => {
        let start_sent = false;
        let handler = chatClient1.onMessageAdded((message, topic) => {
            
            if (LOG_STATUS) {
                console.log("> Incoming message [sender:" + message.sender_fullname + "]: ", message.text);
            }


            if (
                message &&
                message.text === "What is your name?" &&
                // message.attributes.intentName ===  "welcome2" && // unsupported by forms?
                message.sender_fullname === "delete attribute with form"
            ) {
                if (LOG_STATUS) {console.log("> Bot replied:", message.text);}
                setTimeout( () => {
                    if (LOG_STATUS) {console.log("- Replying 'Andrea'");}
                    chatClient1.sendMessage(
                        "Andrea",
                        'text',
                        recipient_id,
                        "me",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID},
                        null, // no metadata
                        'group',
                        (err, msg) => {
                            if (err) {
                                console.error("Error send:", err);
                            }
                            if (LOG_STATUS) {
                                console.log("Message Sent:", msg);
                            }
                        }
                    );
                }, 2000);
            }


            else if (
                message &&
                message.text ===  "Hi Andrea\n\nJust one last question\n\nYour email" &&
                start_sent === false &&
                message.sender_fullname === "delete attribute with form"
            ) {
                if (LOG_STATUS) {console.log("> Bot replied:", message.text);}
                setTimeout( () => {
                    if (LOG_STATUS) {console.log("- Replying 'andrea@email.com'");}
                    chatClient1.sendMessage(
                        "andrea@email.com",
                        'text',
                        recipient_id,
                        "me",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID},
                        null, // no metadata
                        'group',
                        (err, msg) => {
                            if (err) {
                                console.error("Error send:", err);
                            }
                            if (LOG_STATUS) {
                                console.log("Message Sent ok:", msg);
                            }
                        }
                    );
                }, 2000);
            }


            else if (
                message &&
                message.text ===  "I got your data:\nuserFullname: Andrea\nuserEmail: andrea@email.com" &&
                message.sender_fullname === "delete attribute with form"
            ) {
                if (LOG_STATUS) {console.log("> Bot replied:", message.text);}
                setTimeout( () => {
                    if (LOG_STATUS) {console.log("- Replying '/start' (restarting the conversation to check the userEmail attribute correct deletion");}
                    start_sent = true;
                    chatClient1.sendMessage(
                        "/start",
                        'text',
                        recipient_id,
                        "me",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID},
                        null, // no metadata
                        'group',
                        (err, msg) => {
                            if (err) {
                                console.error("Error send:", err);
                            }
                            if (LOG_STATUS) {
                                console.log("Message Sent ok:", msg);
                            }
                        }
                    );
                }, 2000);
            }


            else if (
                message &&
                message.text ===  "Hi Andrea\n\nJust one last question\n\nYour email" &&
                start_sent === true &&
                message.sender_fullname === "delete attribute with form"
            ) {
                if (LOG_STATUS) {console.log("> Bot replied:", message.text);}
                setTimeout( () => {
                    if (LOG_STATUS) {console.log("- Replying 'luis@email.com'");}
                    chatClient1.sendMessage(
                        "luis@email.com",
                        'text',
                        recipient_id,
                        "me",
                        user1.fullname,
                        {projectId: config.TILEDESK_PROJECT_ID},
                        null, // no metadata
                        'group',
                        (err, msg) => {
                            if (err) {
                                console.error("Error send:", err);
                            }
                            if (LOG_STATUS) {
                                console.log("Message Sent ok:", msg);
                            }
                        }
                    );
                }, 2000);
            }
            

            else if (
                message &&
                message.text ===  "I got your data:\nuserFullname: Andrea\nuserEmail: luis@email.com" &&
                start_sent === true &&
                message.sender_fullname === "delete attribute with form"
            ) {
                if (LOG_STATUS) {console.log("> Bot replied:", message.text);}
                if (LOG_STATUS) {console.log("End.");}
                
                done();
            }
            else {
                if (LOG_STATUS) {
                    console.log("Message not computed:", message.text);
                }
            }
        });
        let recipient_id = group_id;
        // let recipient_fullname = group_name;
        triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, (err) => {
            if (err) {
                console.error("An error occurred while triggering echo bot conversation:", err);
            }
        });
    }).timeout(15000);
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
                    // "fullname": "Andrea", 
                    // "email": "andrea@email.com", 
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
