
const { v4: uuidv4 } = require('uuid');
const Utils = require('./utils')

class Lead {

  constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG){
    this.APIURL = APIURL;
    this.PROJECT_ID = PROJECT_ID;
    this.JWT_TOKEN = JWT_TOKEN;
    this.LOG = LOG;
  }

}

module.exports = Lead