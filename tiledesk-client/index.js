/* 
    Andrea Sponziello - (c) Tiledesk.com
*/

const request = require('request')

/**
 * This class is a NodeJS stub for Tiledesk's REST APIs
 */
class TiledeskClient {

  static DEFAULT_API_ENDPOINT = "https://api.tiledesk.com/v2";
  static ASSIGNED_STATUS = 200;
  static UNASSIGNED_STATUS = 100;

  /**
   * Constructor for TiledeskClient object
   *
   * @example
   * const { TiledeskClient } = require('tiledesk-client');
   * const tdclient = new TiledeskClient({APIKEY: 'THE_API_KEY'});
   * const tdclient = new TiledeskClient({APIKEY: 'THE_API_KEY', APIURL: 'SELF_HOSTED_INSTANCE_ENDPOINT'});
   * 
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.APIKEY Mandatory. Tiledesk APIKEY
   * @param {Object} options.APIURL Optional. Tiledesk server API endpoint
   * @param {Object} options.projectId Optional. Tiledesk projectId. Will be used in each call on project's APIs.
   * @param {Object} options.token Optional. Tiledesk authentication token. Will be used in each call on project's APIs.
   * @param {Object} options.log Optional. If true requests are logged
   * 
   */
  constructor(options) {
    if (!options.APIKEY) {
      throw new Error('APIKEY can NOT be empty.');
    }
    else {
      this.APIKEY = options.APIKEY;
    }
    // if (!options.token) {
    //   throw new Error('token can NOT be empty.');
    // }

    if (options && options.APIURL) {
      this.APIURL = options.APIURL
    }
    else {
      this.APIURL = TiledeskClient.DEFAULT_API_ENDPOINT;
    }

    if (options && options.projectId) {
      this.projectId = options.projectId;
    }

    if (options && options.token) {
      this.token = options.token;
    }

    this.log = false;
    if (options && options.log) {
      this.log = options.log;
    }
  }

  static fixToken(token) {
    if (token.startsWith('JWT ')) {
      return token
    }
    else {
      return 'JWT ' + token
    }
  }

