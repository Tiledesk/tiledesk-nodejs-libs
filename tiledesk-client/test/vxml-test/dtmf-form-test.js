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

describe('CHATBOT: Play a DTMF Form', async () => {
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

            const bot = require('./chatbots/VXML - DTMF Form.json');
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
            
            const department = await tdClientTest.department.createDepartment('dep test vxml', data._id, null).catch((err) => {
                console.error(err); 
                reject(err);
            });
            assert(department)
            assert(department.id)
            assert.equal(department.name, 'dep test vxml')
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
            const config = await vxmlConnectorTest.configConnector.connect(DEP_ID).catch((err) => { 
                console.error(err); 
                reject(err);
            })
            assert(config);
            
            resolve();
        });
    });

    after(async function () {
        //fire hangup event to close conversation
        // const catchHangUpEvent = await vxmlConnectorTest.manageCall.event(callId, 'hangup', lastIntentName, lastIntentTimestamp).catch((err) => { 
        //     console.error(err); 
        //     Promise.reject(err);
        // })
        // console.log('resuuuuu', catchHangUpEvent)
        // assert(catchHangUpEvent.success === true);

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

    it('Catch a DTMF Form (~1s)', () => {
        return new Promise(async(resolve, reject)=> {

            const ani = (Math.floor(Math.random() * 9000) + 1000).toString(); // Numero tra 1000 e 9999
            const dnis = (Math.floor(Math.random() * 9000) + 1000).toString(); // Numero tra 1000 e 9999
            callId = (Math.floor(Math.random() * 9000) + 1000).toString(); // Numero tra 1000 e 9999
            const vxmlStart = await vxmlConnectorTest.manageCall.startCall(ani, dnis, callId).catch((err) => { 
                console.error(err); 
                reject(err);
            })
            const isValid = XMLValidator.validate(vxmlStart);
            assert.strictEqual(isValid, true, "VXML created is not valid")
            const jsonVXML = xmlParser.parse(vxmlStart).vxml
            assert(jsonVXML)
            assert(jsonVXML.var)
            assert(jsonVXML.catch)
            assert(jsonVXML.form)

            //check catch block
            let catchBlock = jsonVXML.catch
            catchBlock.forEach((item) => {
                assert(item.submit)
                assert(item.event)
            })

            //check variables
            let callID =  Utils.getVariableFromVXML('callId', jsonVXML).expr
            let proxyBaseUrl = Utils.getVariableFromVXML('proxyBaseUrl', jsonVXML).expr
            let intentName = Utils.getVariableFromVXML('intentName', jsonVXML).expr
            assert.equal(callID, callId, `Expect callID in vxml to be ${callId} but got: ${callID} `)
            assert.equal(proxyBaseUrl, CONNECTOR_BASE_URL, `Expect proxyBaseUrl in vxml to be ${CONNECTOR_BASE_URL} but got: ${proxyBaseUrl} `)
            assert.equal(intentName, '')
            lastIntentName = intentName

            //check form block
            let formBlock = jsonVXML.form
            assert(formBlock.assign)
            assert(formBlock.break)
            assert(formBlock.submit)
            assert.equal(formBlock.submit.fetchhint, 'safe')
            assert.equal(formBlock.submit.method, 'post')
            assert.equal(formBlock.submit.namelist, 'usertext previousIntentTimestamp')
            assert(formBlock.submit.expr.includes('nextblock'))
            
            let checkIfFieldExist = false
            if(formBlock instanceof Array){
                checkIfFieldExist = formBlock.some(item => item.hasOwnProperty('field'))
            }
            while(!checkIfFieldExist){
                let nextBlockVxml = await vxmlConnectorTest.manageCall.nextBlock(callId, "" ).catch((err) => { 
                    console.error(err); 
                    reject(err);
                })
                const isValid2 = XMLValidator.validate(nextBlockVxml);
                assert.strictEqual(isValid2, true, "VXML created is not valid")
                const jsonVXMLNextBlock = xmlParser.parse(nextBlockVxml).vxml
                // console.log('jsonVXMLNextBlock', jsonVXMLNextBlock)
                assert(jsonVXMLNextBlock)
                assert(jsonVXMLNextBlock.var)
                assert(jsonVXMLNextBlock.catch)
                assert(jsonVXMLNextBlock.form)


                // //check variables
                let callID =  Utils.getVariableFromVXML('callId', jsonVXMLNextBlock).expr
                let proxyBaseUrl = Utils.getVariableFromVXML('proxyBaseUrl', jsonVXMLNextBlock).expr
                let intentName = Utils.getVariableFromVXML('intentName', jsonVXMLNextBlock).expr
                let previousIntentTimestamp = Utils.getVariableFromVXML('previousIntentTimestamp', jsonVXMLNextBlock).expr
                assert.equal(callID, callId, `Expect callID in vxml to be ${callId} but got: ${callID} `)
                assert.equal(proxyBaseUrl, CONNECTOR_BASE_URL, `Expect proxyBaseUrl in vxml to be ${CONNECTOR_BASE_URL} but got: ${proxyBaseUrl} `)
                assert(previousIntentTimestamp)
                lastIntentName = intentName
                lastIntentTimestamp = previousIntentTimestamp


                // formBlock = jsonVXMLNextBlock.form
                formBlock = jsonVXMLNextBlock.form
                if(formBlock instanceof Array){
                    checkIfFieldExist = formBlock.some(item => item.hasOwnProperty('field'))
                }
            }
            
            // ***** FIRST BLOCK ********* //
            let form1Block = formBlock[0]

            //check PROPERTY block
            let properties = form1Block.property
            assert(properties)
            assert(properties[0])
            assert(properties[0].name)
            assert(properties[0].value)
            assert.equal(properties[0].name, 'inputmodes')
            assert.equal(properties[0].value, 'dtmf')

            assert(properties[1])
            assert(properties[1].name)
            assert(properties[1].value)
            assert.equal(properties[1].name, 'timeout')

            //check FIELD block
            let field = form1Block.field
            assert(field)
            assert(field.grammar)
            assert(field.prompt)
            assert(field.name)
            assert.equal(field.name, 'dtmfForm')
            let grammar = field.grammar
            assert(grammar.mode)
            assert.equal(grammar.mode, 'dtmf')
            assert(grammar.text)
            let dtmfSettings = grammar.text.split(';').map(el => { return { "key": el.split('=')[0], "value":  el.split('=')[1] }})
            assert(dtmfSettings.find(el => el.key === 'minDigits'))
            assert(dtmfSettings.find(el => el.key === 'maxDigits'))
            assert(dtmfSettings.find(el => el.key === 'terminators'))
            assert(dtmfSettings.find(el => el.key === 'minDigits').value === '1')
            assert(dtmfSettings.find(el => el.key === 'maxDigits').value === '10')
            assert(dtmfSettings.find(el => el.key === 'terminators').value === '#')
            let prompt = field.prompt
            assert(prompt.voice)
            assert(prompt.voice.name)
            assert(prompt.voice.text)
            assert.equal(prompt.voice.text, "This is a DTMF Form")

            //check FILLED block
            let filled = form1Block.filled
            assert(filled)
            assert(filled.script)
            assert(filled.block)
            assert(filled.block.submit)
            assert.equal(filled.block.submit.fetchhint, 'safe')
            assert.equal(filled.block.submit.method, 'post')
            assert.equal(filled.block.submit.namelist, 'usertext previousIntentTimestamp')
            assert(filled.block.submit.expr.includes('nextblock'))

            //check NOINPUT block
            let noInput = form1Block.noinput
            assert(noInput.assign)
            assert(noInput.goto)
            assert(noInput.assign[0])
            assert(noInput.assign[0].name)
            assert.equal(noInput.assign[0].name, 'menu_choice')
            assert(noInput.assign[0].expr)
            assert.equal(noInput.assign[0].expr, "'no_input'")
            assert(noInput.assign[1])
            assert(noInput.assign[1].name)
            assert.equal(noInput.assign[1].name, 'button')
            assert(noInput.assign[1].expr)

            // ***** FIRST BLOCK ********* //

            // ***** SECOND BLOCK ********* //
            let form2Block = formBlock[1]
            assert(form2Block)
            assert(form2Block.block)
            assert(form2Block.block.submit)
            assert.equal(form2Block.block.submit.fetchhint, 'safe')
            assert.equal(form2Block.block.submit.method, 'post')
            assert.equal(form2Block.block.submit.namelist, 'intentName button previousIntentTimestamp')
            assert(form2Block.block.submit.expr.includes('/no_input'))
            // ***** SECOND BLOCK ********* //

            resolve();
        })
    })

});
