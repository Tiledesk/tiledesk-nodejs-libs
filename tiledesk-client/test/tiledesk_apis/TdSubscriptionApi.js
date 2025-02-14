
const Utils = require('./utils')

class Subscription {

  constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG){
    this.APIURL = APIURL;
    this.PROJECT_ID = PROJECT_ID;
    this.JWT_TOKEN = JWT_TOKEN;
    this.LOG = LOG;
  }


  async subscribe(subscription_info) {
    return new Promise((resolve, reject)=> {
      const URL = this.API_URL + `/${this.project_id}/subscriptions`;
      const HTTPREQUEST = {
        url: URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.JWT_TOKEN
        },
        json: subscription_info,
        method: 'POST'
      };
      Utils.myrequest(
        HTTPREQUEST,
        function (err, resbody) {
            if (err) {
                reject(err)
                
            }
            else {
                resolve(resbody)
                
            }
        }, this.LOG
      );
    })
  }

  async unsubscribe(subscriptionId) {
    return new Promise((resolve, reject)=> {
      const URL = this.API_URL + `/${this.project_id}/subscriptions/${subscriptionId}`;
      const HTTPREQUEST = {
        url: URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.JWT_TOKEN
        },
        method: 'DELETE'
      };
      Utils.myrequest(
        HTTPREQUEST,
        function (err, resbody) {
            if (err) {
                reject(err)
                
            }
            else {
                resolve(resbody)
                
            }
        }, this.LOG
      );
    })
  }
   
}

module.exports = Subscription