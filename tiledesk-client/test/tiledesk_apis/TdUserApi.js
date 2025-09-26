
const { v4: uuidv4 } = require('uuid');
const Utils = require('./utils')

class User {

  constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG){
    this.APIURL = APIURL;
    this.PROJECT_ID = PROJECT_ID;
    this.JWT_TOKEN = JWT_TOKEN;
    this.LOG = LOG;
  }


  async addUserToProject(email, role, available){
    return new Promise((resolve, reject)=> {
      const HTTPREQUEST = {
          url: `${this.APIURL}/${this.PROJECT_ID}/project_users/invite`,
          headers: {
            'Content-Type' : 'application/json',
            'Authorization': this.JWT_TOKEN
          },
          json: {
            email: email,
            role: role,
            user_available: available
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

  async removeUserToProject(user_id){
    return new Promise((resolve, reject)=> {
      const HTTPREQUEST = {
        url: `${this.APIURL}/${this.PROJECT_ID}/project_users/${user_id}?hard=true`,
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

  async setAvailability(user_id, available, status){
    return new Promise((resolve, reject)=> {
      const HTTPREQUEST = {
          url: `${this.APIURL}/${this.PROJECT_ID}/project_users/${user_id}`,
          headers: {
            'Content-Type' : 'application/json',
            'Authorization': this.JWT_TOKEN
          },
          json: {
            user_available: available,
            profileStatus: status
          },
          method: 'PUT',
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

  async removeUser(token){
    return new Promise((resolve, reject)=> {
      const HTTPREQUEST = {
          url: `${this.APIURL}/users`,
          headers: {
            'Content-Type' : 'application/json',
            'Authorization': token
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

   
}

module.exports = User