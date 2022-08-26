let axios = require('axios');
let https = require("https");

class HelpCenterQuery {

  static DEFAULT_API_ENDPOINT = "https://tiledesk-cms-server-prod.herokuapp.com";
  
  /**
   * Constructor for HelpCenterQuery Client object
   *
   * @example
   * const { HelpCenterQuery } = require('@tiledesk/helpcenter-query-client');
   * const helpcenter = new HelpCenterQuery({APIKEY: 'THE_API_KEY', projectId: 'YOUR_PROJECT_ID', workspaceId: 'HELPCENTER_WORKSPACE'});
   * const helpcenter = new HelpCenterQuery({APIKEY: 'THE_API_KEY', projectId: 'YOUR_PROJECT_ID', workspaceId: 'HELPCENTER_WORKSPACE', APIURL: 'OPTIONAL_SELF_HOSTED_INSTANCE_ENDPOINT', log: "OPTIONAL BOOLEAN true/false"});
   * @param {Object} options JSON configuration.
   * @param {string} options.APIKEY Mandatory. Tiledesk APIKEY
   * @param {string} options.projectId Mandatory. Tiledesk projectId. Will be used in each call on project's APIs.
   * @param {string} options.APIURL Optional. Tiledesk server API endpoint.
   * @param {boolean} options.log Optional. If true HTTP requests are logged.
   */
  constructor(options) {
    if (!options) {
      throw new Error('options.APIKEY, options.projectId and options.token are mandatory.');
    }

    if (!options.APIKEY) {
      throw new Error('options.APIKEY can NOT be null.');
    }
    else {
      this.APIKEY = options.APIKEY;
    }

    if (options && options.APIURL) {
      this.APIURL = options.APIURL
    }
    else {
      this.APIURL = HelpCenterQuery.DEFAULT_API_ENDPOINT;
    }

    if (!options.projectId) {
      throw new Error('options.projectId can NOT be null.');
    }
    else {
      this.projectId = options.projectId;
    }

    if (!options.workspaceId) {
      throw new Error('options.workspaceId can NOT be null.');
    }
    else {
      this.workspaceId = options.workspaceId;
    }

    this.log = false;
    if (options.log) {
      this.log = options.log;
    }
  }

  search(text, maxResults, callback) {

    const escaped_text = encodeURI(text);
    var url = this.APIURL + `/${this.projectId}/${this.workspaceId}/contents/search?text=${escaped_text}&maxresults=${maxResults}`

    const HTTPREQUEST = {
      url: url,
      headers: {
      },
      method: 'GET'
    };
    this.myrequest(
      HTTPREQUEST,
      function(err, resbody) {
        if (err) {
          if (callback) {
            callback(err);
          }
        }
        else {
          if (callback) {
            callback(null, resbody);
          }
        }
      }, this.log
    );
  }

  myrequest(options, callback, log) {
    //console.log("API URL:", options.url);
    //console.log("** Options:", options);
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    axios(
      {
        url: options.url,
        method: options.method,
        data: options.json,
        httpsAgent: httpsAgent,
        headers: options.headers
      })
    .then(function (res) {
      if (log) {
        console.log("Response for url:", options.url);
        console.log("Response headers:\n", res.headers);
        console.log("******** Response for url:", res);
        console.log("Response body:\n", res.data);
      }
      if (res && res.status == 200 && res.data) {
        if (callback) {
          callback(null, res.data);
        }
      }
      else {
        if (callback) {
          callback(TiledeskClient.getErr({message: "Response status not 200"}, options, res), null, null);
        }
      }
    })
    .catch(function (error) {
      console.error("An error occurred:", error);
      if (callback) {
        callback(error, null, null);
      }
    });
  }
}

module.exports = { HelpCenterQuery };