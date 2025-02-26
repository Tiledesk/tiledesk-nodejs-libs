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

let example_content = {
    name: "Who is Joe",
    source:"Who is Joe",
    content: "Joe is a wonderfull tester",
    type: "text",
    namespace: null
}
let content_id = null;
let integration_id;
let elapsed;

describe('Knwoledge Base (Long Test)', async () => {

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
            
            /** ADD CONTENT TO KNOWLEDGE BASE */
            let namespaces = await tdClientTest.knowledgeBase.getAllNamespaces().catch((err) => {
                console.error("Error getting all namespaces ", err.response.status, err.response.statusText);
                console.error("Error detail ", JSON.stringify(err.response.data));
                reject(err);
            })

            assert(namespaces.length === 1);
            assert(namespaces[0]);
            assert(namespaces[0].default === true)
            example_content.namespace = namespaces[0].id;

            let indexing_time = Date.now();
            let response = await tdClientTest.knowledgeBase.addContentToNamespace(example_content).catch((err) => {
                console.error("Error getting all namespaces ", err.response.status, err.response.statusText);
                console.error("Error detail ", JSON.stringify(err.response.data));
                reject(err);
            })

            assert(response.value.type === 'text');
            assert(response.value.source === example_content.name);
            assert(response.value.namespace === example_content.namespace);
            assert(response.value.status === -1);

            let content = response.value;
            let payload = { 
                namespace: content.namespace, 
                id: content._id,
                namespace_list: []
            }
            content_id = payload.id;

            let i = 0;
            const waitForIndexing = new Promise(async (resolveIndexing, rejectIndexing) => {
                async function execute(i) {
                    if (i > 10) {
                        rejectIndexing("Indexing probably locked");
                    }
    
                    let status = await tdClientTest.knowledgeBase.checkContentStatus(payload).catch((err) => {
                        console.error("Error getting all namespaces ", err.response.status, err.response.statusText);
                        console.error("Error detail ", JSON.stringify(err.response.data));
                        rejectIndexing(err);
                    })
        
                    if (status.status_code === 3) {
                        indexing_time = Date.now() - indexing_time;
                        console.log("\tResource indexed in about " + indexing_time/1000 + " seconds");
                        resolveIndexing(true)
                    } else {
                        setTimeout( async () => {
                            await execute(i+1);
                        }, 1000)
                    }
    
                }
                execute(i);
            })
            
            let indexed = await waitForIndexing.catch((err) => {
                reject(err);
                return
            });

            if (!indexed) {
                return;
            }

            /** ADD GPT KEY AND OPENAI INTEGRATION */
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


            const bot = require('./chatbots/ask_knowledge_base_bot.json');
            const data = await tdClientTest.chatbot.importChatbot(bot).catch((err) => { 
                console.error(err); 
                reject(err);
            })
            BOT_ID = data._id;

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

            const deleteContent = await tdClientTest.knowledgeBase.deleteContent(content_id).catch((err) => {
                assert.ok(false);
            })
            assert(deleteContent._id === content_id)

            const integration_result = await tdClientTest.integration.deleteIntegration(integration_id).catch((err) => { 
                console.error(err); 
                reject(err);
            })
            assert(integration_result)
            assert(integration_result.success===true)
            done();
        });
    });

    it('(Gpt 4o) Check if the answer is contained in the Knowledge Base', () => {

        return new Promise( async (resolve, reject) => {

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = "Who is Joe?"
                const button_text = "gpt-4o"
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
                    message.sender_fullname === "Ask KB Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Incoming message from 'welcome' intent ok.");
                    }

                    elapsed = Date.now();

                    chatClient1.sendMessage(
                        message_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID },
                        null,
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
                    )
                } else if (
                    message && 
                    message.attributes.intentName ===  "defaultFallback" &&
                    message.sender_fullname === "Ask KB Chatbot"
                ) {

                    assert(message.text === "Choose model");
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert(msg.text, "Expect msg.text exist")
                    assert.equal(msg.text, 'Choose model', `Expect msg.text to be 'Choose model' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[0]
                    assert.strictEqual(button1.value, button_text, 'Expect button1 to have "gpt-4o" as text')
                    assert(button1.action)

                    chatClient1.sendMessage(
                        button_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID, action: button1.action },
                        null,
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
                    )
                } else if (
                    message &&
                    message.attributes.intentName === "kb_answer"
                ) {

                    elapsed = Date.now() - elapsed;
                    console.log("\tKB answered in " + elapsed/1000 + " seconds");

                } else if (
                    message &&
                    message.attributes.intentName === "answer"
                ) {

                    assert(message.text === "OK");
                    resolve()
                } else {
                    // console.log("message: ", message)
                }
            })

            let recipient_id = "support-group-" + TILEDESK_PROJECT_ID + "-" + uuidv4().replace(/-+/g, "");
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering bot conversation:", err);
                }
            })

        })
    }).timeout(10000);

    it('(Gpt 4o-mini) Check if the answer is contained in the Knowledge Base', () => {

        return new Promise( async (resolve, reject) => {

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = "Who is Joe?"
                const button_text = "gpt-4o-mini"
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
                    message.sender_fullname === "Ask KB Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Incoming message from 'welcome' intent ok.");
                    }

                    elapsed = Date.now();

                    chatClient1.sendMessage(
                        message_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID },
                        null,
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
                    )
                } else if (
                    message && 
                    message.attributes.intentName ===  "defaultFallback" &&
                    message.sender_fullname === "Ask KB Chatbot"
                ) {

                    assert(message.text === "Choose model");
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert(msg.text, "Expect msg.text exist")
                    assert.equal(msg.text, 'Choose model', `Expect msg.text to be 'Choose model' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[1]
                    assert.strictEqual(button1.value, button_text, 'Expect button1 to have "gpt-4o-mini" as text')
                    assert(button1.action)

                    chatClient1.sendMessage(
                        button_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID, action: button1.action },
                        null,
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
                    )
                } else if (
                    message &&
                    message.attributes.intentName === "kb_answer"
                ) {

                    elapsed = Date.now() - elapsed;
                    console.log("\tKB answered in " + elapsed/1000 + " seconds");

                } else if (
                    message &&
                    message.attributes.intentName === "answer"
                ) {
                    assert(message.text === "OK");
                    resolve()
                } else if (
                    message &&
                    message.attributes.intentName === "kb_error"
                ) {
                    
                    reject()
                }
            })

            let recipient_id = "support-group-" + TILEDESK_PROJECT_ID + "-" + uuidv4().replace(/-+/g, "");
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering bot conversation:", err);
                }
            })

        })
    }).timeout(10000);

    it('(Gpt 3.5-turbo) Check if the answer is contained in the Knowledge Base', () => {

        return new Promise( async (resolve, reject) => {

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = "Who is Joe?"
                const button_text = "gpt-3.5-turbo"
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
                    message.sender_fullname === "Ask KB Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Incoming message from 'welcome' intent ok.");
                    }

                    elapsed = Date.now();

                    chatClient1.sendMessage(
                        message_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID },
                        null,
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
                    )
                } else if (
                    message && 
                    message.attributes.intentName ===  "defaultFallback" &&
                    message.sender_fullname === "Ask KB Chatbot"
                ) {

                    assert(message.text === "Choose model");
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert(msg.text, "Expect msg.text exist")
                    assert.equal(msg.text, 'Choose model', `Expect msg.text to be 'Choose model' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[2]
                    assert.strictEqual(button1.value, button_text, 'Expect button1 to have "gpt-3.5-turbo" as text')
                    assert(button1.action)

                    chatClient1.sendMessage(
                        button_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID, action: button1.action },
                        null,
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
                    )
                } else if (
                    message &&
                    message.attributes.intentName === "kb_answer"
                ) {

                    elapsed = Date.now() - elapsed;
                    console.log("\tKB answered in " + elapsed/1000 + " seconds");

                } else if (
                    message &&
                    message.attributes.intentName === "answer"
                ) {
                    assert(message.text === "OK");
                    resolve()
                }  else if (
                    message &&
                    message.attributes.intentName === "kb_error"
                ) {
                    reject()
                }
            })

            let recipient_id = "support-group-" + TILEDESK_PROJECT_ID + "-" + uuidv4().replace(/-+/g, "");
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering bot conversation:", err);
                }
            })

        })
    }).timeout(10000);

    it('(Gpt 4o) Check if the answer is not contained in the Knowledge Base', () => {

        return new Promise( async (resolve, reject) => {

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = "When was Napoleon born?"
                const button_text = "gpt-4o"
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
                    message.sender_fullname === "Ask KB Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Incoming message from 'welcome' intent ok.");
                    }

                    elapsed = Date.now();

                    chatClient1.sendMessage(
                        message_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID },
                        null,
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
                    )
                } else if (
                    message && 
                    message.attributes.intentName ===  "defaultFallback" &&
                    message.sender_fullname === "Ask KB Chatbot"
                ) {

                    assert(message.text === "Choose model");
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert(msg.text, "Expect msg.text exist")
                    assert.equal(msg.text, 'Choose model', `Expect msg.text to be 'Choose model' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[0]
                    assert.strictEqual(button1.value, button_text, 'Expect button1 to have "gpt-4o" as text')
                    assert(button1.action)

                    chatClient1.sendMessage(
                        button_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID, action: button1.action },
                        null,
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
                    )
                } else if (
                    message &&
                    message.attributes.intentName === "answer_ko"
                ) {
                    
                    const error = new Error("The flow should not reach this block");
                    error.stack = null // Rimuove lo stack trace
                    reject(error);

                } else if (
                    message &&
                    message.attributes.intentName === "kb_error"
                ) {

                    //assert(message.text === "No answer");
                    elapsed = Date.now() - elapsed;
                    console.log("\tKB answered in " + elapsed/1000 + " seconds");

                    resolve()
                }

            })

            let recipient_id = "support-group-" + TILEDESK_PROJECT_ID + "-" + uuidv4().replace(/-+/g, "");
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering bot conversation:", err);
                }
            })

        })
    }).timeout(10000);

    it('(Gpt 4o-mini) Check if the answer is not contained in the Knowledge Base', () => {

        return new Promise( async (resolve, reject) => {

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = "When was Napoleon born?"
                const button_text = "gpt-4o-mini"
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
                    message.sender_fullname === "Ask KB Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Incoming message from 'welcome' intent ok.");
                    }

                    elapsed = Date.now();

                    chatClient1.sendMessage(
                        message_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID },
                        null,
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
                    )
                } else if (
                    message && 
                    message.attributes.intentName ===  "defaultFallback" &&
                    message.sender_fullname === "Ask KB Chatbot"
                ) {

                    assert(message.text === "Choose model");
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert(msg.text, "Expect msg.text exist")
                    assert.equal(msg.text, 'Choose model', `Expect msg.text to be 'Choose model' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[1]
                    assert.strictEqual(button1.value, button_text, 'Expect button1 to have "gpt-4o-mini" as text')
                    assert(button1.action)

                    chatClient1.sendMessage(
                        button_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID, action: button1.action },
                        null,
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
                    )
                } else if (
                    message &&
                    message.attributes.intentName === "answer_ko"
                ) {
                    
                    const error = new Error("The flow should not reach this block");
                    error.stack = null // Rimuove lo stack trace
                    reject(error);

                } else if (
                    message &&
                    message.attributes.intentName === "kb_error"
                ) {

                    //assert(message.text === "No answer");
                    elapsed = Date.now() - elapsed;
                    console.log("\tKB answered in " + elapsed/1000 + " seconds");

                    resolve()
                }

            })

            let recipient_id = "support-group-" + TILEDESK_PROJECT_ID + "-" + uuidv4().replace(/-+/g, "");
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering bot conversation:", err);
                }
            })

        })
    }).timeout(10000);

    it('(Gpt 3.5-turbo) Check if the answer is not contained in the Knowledge Base', () => {

        return new Promise( async (resolve, reject) => {

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = "When was Napoleon born?"
                const button_text = "gpt-3.5-turbo"
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
                    message.sender_fullname === "Ask KB Chatbot"
                ) {
                    if (LOG_STATUS) {
                        console.log("> Incoming message from 'welcome' intent ok.");
                    }

                    elapsed = Date.now();

                    chatClient1.sendMessage(
                        message_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID },
                        null,
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
                    )
                } else if (
                    message && 
                    message.attributes.intentName ===  "defaultFallback" &&
                    message.sender_fullname === "Ask KB Chatbot"
                ) {

                    assert(message.text === "Choose model");
                    assert(message.attributes, "Expect message.attributes exist")
                    assert(message.attributes.commands, "Expect message.attributes.commands")
                    assert(message.attributes.commands.length >= 2, "Expect message.attributes.commands.length > 2")
                    let commands = message.attributes.commands
                    let command = commands[1]
                    assert.equal(command.type, 'message')
                    assert(command.message, "Expect command.message exist")
                    let msg = command.message
                    assert(msg.text, "Expect msg.text exist")
                    assert.equal(msg.text, 'Choose model', `Expect msg.text to be 'Choose model' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[2]
                    assert.strictEqual(button1.value, button_text, 'Expect button1 to have "gpt-3.5-turbo" as text')
                    assert(button1.action)

                    chatClient1.sendMessage(
                        button_text,
                        'text',
                        recipient_id,
                        "Test support group",
                        user1.fullname,
                        { projectId: config.TILEDESK_PROJECT_ID, action: button1.action },
                        null,
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
                    )
                } else if (
                    message &&
                    message.attributes.intentName === "answer_ko"
                ) {
                    
                    const error = new Error("The flow should not reach this block");
                    error.stack = null // Rimuove lo stack trace
                    reject(error);

                } else if (
                    message &&
                    message.attributes.intentName === "kb_error"
                ) {

                    //assert(message.text === "No answer");
                    elapsed = Date.now() - elapsed;
                    console.log("\tKB answered in " + elapsed/1000 + " seconds");

                    resolve()
                }

            })

            let recipient_id = "support-group-" + TILEDESK_PROJECT_ID + "-" + uuidv4().replace(/-+/g, "");
            triggerConversation(recipient_id, BOT_ID, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering bot conversation:", err);
                }
            })

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