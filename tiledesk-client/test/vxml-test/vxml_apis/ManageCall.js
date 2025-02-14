const Utils = require('./utils')

class ManageCall {

    constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG){
        this.APIURL = APIURL;
        this.PROJECT_ID = PROJECT_ID;
        this.JWT_TOKEN = JWT_TOKEN;
        this.LOG = LOG
    }

    
    async startCall(ani, dnis, callId, numberTransferParameters, uriTransferParameters, customParam){
        return new Promise((resolve, reject) => {
            let queryParams = '?ani='+ani + '&dnis='+dnis + '&callId='+callId
            if(numberTransferParameters){
                queryParams += '&numberTransferParameters='+numberTransferParameters
            }
            if(uriTransferParameters){
                queryParams += '&uriTransferParameters='+uriTransferParameters
            }
            if(customParam){
                queryParams += '&customParam='+customParam
            }

            const URL = `${this.APIURL}/${this.PROJECT_ID}/start${queryParams}`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'GET',
                httpsOptions: this.httpsOptions
            };
            Utils.myrequest(
                HTTPREQUEST,
                function (err, resbody) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(resbody);
                    }
                }, this.LOG
            );
        });
    }


    async nextBlock(callId, text){
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/nextblock/${callId}`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                },
                json: {
                    usertext: text
                },
                method: 'POST',
                httpsOptions: this.httpsOptions
            };
            Utils.myrequest(
                HTTPREQUEST,
                function (err, resbody) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(resbody);
                    }
                }, this.LOG
            );
        });
    }


    async event(callId, type, intentName, previousIntentTimestamp){
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/event/${callId}/${type}`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                },
                json: {
                    intentName: intentName,
                    previousIntentTimestamp: previousIntentTimestamp
                },
                method: 'POST',
                httpsOptions: this.httpsOptions
            };
            Utils.myrequest(
                HTTPREQUEST,
                function (err, resbody) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve({success: true});
                    }
                }, this.LOG
            );
        });
    }
}

module.exports = ManageCall