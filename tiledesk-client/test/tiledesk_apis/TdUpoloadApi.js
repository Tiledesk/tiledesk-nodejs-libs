
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
      const formData = new FormData();
      const that = this
      formData.append("file", resource.file);
      if( (resource.type.startsWith('image')) && (!upload.type.includes('svg')) ){
        //USE IMAGE API
        let HTTPREQUEST = {
          url: `${that.API_IMAGE_URL}/users`,
          headers: {
            'Authorization': that.JWT_TOKEN,
            ...formData.getHeaders()
          },
          json: formData,
          method: 'POST',
          httpsOptions: that.httpsOptions
        };
        Utils.myrequest(
          HTTPREQUEST,
          function(err, resbody) {
              if (err) {
                reject(err)
              }
              else {
                const downloadURL = that.API_IMAGE_URL + '?path=' + resbody['filename'];
                resolve({downloadURL : downloadURL, src: downloadURL, ...resbody})
              }
          }, that.LOG
        );
      }else {
        //USE FILE API
        let HTTPREQUEST = {
          url: `${that.API_FILE_URL}/users`,
          headers: {
            'Authorization': that.JWT_TOKEN,
            ...formData.getHeaders()
          },
          json: formData,
          method: 'POST',
          httpsOptions: that.httpsOptions
        };
        Utils.myrequest(
          HTTPREQUEST,
          function(err, resbody) {
              if (err) {
                reject(err)
              }
              else {
                const src = that.API_FILE_URL + '?path=' + encodeURI(resbody['filename']);
                const downloadURL = that.API_FILE_URL + '/download' + '?path=' + encodeURI(resbody['filename']);
                resolve({downloadURL : downloadURL, src: src, ...resbody})
              }
          }, that.LOG
        );
      }
      
      
    }); 
  }

  async delete(type, path){
    return new Promise((resolve, reject)=> {
      let HTTPREQUEST = {}
      if(type === 'image'){
        HTTPREQUEST = {
          url: `${this.API_IMAGE_URL}/users?path=${path}`,
          headers: {
            'Content-Type' : 'application/json',
            'Authorization': this.JWT_TOKEN
          },
          method: 'DELETE',
          httpsOptions: this.httpsOptions
        };
      }else if(type === 'file'){
        HTTPREQUEST = {
          url: `${this.API_FILE_URL}/users?path=${path}`,
          headers: {
            'Content-Type' : 'application/json',
            'Authorization': this.JWT_TOKEN
          },
          method: 'DELETE',
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
}

module.exports = Upload