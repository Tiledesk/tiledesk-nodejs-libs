
const { v4: uuidv4 } = require('uuid');
const Utils = require('./utils')

class Auth {

    constructor(APIURL, LOG){
        this.APIURL = APIURL;
        this.LOG = LOG
    }


    async authEmailPassword(email, password){
      return new Promise((resolve, reject)=> {
        const HTTPREQUEST = {
          url: `${this.APIURL}/auth/signin`,
          headers: {
            'Content-Type' : 'application/json'
          },
          json: {
            email: email,
            password: password
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
              resolve(resbody)
            }
          }, this.LOG
        );
      }); 
    }

    async signUpEmailPassword(email, password){
      return new Promise((resolve, reject)=> {
        const HTTPREQUEST = {
            url: `${this.APIURL}/auth/signup`,
            headers: {
              'Content-Type' : 'application/json'
            },
            json: {
              email: email,
              password: password,
              firstname: 'Test',
              lastname: 'User'
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
              resolve(resbody)
            }
          }, this.LOG
        );
      }); 
    }

    async createAnonymousUser(tiledeskProjectId) {
        return new Promise((resolve, reject)=> {
            const HTTPREQUEST = {
                url: `${this.APIURL}/auth/signinAnonymously`,
                headers: {
                  'Content-Type' : 'application/json'
                },
                json: {
                    id_project: tiledeskProjectId,
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
                    resolve(resbody)
                  }
                }, this.LOG
            );
        })
    }
}

module.exports = Auth