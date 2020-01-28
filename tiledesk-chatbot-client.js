/* 
    ver 0.5.1
    Andrea Sponziello - (c) Tiledesk.com
*/

const request = require('request');

const API_ENDPOINT = "https://tiledesk-server-pre.herokuapp.com";

/**
 * This is the class that handles the communication with Tiledesk's APIs
 */
class TiledeskClient {    

  /**
   * Constructor for TiledeskClient object
   *
   * @example
   * const { TiledeskClient } = require('tiledesk-client');
   * const tdclient = new TiledeskClient({request: request, response: response});
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.request Express HTTP request object.
   * @param {Object} options.response Express HTTP response object.
   */
  constructor(options) {
    if (!options.request) {
      throw new Error('Request can NOT be empty.');
    }
    if (!options.response) {
      throw new Error('Response can NOT be empty.');
    }

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

    var body = this.request_.body;
    this.text = body.payload.text;
    this.message_subtype = body.payload.attributes.subtype
    this.conversation = body.payload.request;
    console.log("tdconversation: " + this.conversation)
    this.request_id = this.conversation.request_id;
    this.botId = this.conversation.department.bot._id;
    this.botName = this.conversation.department.bot.name;
    this.token = "JWT " + body.token;
    this.project_id = body.payload.id_project;
  }

  sendMessage(msg, callback) {
    // console.log("Sending message to Tiledesk: " + JSON.stringify(msg))
    request({
      url: `${API_ENDPOINT}/${this.project_id}/requests/${this.request_id}/messages`,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': this.token
      },
      json: msg,
      method: 'POST'
      },
      function(err, res, resbody) {
        callback(err)
      }
    );
  }

  updateRequest(properties, attributes, callback) {
    var URL = `${API_ENDPOINT}/${this.project_id}/requests/${this.request_id}/attributes`
    var data = attributes
    if (properties) {
      URL = `${API_ENDPOINT}/${this.project_id}/requests/${this.request_id}/`
      data = properties
    }
    
    request({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': this.token
      },
      json: data,
      method: 'PATCH'
      },
      function(err, res, resbody) {
        if (callback) {
          callback(err)
        }
      }
    );
  }

  updateDepartment(dep_id, callback) {
    request({
      url: `${API_ENDPOINT}/${this.project_id}/requests/${this.request_id}/departments`,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': this.token
      },
      json: {
        departmentid: dep_id
      },
      method: 'PUT'
      },
      function(err, res, resbody) {
        if (err) {
          console.log("BOT UPDATE DEP ERROR: ", err);
        }
        console.log("BOT UPDATE DEP, TILEDESK RESPONSE: " + JSON.stringify(resbody))
        if(res.statusCode === 200) {
          console.log("BOT UPDATE DEP, TILEDESK RESPONSE: OK")
          callback(err)
        }
      }
    );
    
  }

  updateEmailFullname(email, fullname, callback) {
    request({
      url: `${API_ENDPOINT}/${this.project_id}/leads/${this.conversation.lead._id}`,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': this.token
      },
      json: {
        email: email,
        fullname: fullname
      },
      method: 'PUT'
      },
      function(err, res, resbody) {
        callback(err, res, resbody)
      }
    );
  }

}

module.exports = {TiledeskClient};