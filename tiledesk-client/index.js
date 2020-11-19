/* 
    ver 0.6.18
    Andrea Sponziello - (c) Tiledesk.com
*/

const request = require('request')

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
   * @param {Object} options.APIURL Optional. Tiledesk server api endpoint
   * @param {Object} options.projectId Mandatory. Tiledesk projectId
   * @param {Object} options.token Mandatory. Tiledesk auth token
   * 
   */
  static DEFAULT_API_ENDPOINT = "https://api.tiledesk.com/v2";

  constructor(options) {
    if (!options.projectId) {
      throw new Error('projectId can NOT be empty.');
    }
    if (!options.token) {
      throw new Error('token can NOT be empty.');
    }

    if (options && options.APIURL) {
      this.API_ENDPOINT = options.APIURL
    }
    else {
      this.API_ENDPOINT = TiledeskClient.DEFAULT_API_ENDPOINT;
    }

    this.projectId = options.projectId
    this.token = this.fixToken(options.token)
  }

  fixToken(token) {
    if (token.startsWith('JWT ')) {
      return token
    }
    else {
      return 'JWT ' + token
    }
  }

  getProjectSettings(callback) {
    const URL = `${this.API_ENDPOINT}/projects/${this.projectId}`
    console.log("getProjectSettings URL:", URL);
    // console.log("getProjectSettings token:", _token);
    
    request({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': this.token
      },
      json: true,
      method: 'GET'
    },
    function(err, response, resbody) {
      // console.log("response: ", JSON.stringify(response))
      if (response.statusCode == 200) {
        callback(null, resbody)
      }
      else {
        const error_msg = "getProjectSettings. Status code: " + response.statusCode
        callback(error_msg, null)
      }
    });
  }

  static getProjectSettingsRaw(APIENDPOINT, project_id, token, callback) {
    const _token = this.fixToken(token)
    const URL = `${APIENDPOINT}/projects/${project_id}`
    // console.log("getProjectSettings URL:", URL);
    // console.log("getProjectSettings token:", _token);
    request({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': _token
      },
      json: true,
      method: 'GET'
    },
    function(err, response, resbody) {
      // console.log("response: ", JSON.stringify(response))
      if (response.statusCode == 200) {
        callback(null, resbody)
      }
      else {
        const error_msg = "getProjectSettings. Status code: " + response.statusCode
        callback(error_msg, null)
      }
    });
  }

  static getAllProjectUsersRaw(APIENDPOINT, project_id, departmentid, token, callback) {
    const _token = this.fixToken(token)
    const URL = `${this.APIENDPOINT}/${project_id}/departments/${departmentid}/operators?disableWebHookCall=true`
    console.log("getAllProjectUsers URL:", URL);
    request({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': _token
      },
      json: true,
      method: 'GET'
    },
    function(err, response, resbody) {
      callback(err, resbody)
    });
  }

  static updateRequestPropertiesRaw(API_ENDPOINT, request_id, project_id, properties, token, callback) {
    const jwt_token = this.fixToken(token)
    var URL = `${APIENDPOINT}/${project_id}/requests/${request_id}`
    data = properties
    console.log("updating request attributes URL:", URL)
    console.log("updating request attributes jwt_token:", jwt_token)
    request({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
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

  static updateRequestAttributesRaw(APIENDPOINT, request_id, project_id, attributes, token, callback) {
    const jwt_token = this.fixToken(token)
    var URL = `${API_ENDPOINT}/${project_id}/requests/${request_id}/attributes`
    var data = attributes
    console.log("updating request attributes URL:", URL)
    console.log("updating request attributes jwt_token:", jwt_token)
    request({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
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

  static getProjectUserRaw(APIENDPOINT, project_id, user_id, token, callback) {
    const jwt_token = 'JWT ' + token
    const URL = `${APIENDPOINT}/${project_id}/project_users/users/${user_id}`
    console.log("getProjectUser.URL: ", URL);
    console.log("with token: ", jwt_token)
    request({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: true,
      method: 'GET'
    },
    function(err, response, resbody) {
      // console.log("resbody: ", JSON.stringify(resbody))
      if (resbody && resbody[0]) {
        if (callback) {
          callback(err, resbody[0])
        }
      }
      else {
        if (callback) {
          callback(err, null)
        }
      }
    });
  }

  static updateProjectUserAvailableRaw(APIENDPOINT, project_id, project_user_id, user_available, token, callback) {
    const jwt_token = 'JWT ' + token
    const URL = `${APIENDPOINT}/${project_id}/project_users/${project_user_id}`
    console.log("setProjectUserAvailable. URL:", URL);
    console.log("with token: ", jwt_token)
    request({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: {
        user_available: user_available
      },
      method: 'PUT'
    },
    function(err, response, resbody) {
      if (callback) {
        callback(err, resbody)
      }
    });
  }

  static updateProjectUserAttributesRaw(APIENDPOINT, project_id, project_user_id, attributes, token, callback) {
    const jwt_token = 'JWT ' + token
    const URL = `${APIENDPOINT}/${project_id}/project_users/${project_user_id}`
    console.log("setProjectUserAvailable. URL:", URL);
    console.log("with token: ", jwt_token)
    request({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: {
        attributes: attributes
      },
      method: 'PUT'
    },
    function(err, response, resbody) {
      if (callback) {
        callback(err, resbody)
      }
    });
  }

  static getRequestsRaw(APIENDPOINT, project_id, token, limit, status, callback) {
    const jwt_token = 'JWT ' + token
    // direction = 1 => oldest must be served first
    const URL = `${APIENDPOINT}/${project_id}/requests?status=${status}&limit=${limit}&direction=1`
    request({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: true,
      method: 'GET'
    },
    function(err, response, resbody) {
      // console.log("resbody: ", JSON.stringify(resbody))
      if (resbody && resbody.requests) {
        if (callback) {
          callback(err, resbody.requests)
        }
      }
      else {
        // throw
        console.log("Error getting requests. Error:", err, " URL", URL, " token:", jwt_token, " Body:", resbody)
      }
    });
  }

  static updateRequestParticipantsRaw(APIENDPOINT, project_id, request_id, token, participants, callback) {
    const jwt_token = 'JWT ' + token
    const URL = `${APIENDPOINT}/${project_id}/requests/${request_id}/participants`
    console.log("update request participant... URL:", URL);
    console.log("with token: ", jwt_token)
    request({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: participants,
      method: 'PUT'
    },
    function(err, response, resbody) {
      // console.log('resbody.requests:', resbody.requests);
      if (callback) {
        callback(err)
      }
    });
  }

  static getWidgetSettingsRaw(APIENDPOINT, project_id, callback) {
    request(
    {
      url: `${APIENDPOINT}/${project_id}/widgets`,
      method: 'GET',
      json: true
    },
    function(err, response, resbody) {
      if(response.statusCode === 200) {
        if (callback) {
          callback(resbody)
        }
      }
    });
  }

  static openNow(APIENDPOINT, project_id, token, callback) {
    const jwt_token = 'JWT ' + token
    request({
       url: `${APIENDPOINT}/projects/${project_id}/isopen`,
       headers: {
         'Content-Type' : 'application/json',
         'Authorization': jwt_token
       },
       method: 'GET'
     },
     function(err, response, resbody) {
      //  console.log("resbody: ", resbody)
       if(response.statusCode === 200) {
         if (callback) {
          callback(JSON.parse(resbody).isopen)
         }
       }
    });
  }

  openNow(callback) {
    TiledeskClient.openNow(this.API_ENDPOINT, this.projectId, this.token, callback);
  }
   
  static anonymousAuthenticationRaw(APIENDPOINT, project_id, callback) {
    console.log("using project_id", project_id)
    request({
      url: `${APIENDPOINT}/auth/signinAnonymously`,
      headers: {
        'Content-Type' : 'application/json'
      },
      json: {
        "id_project": project_id
      },
      method: 'POST'
    },
    function(err, response, resbody) {
      if (callback) {
        callback(err, response, resbody)
      }
    });
  }

  static anonymousAuthentication(project_id, callback) {
    TiledeskClient.anonymousAuthenticationRaw(TiledeskClient.DEFAULT_API_ENDPOINT, project_id, callback);
    // request({
    //   url: `${DEFAULT_API_ENDPOINT}/auth/signinAnonymously`,
    //   headers: {
    //     'Content-Type' : 'application/json'
    //   },
    //   json: {
    //     "id_project": project_id
    //   },
    //   method: 'POST'
    // },
    // function(err, response, resbody) {
    //   if(response.statusCode === 200) {
    //     if (callback) {
    //       callback(resbody.token)
    //     }
    //   }
    // });
  }

  static sendMessageRaw(APIENDPOINT, token, project_id, msgJSON, request_id, callback) {
    request(
    {
      url: `${APIENDPOINT}/${project_id}/requests/${request_id}/messages`,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': token
      },
      json: msgJSON,
      method: 'POST'
    },
      function(err, res, resbody) {
        if (callback) {
          callback(err)
        }
      }
    );
  }

  sendMessage(msgJSON, request_id, callback) {
    console.log("mess:", msgJSON)
    console.log("request_id:", request_id)
    console.log("this.API_ENDPOINT:", this.API_ENDPOINT)
    console.log("this.projectId:", this.projectId)
    console.log("this.token:", this.token)
    TiledeskClient.sendMessageRaw(this.API_ENDPOINT, this.token, this.projectId, msgJSON, request_id, callback);
  }

  // sendMessage(msg, request_id, callback) {
  //   console.log("mess:", msg)
  //   console.log("request_id:", request_id)
  //   console.log("this.API_ENDPOINT:", this.API_ENDPOINT)
  //   console.log("this.projectId:", this.projectId)
  //   console.log("this.token:", this.token)
  //   request(
  //   {
  //     url: `${this.API_ENDPOINT}/${this.projectId}/requests/${request_id}/messages`,
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
  // }

}

module.exports = { TiledeskClient };