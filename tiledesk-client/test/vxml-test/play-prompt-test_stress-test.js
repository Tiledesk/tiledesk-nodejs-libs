var assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const { Chat21Client } = require('../../chat21client.js');
require('dotenv').config();
const axios = require('axios');
const { TiledeskClient } = require('../../index.js');

const Auth = require('../tiledesk_apis/TdAuthApi.js');
const TiledeskClientTest = require('../tiledesk_apis/index.js');
const Chat21Auth = require('../tiledesk_apis/Chat21Auth.js')

/** VXML */
const VoiceConnectorTest = require('./vxml_apis/index.js')
const Utils = require('./vxml_apis/utils.js')

const { XMLParser, XMLValidator } = require("fast-xml-parser");


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

let CONNECTOR_BASE_URL = "";
if (process.env && process.env.CONNECTOR_BASE_URL) {
	CONNECTOR_BASE_URL = process.env.CONNECTOR_BASE_URL
}
else {
    throw new Error(".env.CONNECTOR_BASE_URL is mandatory");
}

let BOT_ID = null;
let DEP_ID = null;
let USER_ADMIN_TOKEN = null;

let config = {
    MQTT_ENDPOINT: MQTT_ENDPOINT,
    CHAT_API_ENDPOINT: CHAT_API_ENDPOINT,
    APPID: 'tilechat',
    TILEDESK_PROJECT_ID: TILEDESK_PROJECT_ID
}


const xmlParser = new XMLParser({
    ignoreAttributes: false,  // Mantiene gli attributi XML
    attributeNamePrefix: "", // Prefisso per distinguere gli attributi
    parseAttributeValue: true, // Converte i valori in tipi appropriati
    textNodeName: "text"
});

let vxmlConnectorTest = null;

let lastIntentTimestamp = null;
let lastIntentName = null;
let callId = null;
let subscriptionId = null;

let requests = new Map();
let interval = 2000;
let max_iterations = 10;

