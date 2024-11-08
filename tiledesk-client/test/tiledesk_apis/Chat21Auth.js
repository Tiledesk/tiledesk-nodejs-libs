
const { v4: uuidv4 } = require('uuid');
const Utils = require('./utils');
const { response } = require('express');

class Chat21Auth {
    constructor(APIURL, LOG){
        this.APIURL = APIURL;
        this.LOG = LOG
    }

    /**
     * 
     * @param {*} token 
     * @returns 
     */
    async signInWithCustomToken(token) {
      return new Promise((resolve, reject) => {
        const HTTPREQUEST = {
          url: `${this.APIURL}/chat21/native/auth/createCustomToken`,
          headers: {
            'Content-Type' : 'application/json',
            'Authorization' : token
          },
          method: 'POST',
          httpsOptions: this.httpsOptions
        };
        Utils.myrequest(
          HTTPREQUEST,
          function(err, resbody) {
            if (err) {
              reject(err)
            }
            else {
              const mqtt_token = resbody.token;
              const chat21_userid = resbody.userid;
              resolve({
                  userid: chat21_userid,
                  token:  mqtt_token
              });
            }
          }, this.LOG
        );
      });
        
    }
}

module.exports = Chat21Auth