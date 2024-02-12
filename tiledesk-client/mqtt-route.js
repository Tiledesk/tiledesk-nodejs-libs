const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Chat21Client } = require('./chat21client.js');
const { TiledeskClient } = require('@tiledesk/tiledesk-client');
const bodyParser = require('body-parser');

router.use(bodyParser.json({limit: '50mb'}));
router.use(bodyParser.urlencoded({ extended: true , limit: '50mb'}));

// let CHAT_API_ENDPOINT;
// let MQTT_ENDPOINT;
// let API_ENDPOINT;
let LOG_STATUS = false;

router.post('/connect', async (req, res) => {
  if (req && req.body && req.body.projectId) {
    if (LOG_STATUS) {
      console.log("Testing mqtt on projectId:", req.body.projectId);
    }
  }
  else {
    console.error("Error: projectId is required");
    res.status(405).send({success: false, message: "Error: projectId is required"});
    return;
  }

  const projectId = req.body.projectId;
  const MQTT_ENDPOINT = req.body.MQTT_ENDPOINT;
  const CHAT_API_ENDPOINT = req.body.CHAT_API_ENDPOINT;
  const API_ENDPOINT = req.body.API_ENDPOINT;
  let userdata;
  try {
    userdata = await createAnonymousUser(projectId, API_ENDPOINT);
    if (!userdata) {
      res.status(405).send({success: false, message: "Anonymous authentication failed"});
      return;
    }
  }
  catch(error) {
      console.error("An error occurred during anonymous authentication:", error);
  }

  let chatClient1 = new Chat21Client(
  {
    appId: "tilechat",
    MQTTendpoint: MQTT_ENDPOINT,
    APIendpoint: CHAT_API_ENDPOINT,
    log: LOG_STATUS
  });
  
  let user1 = {
    fullname: 'User 1',
    firstname: 'User',
    lastname: '1',
  };
  user1.userid = userdata.userid;
  user1.mqttToken = userdata.token;
  user1.tiledesk_token = userdata.tiledesk_token; // UNUSED
  
  // console.log("Message delay check.");
  if (LOG_STATUS) {
    console.log("MQTT endpoint:", MQTT_ENDPOINT);
    console.log("API endpoint:", CHAT_API_ENDPOINT);
    console.log("Connecting...");
  }
  
  let startime = Date.now();
  chatClient1.connect(user1.userid, user1.mqttToken, () => {
    if (LOG_STATUS) {
      console.log("chatClient1 connected. UserId:", user1.userid);
    }
    let connectedAt = Date.now();
    let connectionTime = connectedAt - startime;
    chatClient1.close(() => {
      if (LOG_STATUS) {
        console.log("chatClient1 disconnected. UserId:", user1.userid);
      }
      let disconnectingTimeMillis = Date.now() - connectedAt;
      let totalTimeMillis = Date.now() - startime;
      res.send({
        connectionTimeMillis: connectionTime,
        disconnectingTimeMillis: disconnectingTimeMillis,
        totalTimeMillis: totalTimeMillis,
        anonymousUserId: user1.userid,
        success: true
      });
    });
  });
});

async function startApp(settings, completionCallback) {
  console.log("Starting MQTT Test route...", settings);

  if (settings.LOG_STATUS === true) {
    LOG_STATUS = settings.LOG_STATUS;
  }

  // if (!settings.CHAT_API_ENDPOINT) {
  //   throw new Error("(MQTT Test route) settings.CHAT_API_ENDPOINT is mandatory.");
  // }
  // else {
  //   CHAT_API_ENDPOINT = settings.CHAT_API_ENDPOINT;
  //   if (LOG_STATUS) {console.log("(MQTT Test route) CHAT_API_ENDPOINT:", CHAT_API_ENDPOINT);}
  // }

  // if (!settings.MQTT_ENDPOINT) {
  //   throw new Error("(MQTT Test route) settings.MQTT_ENDPOINT is mandatory.");
  // }
  // else {
  //   MQTT_ENDPOINT = settings.MQTT_ENDPOINT;
  //   if (LOG_STATUS) {console.log("(MQTT Test route) settings.MQTT_ENDPOINT:", MQTT_ENDPOINT);}
  // }

  // if (!settings.API_ENDPOINT) {
  //   throw new Error("(MQTT Test route) settings.API_ENDPOINT is mandatory.");
  // }
  // else {
  //   API_ENDPOINT = settings.API_ENDPOINT;
  //   if (LOG_STATUS) {console.log("(MQTT Test route) settings.API_ENDPOINT:", API_ENDPOINT);}
  // }

  completionCallback();
}

async function createAnonymousUser(tiledeskProjectId, API_ENDPOINT) {
  ANONYMOUS_TOKEN_URL = API_ENDPOINT + '/auth/signinAnonymously';
  if (LOG_STATUS) {
      console.log("(MQTT Test route) Getting ANONYMOUS_TOKEN_URL:", ANONYMOUS_TOKEN_URL);
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
          console.log("(MQTT Test route) HTTP Params ANONYMOUS_TOKEN_URL:", axios_config);
      }
      axios.request(axios_config)
      .then((response) => {
          if (LOG_STATUS) {
              console.log("(MQTT Test route) Got Anonymous Tiledesk Token:", JSON.stringify(response.data.token));
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

module.exports = { router: router, startApp: startApp};