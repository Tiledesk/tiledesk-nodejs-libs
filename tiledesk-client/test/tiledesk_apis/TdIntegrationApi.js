
const { v4: uuidv4 } = require('uuid');
const Utils = require('./utils')

class Integration {

  constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG){
    this.APIURL = APIURL;
    this.PROJECT_ID = PROJECT_ID;
    this.JWT_TOKEN = JWT_TOKEN;
    this.LOG = LOG
  }

  integrations = []

  async addIntegration(type, values){
    return new Promise((resolve, reject)=> {
      const HTTPREQUEST = {
          url: `${this.APIURL}/${this.PROJECT_ID}/integration`,
          headers: {
            'Content-Type' : 'application/json',
            'Authorization': this.JWT_TOKEN
          },
          json: {
            name: type,
            value: values
          },
          method: 'POST',
          httpsOptions: this.httpsOptions
      };
      const that = this;
      Utils.myrequest(
        HTTPREQUEST,
        function(err, resbody) {
            if (err) {
              reject(err)
            }
            else {
              const exists = that.integrations.some(item => item.key === resbody.name);
              if (!exists) {
                that.integrations.push({
                  key: resbody.name,
                  value: resbody.value.apikey
                });
              }

              resolve(resbody)
            }
        }, this.LOG
      );
    }); 
  }

  async deleteIntegration(ID){
    return new Promise((resolve, reject)=> {
      const HTTPREQUEST = {
          url: `${this.APIURL}/${this.PROJECT_ID}/integration/${ID}`,
          headers: {
            'Content-Type' : 'application/json',
            'Authorization': this.JWT_TOKEN
          },
          method: 'DELETE',
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


  getIntegrationByName(name){
    return this.integrations.find(item => item.key === name);
  }

}

module.exports = Integration