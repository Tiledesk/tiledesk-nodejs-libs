const Utils = require('./utils')

class Chatbot {

    constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG){
        this.APIURL = APIURL;
        this.PROJECT_ID = PROJECT_ID;
        this.JWT_TOKEN = JWT_TOKEN;
        this.LOG = LOG
    }

    async getAllChatbotFromProject(){

        
    }


    async deleteChatbot(chatbot_id){
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/${this.PROJECT_ID}/faq_kb/${chatbot_id}`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                method: 'DELETE',
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

    async importChatbot(bot_data){
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/${this.PROJECT_ID}/faq_kb/importjson/null/?create=true`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                json: bot_data,
                method: 'POST',
                httpsOptions: this.httpsOptions
            };
            Utils.myrequest(
                HTTPREQUEST,
                function (err, resbody) {
                    if (err) {
                        reject(error)
                    }
                    else {
                        resolve(resbody)
                    }
                }, this.log
            );
        });
        
    }
}

module.exports = Chatbot