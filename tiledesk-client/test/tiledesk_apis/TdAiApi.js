
const { v4: uuidv4 } = require('uuid');
const Utils = require('./utils')

class Ai {

  constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG, GPT_KEY){
    this.APIURL = APIURL;
    this.PROJECT_ID = PROJECT_ID;
    this.JWT_TOKEN = JWT_TOKEN;
    this.GPT_KEY = GPT_KEY;
    this.LOG = LOG
  }

  async validateOpenAiKey(){
    return new Promise((resolve, reject)=> {
      const HTTPREQUEST = {
          url: `https://api.openai.com/v1/models`,
          headers: {
            'Content-Type' : 'application/json',
            'Authorization': `Bearer ${this.GPT_KEY}`
          },
          method: 'GET',
          httpsOptions: this.httpsOptions
      };
      Utils.myrequest(
        HTTPREQUEST,
        function(err, resbody) {
            if (err) {
              reject(err)
            }
            else {
              resolve(resbody)
            }
        }, this.LOG
      );
    }); 
  }

}

module.exports = Ai