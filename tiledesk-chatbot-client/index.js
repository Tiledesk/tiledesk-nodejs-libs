/* 
    Andrea Sponziello - (c) Tiledesk.com
*/

// const request = require('request');
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
   * @param {Object} options.APIKEY Mandatory. Tiledesk APIKEY.
   * @param {Object} options.APIURL Optional. Tiledesk server api endpoint. If not provided, cloud endpoint is used
   * @param {Object} options.requestId Optional. If options.request is not provided this will be used
   * @param {Object} options.token Optional. If options.request is not provided this will be used
   * @param {Object} options.projectId Optional. If options.request is not provided this will be used
   * @param {Object} options.leadId Optional. If options.request is not provided this will be used
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

    if (options.APIURL) {
      this.APIURL = options.APIURL
    }
    else {
      this.APIURL = "https://api.tiledesk.com/v2";
    }

    this.log = false;
    if (options && options.log) {
      this.log = options.log;
    }

    // this.text = body.payload.text;
    // if (body.payload.attributes) {
    //   this.message_subtype = body.payload.attributes.subtype
    // }
    // this.botId = this.conversation.department.bot._id;
    // this.botName = this.conversation.department.bot.name;
    if (this.request_) {
      const body = this.request_.body;
      if (!body.payload) {
        throw new Error('Request body.payload can not be empty.');
      }
      const payload = body.payload
      this.supportRequest = payload.request;
      this.text = payload.text;
      if (this.supportRequest && this.supportRequest.lead) {
        this.leadId = this.supportRequest.lead._id
      }
      this.requestId = this.supportRequest.request_id;
      this.token = body.token;
      this.projectId = payload.id_project;
      if (payload && payload.attributes && payload.attributes.action) {
        this.action = payload.attributes.action
      }
      if (body.hook) {
        this.chatbot_name = body.hook.name;
        this.chatbot_id = body.hook._id;
      }
    }
    else {
      // request_id
      if (options.requestId) {
        this.requestId = options.requestId
      }
      else {
        throw new Error('options.request_id can NOT be empty.');
      }
      // token
      if (options.token) {
        this.token = options.token;
      }
      else {
        throw new Error('options.token can NOT be empty.');
      }
      // projectId
      if (options.projectId) {
        this.projectId = options.projectId
      }
      else {
        throw new Error('options.projectId can NOT be empty.');
      }
      // lead_id
      if (options.lead_id) {
        this.leadId = options.leadId
      }
      // text
      if (options.text) {
        this.text = options.text
      }
    }
    // now initialize an instance of TiledeskClient:
    this.tiledeskClient = new TiledeskClient(
    {
      projectId: this.projectId,
      token: this.token,
      APIURL: this.APIURL,
      APIKEY: options.APIKEY,
      log: this.log
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
    this.tiledeskClient.sendSupportMessage(
      this.requestId,
      msg,
      callback);
  }

  updateRequest(properties, attributes, callback) {
    this.tiledeskClient.updateRequest(
      this.requestId,
      properties,
      attributes,
      callback);
  }

  updateDepartment(dep_id, callback) {
    this.tiledeskClient.updateDepartment(
      this.requestId,
      dep_id,
      callback);
  }

  updateLeadEmailFullname(email, fullname, callback) {
    if (!this.leadId) {
      throw new Error('options.lead_id can NOT be empty.');
    }
    this.tiledeskClient.updateLeadEmailFullname(
      this.leadId,
      email,
      fullname,
      callback);
  }

}

module.exports = { TiledeskChatbotClient };