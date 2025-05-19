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
//const LOG_STATUS = true;

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
}
else {
    throw new Error(".env.AUTOMATION_TEST_MQTT_ENDPOINT is mandatory");
}

let API_ENDPOINT = "";
if (process.env && process.env.AUTOMATION_TEST_API_ENDPOINT) {
	API_ENDPOINT = process.env.AUTOMATION_TEST_API_ENDPOINT
}
else {
    throw new Error(".env.AUTOMATION_TEST_API_ENDPOINT is mandatory");
}

let CHAT_API_ENDPOINT = "";
if (process.env && process.env.AUTOMATION_TEST_CHAT_API_ENDPOINT) {
	CHAT_API_ENDPOINT = process.env.AUTOMATION_TEST_CHAT_API_ENDPOINT
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

let flow;
let webhook_id;


describe('Webhook Test', async () => {

    before(function()  {
        this.timeout(10000)
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
                TOKEN: USER_ADMIN_TOKEN,
                GPT_KEY: process.env.GPT_KEY
            })
            
            
            flow = require('./chatbots/webhook_flow.json');
            const data = await tdClientTest.chatbot.importChatbot(flow).catch((err) => { 
                console.error(err); 
                reject(err);
            })
            BOT_ID = data._id;

            let new_webhook = {
                async: false,
                block_id: "25d7f89c-40e8-4bba-82cd-6c7d7d6755c8",
                chatbot_id: BOT_ID,
                copilot: false
            }
            const webhook = await tdClientTest.webhook.createWebhook(new_webhook).catch((err) => {
                console.error(err); 
                reject(err);
            })

            assert(webhook.async === false);
            assert(webhook.chatbot_id === BOT_ID);
            assert(webhook.webhook_id !== null);
            assert(webhook.enabled === true);

            webhook_id = webhook.webhook_id;

            chatClient1.connect(user1.userid, user1.token, () => {
                if (LOG_STATUS) {
                    console.log("chatClient1 connected and subscribed.");
                }
                resolve();
            });

        });
    })

    after(function (done) {
        this.timeout(4000)
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

    it('Preload and run dev webhook (~600ms)', () => {

        return new Promise( async (resolve, reject) => {
            
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            const start_result = await tdClientTest.webhook.preloadDevWebhook(webhook_id).catch((err) => {
                console.error(err); 
                reject(err);
            })
            assert(start_result.success === true);
            assert(start_result.message === 'Webhook preloaded successfully');
            assert(start_result.request_id !== null);
            assert(start_result.request_id.startsWith('automation-request-'));
            assert(start_result.request_id.split('-').length === 5)

            const webhook_result = await tdClientTest.webhook.runDevWebhook(webhook_id, {}).catch((err) => {
                console.error(err);
                reject(err)
            })
            assert(webhook_result.success === true);
            assert(webhook_result.message === "Your webhook is online!");
            assert(webhook_result.value === 1);

            const stop_result = await tdClientTest.webhook.stopDevWebhook(webhook_id).catch((err) => {
                console.error(err); 
                reject(err);
            })
            assert(stop_result.success === true);
            assert(stop_result.message === 'Development webhook stopped');

            resolve();

        })

           
    }).timeout(10000);

    it('Run production webhook (~200ms)', () => {

        return new Promise( async (resolve, reject) => {
            
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            const webhook_result = await tdClientTest.webhook.runWebhook(webhook_id).catch((err) => {
                console.error("Error running dev webhook: ", err); 
                reject(err)
            })
            assert(webhook_result.success === true);
            assert(webhook_result.message === "Your webhook is online!");
            assert(webhook_result.value === 1);

            resolve();

        })

           
    }).timeout(10000);

    it('Versioning check (~3s)', () => {

        return new Promise( async (resolve, reject) => {
            
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            // Preload dev webhook
            const start_result = await tdClientTest.webhook.preloadDevWebhook(webhook_id).catch((err) => {
                console.error(err); 
                reject(err);
            })
            assert(start_result.success === true);
            assert(start_result.message === 'Webhook preloaded successfully');
            assert(start_result.request_id !== null);
            assert(start_result.request_id.startsWith('automation-request-'));
            assert(start_result.request_id.split('-').length === 5)

            // Run dev webhook - value should be 1
            const dev_webhook_result = await tdClientTest.webhook.runDevWebhook(webhook_id, {}).catch((err) => {
                console.error(err);
                reject(err)
            })
            assert(dev_webhook_result.success === true);
            assert(dev_webhook_result.message === "Your webhook is online!");
            assert(dev_webhook_result.value === 1);

            // Run prodution webhook - value should be 1
            const webhook_result = await tdClientTest.webhook.runWebhook(webhook_id, {}).catch((err) => {
                console.error(err);
                reject(err)
            })
            assert(webhook_result.success === true);
            assert(webhook_result.message === "Your webhook is online!");
            assert(webhook_result.value === 1);

            // Publish the flow
            let publish_response = await tdClientTest.chatbot.publish(BOT_ID).catch((err) => {
                console.error(err);
                reject(err);
            })
            assert(publish_response.message === "Chatbot published successfully");
            assert(publish_response.bot_id !== null);

            const published_bot_id = publish_response.bot_id;

            // Update web response intent setting value to 2
            const intents = await tdClientTest.chatbot.getAllFaqs(BOT_ID).catch((err) => {
                console.error(err);
                reject(err);
            })

            let intent = intents.find(i => i.intent_display_name === 'response');
            intent.actions[0].payload = "{\n\t\"success\": true,\n\t\"message\": \"Your webhook is online!\",\n\t\"value\": 2\n}";
            await tdClientTest.chatbot.updateFaq(BOT_ID, intent).catch((err) => {
                console.error(err);
                reject(err)
            })

            // Run again dev webhook - value should be 2
            const dev_webhook_result2 = await tdClientTest.webhook.runDevWebhook(webhook_id, {}).catch((err) => {
                console.error(err);
                reject(err)
            })
            assert(dev_webhook_result2.success === true);
            assert(dev_webhook_result2.message === "Your webhook is online!");
            assert(dev_webhook_result2.value === 2);

            // Run again production webhook - value should still be 1
            const webhook_result2 = await tdClientTest.webhook.runWebhook(webhook_id, {}).catch((err) => {
                console.error(err);
                reject(err)
            })
            assert(webhook_result2.success === true);
            assert(webhook_result2.message === "Your webhook is online!");
            assert(webhook_result2.value === 1);
            
            // Publish again the flow
            const publish_response2 = await tdClientTest.chatbot.publish(BOT_ID).catch((err) => {
                console.error(err);
                reject(err);
            })
            assert(publish_response2.message === "Chatbot published successfully");
            assert(publish_response2.bot_id !== null);

            // Run again production webhook - this time value should be 2
            const webhook_result3 = await tdClientTest.webhook.runWebhook(webhook_id, {}).catch((err) => {
                console.error(err);
                reject(err)
            })
            assert(webhook_result3.success === true);
            assert(webhook_result3.message === "Your webhook is online!");
            assert(webhook_result3.value === 2);

            // Restore previous version
            await tdClientTest.chatbot.restore(BOT_ID, published_bot_id).catch((err) => {
                console.error(err);
                reject(err)
            })

            // Run again production webhook - value should be 1
            const webhook_result4 = await tdClientTest.webhook.runWebhook(webhook_id, {}).catch((err) => {
                console.error(err);
                reject(err)
            })
            assert(webhook_result4.success === true);
            assert(webhook_result4.message === "Your webhook is online!");
            assert(webhook_result4.value === 1);

            // Run again dev webhook - value should be 2
            const dev_webhook_result3 = await tdClientTest.webhook.runDevWebhook(webhook_id, {}).catch((err) => {
                console.error(err);
                reject(err)
            })
            assert(dev_webhook_result3.success === true);
            assert(dev_webhook_result3.message === "Your webhook is online!");
            assert(dev_webhook_result3.value === 2);

            // Stop dev webhook
            const stop_result = await tdClientTest.webhook.stopDevWebhook(webhook_id).catch((err) => {
                console.error(err); 
                reject(err);
            })
            assert(stop_result.success === true);
            assert(stop_result.message === 'Development webhook stopped');

            resolve();

        })

           
    }).timeout(10000);

})


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