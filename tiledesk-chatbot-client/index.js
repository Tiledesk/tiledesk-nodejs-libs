/* 
    ver 0.5.16
    Andrea Sponziello - (c) Tiledesk.com
*/

const request = require('request');
// const { TiledeskClient } = require('../tiledesk-client');
const { TiledeskClient } = require('@tiledesk/tiledesk-client');

/**
 * This is the class that handles the communication with Tiledesk's APIs
 */
class TiledeskChatbotClient {

  /**
   * Constructor for TiledeskClient object
   *
   * @example
   * const { TiledeskChatbotClient } = require('tiledesk-chatbot-client');
   * const tdclient = new TiledeskChatbotClient({request: request, response: response});
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.request Optional. Express HTTP request object.
   * @param {Object} options.APIURL Optional. Tiledesk server api endpoint. If not provided, cloud endpoint is used
   * @param {Object} options.request_id Optional. If options.request is not provided this will be used
   * @param {Object} options.token Optional. If options.request is not provided this will be used
   * @param {Object} options.project_id Optional. If options.request is not provided this will be used
   * @param {Object} options.lead_id Optional. If options.request is not provided this will be used
   * @param {Object} options.text Optional. If options.request is not provided this will be used
   * 
   * 
   */
  constructor(options) {
    // if (!options.request) {
    //   throw new Error('Request can NOT be empty.');
    // }
    // if (!options.response) {
    //   throw new Error('Response can NOT be empty.');
    // }

    /**
     * The Express HTTP request that the endpoint receives from the Assistant.
     * @private
     * @type {Object}
     */
    this.request_ = options.request;

    /**
     * The Express HTTP response the endpoint will return to Assistant.
     * @private
     * @type {Object}
     */
    this.response_ = options.response;

    if (options.APIURL) {
      this.API_ENDPOINT = options.APIURL
    }
    else {
      this.API_ENDPOINT = "https://api.tiledesk.com/v2";
    }
    // this.text = body.payload.text;
    // if (body.payload.attributes) {
    //   this.message_subtype = body.payload.attributes.subtype
    // }
    // console.log("tdconversation: " + this.conversation)
    // this.botId = this.conversation.department.bot._id;
    // this.botName = this.conversation.department.bot.name;
    if (this.request_) {
      var body = this.request_.body;
      if (!body.payload) {
        throw new Error('Request body.payload can not be empty.');
      }
      const payload = body.payload
      this.supportRequest = payload.request;
      this.text = payload.text;
      if (this.supportRequest && this.supportRequest.lead) {
        this.lead_id = this.supportRequest.lead._id
      }
      this.request_id = this.supportRequest.request_id;
      this.token = this.fixToken(body.token);
      this.project_id = payload.id_project;
      if (payload && payload.attributes && payload.attributes.action) {
        this.action = payload.attributes.action
      }
    }
    else {
      // request_id
      if (options.request_id) {
        this.request_id = options.request_id
      }
      else {
        throw new Error('options.request_id can NOT be empty.');
      }
      // token
      if (options.token) {
        this.token = this.fixToken(options.token)
      }
      else {
        throw new Error('options.token can NOT be empty.');
      }
      // project_id
      if (options.project_id) {
        this.project_id = options.project_id
      }
      else {
        throw new Error('options.project_id can NOT be empty.');
      }
      // lead_id
      if (options.lead_id) {
        this.lead_id = options.lead_id
      }
      // text
      if (options.text) {
        this.text = options.text
      }
    }
    // finally initialize an instance of TiledeskClient:
    this.tiledeskClient = new TiledeskClient(
      {
        projectId: this.project_id,
        token: this.token,
        APIURL: this.API_ENDPOINT
      });
  }

  fixToken(token) {
    if (token.startsWith('JWT ')) {
      return token
    }
    else {
      return 'JWT ' + token
    }
  }