  createProject(projectId, token, callback) {
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/projects/${projectId}`
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: true,
      method: 'GET'
    };
    TiledeskClient.myrequest(HTTPREQUEST,
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
         callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
      }

      // if (response.statusCode == 200) {
      //   callback(null, resbody)
      // }
      // else {
      //   const error_msg = "getProjectSettings. Status code: " + response.statusCode
      //   callback(error_msg, null)
      // }
    }, this. log);
  }

  /**
   * Returns the project's JSON configuration
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - <b>token</b> - the token for this request. Overrides instance token (if) provided in constructor.
   * <br><b>projectId</b> - The projectId for this request. Overrides instance projectId (if) provided in constructor.
   */
  getProjectSettings(callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/projects/${projectId}`
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: true,
      method: 'GET'
    };
    TiledeskClient.myrequest(HTTPREQUEST,
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
         callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
      }
    }, this.log);
  }

  /**
   * Updates the request's properties
   * @param {string} request_id - The request ID
   * @param {Object} properties - The request properties to update.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - <b>token</b> - the token for this request. Overrides instance token (if) provided in constructor.
   * <br><b>projectId</b> - The projectId for this request. Overrides instance projectId (if) provided in constructor.
   */
  updateRequestProperties(request_id, properties, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    var URL = `${this.APIURL}/${projectId}/requests/${request_id}`
    data = properties;
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: data,
      method: 'PATCH'
      };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
           callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  /**
   * Updates the request's attributes
   * @param {string} request_id - The request ID
   * @param {Object} attributes - The request attributes to update.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - <b>token</b> - the token for this request. Overrides instance token (if) provided in constructor.
   * <br><b>projectId</b> - The projectId for this request. Overrides instance projectId (if) provided in constructor.
   */
  updateRequestAttributes(request_id, attributes, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    var URL = `${this.APIURL}/${projectId}/requests/${request_id}/attributes`
    var data = attributes;
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: data,
      method: 'PATCH'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
           callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  /**
   * Returns a project's User (aka Teammate, is a User invited on a project, with additional properties and a spcific project-userId)
   * @param {string} user_id - The Teammate ID. Is the specific ID for this user on this project
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - <b>token</b> - the token for this request. Overrides instance token (if) provided in constructor.
   * <br><b>projectId</b> - The projectId for this request. Overrides instance projectId (if) provided in constructor.
   */
  getProjectUser(user_id, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/${projectId}/project_users/users/${user_id}`
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: true,
      method: 'GET'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
          callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  /**
   * Updates the authenticated Teammate's (projectUser). The teammate must be invited to the specified project for the update operation taking success.
   * @param {Object} properties - The properties to update. Only the provided properties will be updated, the other properties will stay unchanged.<br>
   * <b>role {string}</b> - The teammate role. Permitted values: 'admin', 'agent'.
   * <br><b>user_available {boolean}</b> - The teammate availability. 'true' for available, 'false' for unavailable.
   * <br><b>max_served_chat {number}</b> - The number of concurrent chats the teammate can take at once.
   * <br><b>attributes {Object}</b> - The teammate custom attributes.
   * <br><b>settings {Object}</b> - The teammate settings.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - <b>token</b> - the token for this request. Overrides instance token (if) provided in constructor.
   * <br><b>projectId</b> - The projectId for this request. Overrides instance projectId (if) provided in constructor.
   */
  updateProjectUserCurrentlyLoggedIn(properties, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/${projectId}/project_users/`
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: properties,
      method: 'PUT'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
          callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  /**
   * Updates the Teammate's (projectUser) by ProjectUser's ID. It requires admin role.
   * @param {string} project_user_id - The teammate ID.
   * @param {Object} properties - The properties to update. Only the provided properties will be updated, the other properties will stay unchanged.<br>
   * <b>role {string}</b> - The teammate role. Permitted values: 'admin', 'agent'.
   * <br><b>user_available {boolean}</b> - The teammate availability. 'true' for available, 'false' for unavailable.
   * <br><b>max_served_chat {number}</b> - The number of concurrent chats the teammate can take at once.
   * <br><b>attributes {Object}</b> - The teammate custom attributes.
   * <br><b>settings {Object}</b> - The teammate settings.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - <b>token</b> - the token for this request. Overrides instance token (if) provided in constructor.
   * <br><b>projectId</b> - The projectId for this request. Overrides instance projectId (if) provided in constructor.
   */
   updateProjectUser(project_user_id, properties, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/${projectId}/project_users/${project_user_id}`
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: properties,
      method: 'PUT'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
          callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  /**
   * Only updates the available status for the specified Teammate. It requires admin role.
   * @param {string} project_user_id - The teammate ID.
   * @param {boolean} user_available - The teammate availability. 'true' for available, 'false' for unavailable.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - <b>token</b> - the token for this request. Overrides instance token (if) provided in constructor.
   * <br><b>projectId</b> - The projectId for this request. Overrides instance projectId (if) provided in constructor.
   */
  updateProjectUserAvailable(project_user_id, user_available, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/${projectId}/project_users/${project_user_id}`
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: {
        user_available: user_available
      },
      method: 'PUT'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
          callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }

        // if (callback) {
        //   callback(err, resbody)
        // }
      }, this.log
    );
  }

  /**
   * Only updates the attributes for the specified Teammate. It requires admin role.
   * @param {string} project_user_id - The teammate ID.
   * @param {Object} attributes - The teammate custom attributes.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - <b>token</b> - the token for this request. Overrides instance token (if) provided in constructor.
   * <br><b>projectId</b> - The projectId for this request. Overrides instance projectId (if) provided in constructor.
   */
  updateProjectUserAttributes(project_user_id, attributes, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/${projectId}/project_users/${project_user_id}`
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: {
        attributes: attributes
      },
      method: 'PUT'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
          callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  getRequests(limit, status, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    // direction = 1 => oldest must be served first
    // const URL = `${this.API_ENDPOINT}/${projectId}/requests?status=${status}&limit=${limit}&direction=1`
    let url = new URL(`${this.APIURL}/${projectId}/requests`)
    url.searchParams.append("status", status);
    url.searchParams.append("limit", limit);
    url.searchParams.append("direction", 1);
    if (options && options.additional_params) {
      for (let key in options.additional_params) {
        url.searchParams.append(key, options.additional_params[key]);
      }
    }
    // console.log("URL", url.href);
    const HTTPREQUEST = {
      url: url.href,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: true,
      method: 'GET'
    }
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
          callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }

        // if (resbody && resbody.requests) {
        //   if (callback) {
        //     callback(err, resbody.requests)
        //   }
        // }
        // else {
        //   // throw
        //   console.log("Error getting requests. Error:", err, " URL", URL, " token:", jwt_token, " Body:", resbody)
        // }

      }, this.log
    );
  }

  getRequestById(request_id, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/${projectId}/requests/${request_id}`
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: true,
      method: 'GET'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  updateRequestParticipants(request_id, participants, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/${projectId}/requests/${request_id}/participants`
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: participants,
      method: 'PUT'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
          callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  getWidgetSettings(callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const HTTPREQUEST = {
      url: `${this.APIURL}/${projectId}/widgets`,
      method: 'GET',
      json: true
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  openNow(callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const url = `${this.APIURL}/projects/${projectId}/isopen`
    const HTTPREQUEST = {
      url: url,
      headers: {
       'Content-Type' : 'application/json'
       //  'Authorization': jwt_token
      },
      method: 'GET',
      json: true
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
            if (callback) {
              callback(null, resbody)
            }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  static getErr(err, request, response, resbody) {
    let res_err = {}
    res_err.tiledesk_err = resbody;
    res_err.http_err = err;
    res_err.http_request = request;
    return res_err;
  }
  
  anonymousAuthentication(projectId, callback) {
    const HTTPREQUEST = {
      url: `${this.APIURL}/auth/signinAnonymously`,
      headers: {
        'Content-Type' : 'application/json'
      },
      json: {
        "id_project": projectId
      },
      method: 'POST'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        // resbody example:
        // {
        //   "success": true,
        //   "token": "JWT eyJ...",
        //   "user": {
        //       "firstname": "Guest",
        //       "id": "20bb30db-b677-...",
        //       "fullName": "Guest "
        //   }
        // }
        if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }

        // if (callback) {
        //   callback(err, response, resbody)
        // }
      }, this.log
    );
  }

  customAuthentication(token, callback) {
    const jwt_token = TiledeskClient.fixToken(token)
    const HTTPREQUEST = {
      url: `${this.APIURL}/auth/signinWithCustomToken`,
      headers: {
        'Authorization' : jwt_token
      },
      json: true,
      method: 'POST'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }

        // if (callback) {
        //   callback(err, response, resbody)
        // }
      }, this.log
    );
  }

  authEmailPassword(email, password, callback) {
    const HTTPREQUEST = {
      url: `${this.APIURL}/auth/signin`,
      headers: {
        'Content-Type' : 'application/json'
      },
      json: {
        email: email,
        password: password
      },
      method: 'POST'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }

        // if (callback) {
        //   callback(err, response, resbody)
        // }
      }, this.log
    );
  }

  /** Send a message to a support conversation. TODO: RENAME IN SEND-SUPPORT-MESSAGE  */
  sendMessage(request_id, msgJSON, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const url = `${this.APIURL}/${projectId}/requests/${request_id}/messages`;
    const HTTPREQUEST = {
      url: url,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: msgJSON,
      method: 'POST'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  /** Sends a message to a direct/group conversation. TODO: RENAME IN SEND-CHAT-MESSAGE */
  sendDirectMessage(msgJSON, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const url = `${this.APIURL}/${projectId}/messages`;
    const HTTPREQUEST = {
      url: url,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: msgJSON,
      method: 'POST'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (err) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
        else if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  fireEvent(event, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const HTTPREQUEST = {
      url: `${this.APIURL}/${projectId}/events`,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: event,
      method: 'POST'
   };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
          if (response.statusCode === 200) {
            if (callback) {
              callback(null, resbody)
            }
          }
          else if (callback) {
            callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
          }
      }, this.log
    );
  }
  
  // migrated from TiledeskChatbotUtil
  
  updateLeadEmailFullname(lead_id, email, fullname, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token);
    // if (!this.lead_id) {
    //   throw new Error('options.lead_id can NOT be empty.');
    // }
    const HTTPREQUEST = {
      url: `${this.APIURL}/${projectId}/leads/${lead_id}`, // this.conversation.lead._id
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: {
        email: email,
        fullname: fullname
      },
      method: 'PUT'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  updateRequest(request_id, properties, attributes, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token);
    let URL = `${this.APIURL}/${projectId}/requests/${request_id}/attributes`
    let data = attributes
    if (properties) {
      URL = `${this.APIURL}/${projectId}/requests/${request_id}/`
      data = properties
    }
    
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: data,
      method: 'PATCH'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  /**
 * This callback type is called `resultCallback` and is provided as a return value by each API call.
 *
 * @callback resultCallback
 * @param {Object} result - the response body
 * @param {Object} error - the error if some occurs, otherwise null
 */

  /**
   * Updates the Request department
   * @param {string} request_id - The request ID
   * @param {string} dep_id - The new department ID
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - <b>token</b> - the token for this request. Overrides instance token (if) provided in constructor.
   * <br><b>projectId</b> - The projectId for this request. Overrides instance projectId (if) provided in constructor.
   * <br><b>nobot</b> - Optional. Defaults to <i>false</i>. If true ignores (if set) the bot in the Department.
   */
  updateRequestDepartment(request_id, dep_id, callback, options) {
    let token;
    if (options && options.token) {
      token = options.token;
    }
    else if (this.token) {
      token = this.token;
    }
    else {
      throw new Error('token can NOT be null.');
    }
    let projectId;
    if (options && options.projectId) {
      projectId = options.projectId;
    }
    else if (this.projectId) {
      projectId = this.projectId;
    }
    else {
      throw new Error('projectId can NOT be null.');
    }
    let nobot_option_defined = false;
    let nobot = false;
    if (options && options.nobot) {
      nobot = options.nobot;
      nobot_option_defined = true;
    }
    let data = {
      departmentid: dep_id
    }
    if (nobot_option_defined) {
      data['nobot'] = nobot;
    }
    const jwt_token = TiledeskClient.fixToken(token);
    const HTTPREQUEST = {
      url: `${this.APIURL}/${projectId}/requests/${request_id}/departments`,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: data,
      method: 'PUT'
    };
    request(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
      }, this.log
    );
  }

  static myrequest(options, callback, log) {
    if (log) {
      console.log("API:", options.url);
    }
    request(
      {
        url: options.url,
        headers: options.headers,
        json: options.json,
        method: options.method
      },
      function(err, res, resbody) {
        if (log) {
          console.log("** For url:", options.url);
          console.log("** Options:", options);
          console.log("** Err:", err);
          console.log("** Response headers:\n", res.headers);
          console.log("** Response body:\n", res.body);
        }
        if (callback) {
          callback(err, res, resbody);
        }
      }
    );
  }

}

module.exports = { TiledeskClient };