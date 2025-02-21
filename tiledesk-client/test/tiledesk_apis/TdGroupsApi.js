
const { v4: uuidv4 } = require('uuid');
const Utils = require('./utils')

class Group {

  constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG){
    this.APIURL = APIURL;
    this.PROJECT_ID = PROJECT_ID;
    this.JWT_TOKEN = JWT_TOKEN;
    this.LOG = LOG
  }

  async add(name){
    return new Promise((resolve, reject)=> {
      const HTTPREQUEST = {
          url: `${this.APIURL}/${this.PROJECT_ID}/groups`,
          headers: {
            'Content-Type' : 'application/json',
            'Authorization': this.JWT_TOKEN
          },
          json: {
            name: name
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

  async addMembers(id, members){
    return new Promise((resolve, reject)=> {
      const HTTPREQUEST = {
          url: `${this.APIURL}/${this.PROJECT_ID}/groups/${id}`,
          headers: {
            'Content-Type' : 'application/json',
            'Authorization': this.JWT_TOKEN
          },
          json: {
            members: members
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

  async delete(id){
    return new Promise((resolve, reject)=> {
      const HTTPREQUEST = {
          url: `${this.APIURL}/${this.PROJECT_ID}/groups/${id}`,
          headers: {
            'Content-Type' : 'application/json',
            'Authorization': this.JWT_TOKEN
          },
          json: {
            trashed: true
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

}

module.exports = Group