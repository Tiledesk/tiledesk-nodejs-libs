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
let DEP_ID = null
let DEP_ID_2 = null;
let GROUP_ID = null;

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

let user_agent = {};
let agent_project_user = {};

let group_id;
let chatbot;

describe('CHATBOT: Online agents action', async () => {
    before(function () {
        this.timeout(5000)
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
            
            /** SIGNUP AGENT */
            const result_agent = await auth.signUpEmailPassword('agent@tiledesk.com', 'agentTEST@').catch((err) => { 
                console.error("(before) ADMIN Auth -> An error occurred during emailPassword auth:", err);
                reject(err)
                assert.ok(false);
            });
            assert(result_agent.success == true);
            assert(result_agent.user)
            assert(result_agent.user._id !== null);
            assert(result_agent.user.email !== null);
            user_agent = result_agent.user
            

            /** SIGNIN AGENT */
            let result_signIn = await auth.authEmailPassword('agent@tiledesk.com', 'agentTEST@').catch((err) => { 
                console.error("(before) SIGNIN Auth -> An error occurred during emailPassword auth:", err);
                reject(err)
                assert.ok(false);
            });
            assert(result_signIn.success == true);
            assert(result_signIn.token != null, "Expect result_signIn.token exist");
            assert(result_signIn.user, "Expect result_signIn.user exist")
            assert(result_signIn.user._id !== null, "Expect result_signIn.user._id exist");
            assert(result_signIn.user.email !== null, "Expect result_signIn.user.email exist");
            user_agent['token'] = result_signIn.token;

            /** ADD AGENT TO PROJECT AND SETS AS AVAILABLE*/
            /** skip if 3rd parameter of addUserToProject( .., .., true) is set to true */
            const response_addToProject = await tdClientTest.user.addUserToProject(user_agent.email, 'admin', true).catch((err) => {
                console.error(err); 
                reject(err);
                assert.ok(false);
            });
            assert(response_addToProject, "Expect response_addToProject exist")
            assert(response_addToProject._id, "Expect response_addToProject._id exist")
            assert.equal(response_addToProject.id_user, user_agent._id, `Expect user_agent._id to be ${user_agent._id} but got: ${response_addToProject.id_user}`)
            agent_project_user = response_addToProject;
                        
            /** CREATE GROUP  */
            const group = await tdClientTest.group.add('group available agents').catch((err) => {
                console.error(err); 
                reject(err);
            });
            assert(group)
            assert(group._id)
            assert(group.name)
            assert.equal(group.name, 'group available agents')
            GROUP_ID = group._id


            /** ADD MEMBERS TO GROUP */
            const groupMembers = await tdClientTest.group.addMembers(group._id, [user_agent._id]).catch((err) => {
                console.error(err); 
                reject(err);
            });
            assert(groupMembers)
            assert(groupMembers._id)
            assert(groupMembers.name)
            assert.equal(groupMembers.name, 'group available agents')
            assert(groupMembers.members)
            assert.equal(groupMembers.members.length, 1)
            assert.equal(groupMembers.members[0], user_agent._id)

            /** ADD DEPARTMENT AND CONNECT TO BOT AND GROUP */
            const dep_test2 = await tdClientTest.department.createDepartment('dep test2', null, groupMembers._id).catch((err) => {
                console.error(err); 
                reject(err);
            });
            assert(dep_test2)
            assert(dep_test2.name)
            assert.equal(dep_test2.hasBot, false)
            DEP_ID_2 = dep_test2.id
            
            let bot = require('./chatbots/online_agents_bot.json');
            /** UPDATE ACTION */
            let intent = bot.intents.find(intent => intent.intent_display_name === 'selected dep test')
            intent.actions.find(action => action._tdActionType === 'ifonlineagentsv2').selectedDepartmentId = DEP_ID_2
            intent.actions.find(action => action._tdActionType === 'ifonlineagentsv2').selectedOption = 'selectedDep'
            
            
            const data = await tdClientTest.chatbot.importChatbot(bot).catch((err) => { 
                console.error(err); 
                reject(err);
            })
            BOT_ID = data._id;
            
            
            /** CREATE DEPARTMENT AND CONNECT TO CHATBOT ( for current dep option test) */
            const dep_test1 = await tdClientTest.department.createDepartment('dep test1', BOT_ID, null).catch((err) => {
                console.error(err); 
                reject(err);
            });
            assert(dep_test1)
            assert(dep_test1.name)
            assert(dep_test1.hasBot)
            assert(dep_test1.id_bot)
            assert.equal(dep_test1.id_bot, BOT_ID)
            DEP_ID = dep_test1.id


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
            assert(result.success === true);
            const result_remove_user_from_project = await tdClientTest.user.removeUserToProject(agent_project_user._id).catch((err) => { 
                assert.ok(false);
            });
            assert(result_remove_user_from_project);
            const result_remove_user = await tdClientTest.user.removeUser(user_agent['token']).catch((err) => { 
                assert.ok(false);
            });
            assert(result_remove_user.success === true)
            const result2 = await tdClientTest.department.deleteDepartment(DEP_ID).catch((err) => { 
                assert.ok(false);
            });
            assert(result2._id === DEP_ID);
            const result3 = await tdClientTest.department.deleteDepartment(DEP_ID_2).catch((err) => { 
                assert.ok(false);
            });
            assert(result3._id === DEP_ID_2);
            const result4 = await tdClientTest.group.delete(GROUP_ID).catch((err) => { 
                assert.ok(false);
            });
            assert(result4);
            assert(result4.trashed === true)

            done();
        });
    });


    it('Online agent - Project wide option (~1s)', () => {
        return new Promise(async (resolve, reject)=> {
            let buttonProjectIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'project'
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
                    message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'online agents tests', `Expect msg.text to be 'online agents tests' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[0]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "project" as text')
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
                            buttonProjectIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonProjectIsPressed &&
                    message &&  message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'agent online from: project', `Expect msg.text to be 'open' but got: ${msg.text} `)

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
            triggerConversation(recipient_id, BOT_ID, null, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Online agent - Current department option (~1s)', () => {
        return new Promise(async (resolve, reject)=> {
            let buttonDepIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'current dep'
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
                    message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'online agents tests', `Expect msg.text to be 'online agents tests' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[1]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "current dep" as text')
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
                            buttonDepIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonDepIsPressed &&
                    message &&  message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'agent online from: current dep', `Expect msg.text to be 'open' but got: ${msg.text} `)

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
            triggerConversation(recipient_id, BOT_ID, DEP_ID, user1.tiledesk_token ,async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Online agent - Selected department option (~1s)', () => {
        return new Promise(async (resolve, reject)=> {
            let buttonDepIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'selected dep'
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
                    message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'online agents tests', `Expect msg.text to be 'online agents tests' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[2]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "selected dep" as text')
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
                            buttonDepIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonDepIsPressed &&
                    message &&  message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'agent online from: selected dep', `Expect msg.text to be 'selected dep' but got: ${msg.text} `)

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
            triggerConversation(recipient_id, BOT_ID, DEP_ID_2, user1.tiledesk_token ,async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Online agent - Project wide ignore Oper. hours option (~1s)', () => {
        return new Promise(async (resolve, reject)=> {
            let buttonProjectIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'project ignore op'
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
                    message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'online agents tests', `Expect msg.text to be 'online agents tests' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[3]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "project ignore op" as text')
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
                            buttonProjectIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonProjectIsPressed &&
                    message &&  message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'agent online from: project ignore op', `Expect msg.text to be 'project ignore op' but got: ${msg.text} `)

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
            triggerConversation(recipient_id, BOT_ID, null, user1.tiledesk_token ,async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Online agent - Current department with no Online/else connector (~1s)', () => {
        return new Promise(async (resolve, reject)=> {
            let buttonProjectIsPressed = false;
            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'current dep no connectors'
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
                    message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'online agents tests', `Expect msg.text to be 'online agents tests' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[4]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "project" as text')
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
                            buttonProjectIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonProjectIsPressed &&
                    message &&  message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'reply after online agents', `Expect msg.text to be 'open' but got: ${msg.text} `)

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
            triggerConversation(recipient_id, BOT_ID, null, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Offline agent - Project wide option (~1s)', () => {
        return new Promise(async (resolve, reject)=> {
            let buttonProjectIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            let availabilityRes = await tdClientTest.user.setAvailability(agent_project_user._id, false, "").catch((err) => {
                console.error(err); 
                reject(err);
            });
            assert(availabilityRes)
            assert.equal(availabilityRes.user_available, false)
            assert(availabilityRes.id)
            assert(availabilityRes.id_user)
            assert(availabilityRes.id_project)
            assert(availabilityRes.role)
            assert.equal(availabilityRes.id, agent_project_user._id)
            assert.equal(availabilityRes.id_user,agent_project_user.id_user)
            assert.equal(availabilityRes.id_project, TILEDESK_PROJECT_ID)
            assert.equal(availabilityRes.role, 'admin')
            

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'project'
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
                    message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'online agents tests', `Expect msg.text to be 'online agents tests' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[0]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "project" as text')
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
                            buttonProjectIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonProjectIsPressed &&
                    message &&  message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'agent offline from: project', `Expect msg.text to be 'open' but got: ${msg.text} `)

                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id + '_5';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, null, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Offline agent - Current department option (~1s)', () => {
        return new Promise(async (resolve, reject)=> {
            let buttonProjectIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            let availabilityRes = await tdClientTest.user.setAvailability(agent_project_user._id, false, "").catch((err) => {
                console.error(err); 
                reject(err);
            });
            assert(availabilityRes)
            assert.equal(availabilityRes.user_available, false)
            assert(availabilityRes.id)
            assert(availabilityRes.id_user)
            assert(availabilityRes.id_project)
            assert(availabilityRes.role)
            assert.equal(availabilityRes.id, agent_project_user._id)
            assert.equal(availabilityRes.id_user,agent_project_user.id_user)
            assert.equal(availabilityRes.id_project, TILEDESK_PROJECT_ID)
            assert.equal(availabilityRes.role, 'admin')
            

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'current dep'
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
                    message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'online agents tests', `Expect msg.text to be 'online agents tests' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[1]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "current dep" as text')
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
                            buttonDepIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonDepIsPressed &&
                    message &&  message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'agent offline from: current dep', `Expect msg.text to be 'open' but got: ${msg.text} `)

                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id + '_6';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, null, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Offline agent - Selected department option (~1s)', () => {
        return new Promise(async (resolve, reject)=> {
            let buttonProjectIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            let availabilityRes = await tdClientTest.user.setAvailability(agent_project_user._id, false, "").catch((err) => {
                console.error(err); 
                reject(err);
            });
            assert(availabilityRes)
            assert.equal(availabilityRes.user_available, false)
            assert(availabilityRes.id)
            assert(availabilityRes.id_user)
            assert(availabilityRes.id_project)
            assert(availabilityRes.role)
            assert.equal(availabilityRes.id, agent_project_user._id)
            assert.equal(availabilityRes.id_user,agent_project_user.id_user)
            assert.equal(availabilityRes.id_project, TILEDESK_PROJECT_ID)
            assert.equal(availabilityRes.role, 'admin')
            

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'selected dep'
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
                    message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'online agents tests', `Expect msg.text to be 'online agents tests' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[2]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "selected dep" as text')
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
                            buttonDepIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonDepIsPressed &&
                    message &&  message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'agent offline from: selected dep', `Expect msg.text to be 'selected dep' but got: ${msg.text} `)

                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id + '_7';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, null, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Offline agent - Project wide ignore Oper. hours option (~1s)', () => {
        return new Promise(async (resolve, reject)=> {
            let buttonProjectIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });

            let availabilityRes = await tdClientTest.user.setAvailability(agent_project_user._id, false, "").catch((err) => {
                console.error(err); 
                reject(err);
            });
            assert(availabilityRes)
            assert.equal(availabilityRes.user_available, false)
            assert(availabilityRes.id)
            assert(availabilityRes.id_user)
            assert(availabilityRes.id_project)
            assert(availabilityRes.role)
            assert.equal(availabilityRes.id, agent_project_user._id)
            assert.equal(availabilityRes.id_user,agent_project_user.id_user)
            assert.equal(availabilityRes.id_project, TILEDESK_PROJECT_ID)
            assert.equal(availabilityRes.role, 'admin')
            

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'project ignore op'
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
                    message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'online agents tests', `Expect msg.text to be 'online agents tests' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[3]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "project ignore op" as text')
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
                            buttonProjectIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonProjectIsPressed &&
                    message &&  message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'agent offline from: project ignore op', `Expect msg.text to be 'project ignore op' but got: ${msg.text} `)

                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id + '_8';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, null, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

    it('Offline agent - Current department with no Online/else connector (~1s)', () => {
        return new Promise(async (resolve, reject)=> {
            let buttonProjectIsPressed = false;
            const tdClientTest = new TiledeskClientTest({
                APIURL: API_ENDPOINT,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            });
            
            let availabilityRes = await tdClientTest.user.setAvailability(agent_project_user._id, false, "").catch((err) => {
                console.error(err); 
                reject(err);
            });
            assert(availabilityRes)
            assert.equal(availabilityRes.user_available, false)
            assert(availabilityRes.id)
            assert(availabilityRes.id_user)
            assert(availabilityRes.id_project)
            assert(availabilityRes.role)
            assert.equal(availabilityRes.id, agent_project_user._id)
            assert.equal(availabilityRes.id_user,agent_project_user.id_user)
            assert.equal(availabilityRes.id_project, TILEDESK_PROJECT_ID)
            assert.equal(availabilityRes.role, 'admin')

            chatClient1.onMessageAdded(async (message, topic) => {
                const message_text = 'current dep no connectors'
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
                    message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'online agents tests', `Expect msg.text to be 'online agents tests' but got: ${msg.text} `)

                    //check buttons 
                    assert(msg.attributes, "Expect msg.attribues exist")
                    assert(msg.attributes.attachment, "Expect msg.attributes.attachment exist")
                    assert(msg.attributes.attachment.buttons, "Expect msg.attributes.attachment.buttons exist")
                    assert(msg.attributes.attachment.buttons.length > 0, "Expect msg.attributes.attachment.buttons.length > 0")
                    
                    let button1 = msg.attributes.attachment.buttons[4]
                    assert.strictEqual(button1.value, message_text, 'Expect button1 to have "project" as text')
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
                            buttonProjectIsPressed = true
                        }
                    );
                      
                    // resolve()                 
                } else if( buttonProjectIsPressed &&
                    message &&  message.sender_fullname === "Online agents Chatbot"
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
                    assert.equal(msg.text, 'reply after online agents', `Expect msg.text to be 'open' but got: ${msg.text} `)

                    resolve();
                    
                }
                else {
                    // console.log("Message not computed:", message.text);
                }

            });
            if (LOG_STATUS) {
                console.log("Sending test message...");
            }
            let recipient_id = group_id + '_9';
            // let recipient_fullname = group_name;
            triggerConversation(recipient_id, BOT_ID, null, user1.tiledesk_token, async (err) => {
                if (err) {
                    console.error("An error occurred while triggering echo bot conversation:", err);
                }
            });
        })
    })

});


async function triggerConversation(request_id, chatbot_id, dep_id, token, callback) {
    const tdclient = new TiledeskClient(
    {
        APIKEY: "__APIKEY__",
        APIURL: API_ENDPOINT,
        projectId: TILEDESK_PROJECT_ID,
        token: token,
        log: LOG_STATUS
    });
    tdclient.getWidgetSettings((err, result) => {
        let attributes = {}
        if (LOG_STATUS) {
            console.log("Project departments:", result.departments);
        }
        if (result && result.departments) {
            let default_dep = null;
            result.departments.forEach(d => {
                if (d.default === true) {
                    default_dep = d;
                    attributes = {
                        departmentId: default_dep.id,
                        departmentName: "Default"
                    }
                }
            });
            if (default_dep === null) {
                console.error("Error. Default department not found");
                callback("Error. Default department not found");
            }
            if(dep_id){
                default_dep = result.departments.find(dep => dep.id === dep_id) 
                attributes = {
                    departmentId: default_dep.id,
                    departmentName: default_dep.name
                }
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
                    "attributes": attributes
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