  sendMessage(msg, callback) {
    this.tiledeskClient.sendMessage(
      msg,
      this.request_id,
      callback);
    // TiledeskChatbotClient.myrequest(
    //   {
    //     url: `${this.API_ENDPOINT}/${this.project_id}/requests/${this.request_id}/messages`,
    //     headers: {
    //       'Content-Type' : 'application/json',
    //       'Authorization': this.token
    //     },
    //     json: msg,
    //     method: 'POST'
    //   },
    //     function(err, res, resbody) {
    //       if (callback) {
    //         callback(err)
    //       }
    //     }
    //   );
  }

  // static myrequest(options, callback) {
  //   request(
  //     {
  //       url: options.url,
  //       headers: options.headers,
  //       json: options.json,
  //       method: options.method
  //     },
  //       function(err, res, resbody) {
  //         if (callback) {
  //           callback(err,res, resbody);
  //         }
  //       }
  //     );
  // }

  // static sendMessageRaw(api_endpoint, project_id, request_id, msg, token, callback) {
  //   // console.log("Sending message to Tiledesk: " + JSON.stringify(msg))
  //   request({
  //     url: `${api_endpoint}/${project_id}/requests/${request_id}/messages`,
  //     headers: {
  //       'Content-Type' : 'application/json',
  //       'Authorization': token
  //     },
  //     json: msg,
  //     method: 'POST'
  //     },
  //     function(err, res, resbody) {
  //       callback(err)
  //     }
  //   );
  // }

  updateRequest(properties, attributes, callback) {
    this.tiledeskClient.updateRequest(this.request_id, properties, attributes, callback);
    // var URL = `${this.API_ENDPOINT}/${this.project_id}/requests/${this.request_id}/attributes`
    // var data = attributes
    // if (properties) {
    //   URL = `${this.API_ENDPOINT}/${this.project_id}/requests/${this.request_id}/`
    //   data = properties
    // }
    
    // request({
    //   url: URL,
    //   headers: {
    //     'Content-Type' : 'application/json',
    //     'Authorization': this.token
    //   },
    //   json: data,
    //   method: 'PATCH'
    //   },
    //   function(err, res, resbody) {
    //     if (callback) {
    //       callback(err)
    //     }
    //   }
    // );
  }

  updateDepartment(dep_id, callback) {
    this.tiledeskClient.updateRequest(this.request_id, dep_id, callback);
    // request({
    //   url: `${this.API_ENDPOINT}/${this.project_id}/requests/${this.request_id}/departments`,
    //   headers: {
    //     'Content-Type' : 'application/json',
    //     'Authorization': this.token
    //   },
    //   json: {
    //     departmentid: dep_id
    //   },
    //   method: 'PUT'
    //   },
    //   function(err, res, resbody) {
    //     if (err) {
    //       console.log("BOT UPDATE DEP ERROR: ", err);
    //     }
    //     console.log("BOT UPDATE DEP, TILEDESK RESPONSE: " + JSON.stringify(resbody))
    //     if(res.statusCode === 200) {
    //       console.log("BOT UPDATE DEP, TILEDESK RESPONSE: OK")
    //       callback(err)
    //     }
    //   }
    // );
    
  }

  updateLeadEmailFullname(email, fullname, callback) {
    if (!this.lead_id) {
      throw new Error('options.lead_id can NOT be empty.');
    }
    this.tiledeskClient.updateLeadEmailFullname(this.lead_id, email, fullname, callback);
    // request({
    //   url: `${this.API_ENDPOINT}/${this.project_id}/leads/${this.lead_id}`, // this.conversation.lead._id
    //   headers: {
    //     'Content-Type' : 'application/json',
    //     'Authorization': this.token
    //   },
    //   json: {
    //     email: email,
    //     fullname: fullname
    //   },
    //   method: 'PUT'
    //   },
    //   function(err, res, resbody) {
    //     callback(err, res, resbody)
    //   }
    // );
  }

}

module.exports = { TiledeskChatbotClient };