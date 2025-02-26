
const { v4: uuidv4 } = require('uuid');
const Utils = require('./utils')
const FormData = require("form-data");

class Upload {

  constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG){
    this.API_IMAGE_URL = APIURL + '/images'
    this.API_FILE_URL = APIURL + '/files'
    this.PROJECT_ID = PROJECT_ID;
    this.JWT_TOKEN = JWT_TOKEN;
    this.LOG = LOG
  }

  async upload(resource){
    return new Promise((resolve, reject)=> {
      let HTTPREQUEST= {}
      const formData = new FormData();
      formData.append("file", resource.file);

      console.log('formrrrr', formData)
      if( (resource.type.startsWith('image')) && (!upload.type.includes('svg')) ){
        //USE IMAGE API
        HTTPREQUEST = {
          url: `${this.API_IMAGE_URL}/users`,
          headers: {
            'Authorization': this.JWT_TOKEN,
            ...formData.getHeaders()
          },
          json: formData,
          method: 'POST',
          httpsOptions: this.httpsOptions
        };

      }else {
        //USE FILE API
        HTTPREQUEST = {
          url: `${this.API_FILE_URL}/users`,
          headers: {
            'Authorization': this.JWT_TOKEN,
            ...formData.getHeaders()
          },
          json: formData,
          method: 'POST',
          httpsOptions: this.httpsOptions
        };
      }
      
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

  async deleteTag(tag_id){
    return new Promise((resolve, reject)=> {
      const HTTPREQUEST = {
          url: `${this.APIURL}/${this.PROJECT_ID}/tags/${tag_id}`,
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
}

module.exports = Upload