describe('CHATBOT: Play a prompt (stress test)', async () => {
    before(() => {
        return new Promise(async (resolve, reject) => {
            if (LOG_STATUS) {
                console.log("MQTT endpoint:", config.MQTT_ENDPOINT);
                console.log("API endpoint:", config.CHAT_API_ENDPOINT);
                console.log("Tiledesk Project Id:", config.TILEDESK_PROJECT_ID);
                console.log("Connecting...");    
            }
            
            /**AUTH WITH CREDENTIALS TILEDESK */
            const auth = new Auth(API_ENDPOINT);
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

            const bot = require('./chatbots/VXML - Play prompt_stress-test.json');
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
            
            const department = await tdClientTest.department.createDepartment('dep test vxml - '+ BOT_ID, data._id).catch((err) => {
                console.error(err); 
                reject(err);
            });
            assert(department)
            assert(department.id)
            assert.equal(department.name, 'dep test vxml - '+ BOT_ID)
            assert.equal(department.hasBot, true)
            DEP_ID = department.id

            vxmlConnectorTest = new VoiceConnectorTest({
                CONNECTOR_BASE_URL: CONNECTOR_BASE_URL,
                PROJECT_ID: TILEDESK_PROJECT_ID,
                TOKEN: USER_ADMIN_TOKEN
            })

            const config1 = await vxmlConnectorTest.configConnector.configure().catch((err) => { 
                console.error(err); 
                reject(err);
            })
            const configHtml = await vxmlConnectorTest.configConnector.connect(DEP_ID).catch((err) => { 
                console.error(err); 
                reject(err);
            })
            assert(configHtml);
            const match = configHtml.match(/name="subscription_id"\s+value="([^"]+)"/);
            if (match) {
                subscriptionId = match[1]
            }
            
            resolve();
        });
    });

    after(async function () {
        //fire hangup event to close each conversation in the map
        requests.forEach( async (value, key, map) => {
            const catchHangUpEvent = await vxmlConnectorTest.manageCall.event(key, 'hangup', lastIntentName, lastIntentTimestamp).catch((err) => { 
                console.error(err); 
                Promise.reject(err);
            })
            assert(catchHangUpEvent.success === true);
        });

        const disconnectIntegration = await vxmlConnectorTest.configConnector.disconnect(subscriptionId).catch((err) => { 
            console.error(err); 
            Promise.reject(err);
        })
        assert(disconnectIntegration)

        const tdClientTest = new TiledeskClientTest({
            APIURL: API_ENDPOINT,
            PROJECT_ID: TILEDESK_PROJECT_ID,
            TOKEN: USER_ADMIN_TOKEN
        });
        const result2 = await tdClientTest.chatbot.deleteChatbot(BOT_ID).catch((err) => { 
            assert.ok(false);
        });
        const result3 = await tdClientTest.department.deleteDepartment(DEP_ID).catch((err) => { 
            assert.ok(false);
        });
        assert(result2.success === true);
        assert(result3._id === DEP_ID);
    });

    it('Catch a prompt (~1s)', () => {
        return new Promise(async(resolve, reject)=> {

            async function repeat(count){
                const ani = (Math.floor(Math.random() * 9000) + 1000).toString(); // Numero tra 1000 e 9999
                const dnis = (Math.floor(Math.random() * 9000) + 1000).toString(); // Numero tra 1000 e 9999
                const callId = (Math.floor(Math.random() * 9000) + 1000).toString(); // Numero tra 1000 e 9999
                console.log('\n//////// ITERATION: ', count+1, '(callId): ' + callId+ ' //////////')
                requests.set(
                    callId,
                    {
                        sent: false,
                        // received_at: null,
                        delay: 0
                    }
                );
                let startTime= new Date().getTime();
                const vxmlStart = await vxmlConnectorTest.manageCall.startCall(ani, dnis, callId).catch((err) => { 
                    console.error("Error while start callID:", callId, err); 
                    reject(err);
                })
                let endTime = new Date().getTime();
                let diffStartTime = endTime-startTime
                console.log("STEP1: time to start a call (/<project-id>/start):", diffStartTime, '[ms]')
                requests.get(callId).sent = true;
                const isValid = XMLValidator.validate(vxmlStart);
                assert.strictEqual(isValid, true, "VXML created is not valid")
                const jsonVXML = xmlParser.parse(vxmlStart).vxml

                let startTimeFirstWait = new Date().getTime();

                //check variables
                let intentName = Utils.getVariableFromVXML('intentName', jsonVXML).expr
                lastIntentName = intentName
    
                //check form block
                let formBlock = jsonVXML.form
                
                let checkIfPromptExist = formBlock.hasOwnProperty('prompt')
                while(!checkIfPromptExist){
                    let nextBlockVxml = await vxmlConnectorTest.manageCall.nextBlock(callId, "" ).catch((err) => { 
                        console.error(err); 
                        reject(err);
                    })
                    const isValid2 = XMLValidator.validate(nextBlockVxml);
                    assert.strictEqual(isValid2, true, "VXML created is not valid")
                    const jsonVXMLNextBlock = xmlParser.parse(nextBlockVxml).vxml
    
    
                    //check variables
                    let intentName = Utils.getVariableFromVXML('intentName', jsonVXMLNextBlock).expr
                    let previousIntentTimestamp = Utils.getVariableFromVXML('previousIntentTimestamp', jsonVXMLNextBlock).expr
                    lastIntentName = intentName
                    lastIntentTimestamp = previousIntentTimestamp
    
    
                    formBlock = jsonVXMLNextBlock.form
                    checkIfPromptExist = formBlock.hasOwnProperty('prompt')                
                }
                //check prompt block
                let endTimePromtResponse = new Date().getTime();
                let diffWaitTimeResponseTime = endTimePromtResponse - startTimeFirstWait
                console.log("STEP 2: time first message is tail off from queue from wait time (/nextblock has a message in queue):", diffWaitTimeResponseTime, '[ms]')
                // console.log("STEP 2: time to get a prompt response from first wait time (/nextblock has a message in queue):", diffWaitTimeResponseTime, '[ms]')
                
                let diffPromptResponseTime = endTimePromtResponse-startTime
                console.log("STEP 3: time to get a prompt response from start time (/nextblock):", diffPromptResponseTime, '[ms]')
            

                let prompt = formBlock.prompt
                const parts = prompt.voice.text.split(":");
                const last = parts[parts.length - 1];
                // console.log("last:", last);
                const delay = new Date(parseInt(last)).getTime() - startTime
                // console.log("delay:", delay);
                requests.get(callId).delay = delay;
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
                
                await new Promise(r => setTimeout(r, interval));
                count++;
                if(count < max_iterations){
                    repeat(count);
                }


            }
            repeat(0)
        })
    })

});
