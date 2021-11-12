/* 
    Andrea Sponziello - (c) Tiledesk.com
*/

// const request = require('request');
let axios = require('axios');
const { v4: uuidv4 } = require('uuid');

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
   * @param {string} options.APIKEY Mandatory. Tiledesk APIKEY
   * @param {string} options.APIURL Optional. Tiledesk server API endpoint
   * @param {string} options.projectId Optional. Tiledesk projectId. Will be used in each call on project's APIs.
   * @param {string} options.token Optional. Tiledesk authentication token. Will be used in each call on project's APIs.
   * @param {boolean} options.log Optional. If true HTTP requests are logged
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

  /** Returns a new request ID for the specified Project.<br>
   * A request's ID has the format:<br>
   * <br>
   * <i>support-group-PROJECT_ID-UNIQUE_ID</i><br>
   * <br>
   * <i>UNIQUE_ID</i> MUST be unique in your Project. <b>This method always returns an <i>UUID</i> for the <i>UNIQUE_ID</i> component</b>.
   * 
   * @param {string} projectId - The project ID for the new request.
  */
  static newRequestId(projectId) {
    const request_id = 'support-group-' + projectId + '-' + uuidv4().replace(/-/g, '');
    return request_id;
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
      if (response.status === 200) {
        if (callback) {
         callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
      }

      // if (response.status == 200) {
      //   callback(null, resbody)
      // }
      // else {
      //   const error_msg = "getProjectSettings. Status code: " + response.status
      //   callback(error_msg, null)
      // }
    }, this. log);
  }

  /**
   * Returns the project's JSON configuration<br>
   * <a href='https://developer.tiledesk.com/apis/rest-api/projects#get-the-project-detail' target='_blank'>REST API</a>
   * 
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
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
      // json: true,
      method: 'GET'
    };
    TiledeskClient.myrequest(HTTPREQUEST,
    function(err, response, resbody) {
      if (response.status === 200) {
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
   * Updates the request's properties.<br>
   * <a href='https://developer.tiledesk.com/apis/rest-api/requests#update-a-request-by-request_id' target='_blank'>REST API</a>
   * 
   * @param {string} requestId - The request ID
   * @param {Object} properties - The request properties to update.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
  updateRequestProperties(requestId, properties, callback, options) {
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
    var URL = `${this.APIURL}/${projectId}/requests/${requestId}`
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
        if (response.status === 200) {
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
   * Updates the request's attributes.<br>
   * <a href='https://developer.tiledesk.com/apis/rest-api/requests#update-the-request-attributes' target='_blank'>REST API</a>
   * 
   * @param {string} requestId - The request ID
   * @param {Object} attributes - The request attributes to update.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
  updateRequestAttributes(requestId, attributes, callback, options) {
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
    var URL = `${this.APIURL}/${projectId}/requests/${requestId}/attributes`
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
        if (response.status === 200) {
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
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
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
      // json: true,
      method: 'GET'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.status === 200) {
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
   * Updates the authenticated Teammate's (projectUser). The teammate must be invited to the specified project for the update operation taking success.<br>
   * <a href='https://developer.tiledesk.com/apis/rest-api/team#update-the-current-logged-teammate' target='_blank'>REST API</a>
   * 
   * @param {Object} properties - The properties to update. Only the provided properties will be updated, the other properties will stay unchanged.
   * @param {string} properties.role - The teammate role. Permitted values: 'admin', 'agent'.
   * @param {boolean} properties.user_available - The teammate availability. 'true' for available, 'false' for unavailable.
   * @param {number} properties.max_served_chat - The number of concurrent chats the teammate can take at once.
   * @param {Object} properties.attributes - The teammate custom attributes.
   * @param {Object} properties.settings - The teammate settings.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
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
        if (response.status === 200) {
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
   * @param {string} projectUserId - The teammate ID.
   * @param {Object} properties - The properties to update. Only the provided properties will be updated, the other properties will stay unchanged.<br>
   * <b>role {string}</b> - The teammate role. Permitted values: 'admin', 'agent'.
   * <br><b>user_available {boolean}</b> - The teammate availability. 'true' for available, 'false' for unavailable.
   * <br><b>max_served_chat {number}</b> - The number of concurrent chats the teammate can take at once.
   * <br><b>attributes {Object}</b> - The teammate custom attributes.
   * <br><b>settings {Object}</b> - The teammate settings.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
   updateProjectUser(projectUserId, properties, callback, options) {
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
    const URL = `${this.APIURL}/${projectId}/project_users/${projectUserId}`
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
        if (response.status === 200) {
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
   * @param {string} projectUserId - The teammate ID.
   * @param {boolean} userAvailable - The teammate availability. 'true' for available, 'false' for unavailable.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
  updateProjectUserAvailable(projectUserId, userAvailable, callback, options) {
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
    const URL = `${this.APIURL}/${projectId}/project_users/${projectUserId}`
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: {
        user_available: userAvailable
      },
      method: 'PUT'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.status === 200) {
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
   * @param {string} projectUserId - The teammate ID.
   * @param {Object} attributes - The teammate custom attributes.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
  updateProjectUserAttributes(projectUserId, attributes, callback, options) {
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
    const URL = `${this.APIURL}/${projectId}/project_users/${projectUserId}`
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
        if (response.status === 200) {
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

  /* DEPRECATED, use getAllRequests */
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
      // json: true,
      method: 'GET'
    }
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.status === 200) {
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

  /**
   * @typedef queryParams
   * @type {Object}
   * @property {string} sortField - what field to sort the results by. Default field is 'createdAt'
   * @property {string} direction - sort direction: 1 (asc) or -1 (desc). Return the results in ascending (1) or descending (-1) order. Defaults to desc (-1)
   * @property {number} page - What page of results to fetch. Defaults to first page.
   * @property {number} limit - Specifies the maximum number of results to be returned. Default is 40 rows
   * @property {string} full_text - Executes a fulltext search query
   * @property {string} status - Filters by request status. Values: 100 for unserved requests, 200 for served requests, 1000 for closed requests, "all" to retrieve all statuses. Default value is status < 1000 so it returns all the opened requests.
   * @property {string} dept_id - Filters by department's ID
   * @property {string} lead - Filters by lead's ID
   * @property {array} participant - Filters by participants (agent or bot)
   */

  /**
   * Queries project's requests.
   * @param {queryParams} queryParams - The query parameters.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
  getAllRequests(queryParams, callback, options) {
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
    if (queryParams == null) {
      queryParams = {}
    }
    const jwt_token = TiledeskClient.fixToken(token)
    // direction = 1 => oldest must be served first
    // const URL = `${this.API_ENDPOINT}/${projectId}/requests?status=${status}&limit=${limit}&direction=1`
    let url = new URL(`${this.APIURL}/${projectId}/requests`);
    for (const [key, value] of Object.entries(queryParams)) {
      url.searchParams.append(key, value);
    }
    // url.searchParams.append("status", status);
    // url.searchParams.append("limit", limit);
    // url.searchParams.append("direction", 1);
    // if (options && options.additional_params) {
    //   for (let key in options.additional_params) {
    //     url.searchParams.append(key, options.additional_params[key]);
    //   }
    // }
    // console.log("URL", url.href);
    const HTTPREQUEST = {
      url: url.href,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      // json: true,
      method: 'GET'
    }
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.status === 200) {
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

  /**
   * Gets a reuqest by ID.
   * @param {string} requestId - The request's ID.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
  getRequestById(requestId, callback, options) {
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
    const URL = `${this.APIURL}/${projectId}/requests/${requestId}`
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      // json: true,
      method: 'GET'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.status === 200) {
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
   * Updates the request's partecipants.<br>
   * <a href='https://developer.tiledesk.com/apis/rest-api/requests#set-the-request-participants' target='_blank'>REST API</a>
   * @param {queryParams} requestId - The request's ID.
   * @param {array} participants - The participants (agent or bot) identifiers array
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
  updateRequestParticipants(requestId, participants, callback, options) {
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
    const URL = `${this.APIURL}/${projectId}/requests/${requestId}/participants`
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
        if (response.status === 200) {
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
   * Returns the Widget settings for the selected project.
   * 
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
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
      // json: true
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.status === 200) {
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
   * Returns the current opening status based on Opening Hours.
   * 
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
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
      // json: true
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.status === 200) {
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
  
  /** Returns an anonymous user token to connect to the services.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
  anonymousAuthentication(callback, options) {
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
        if (response.status === 200) {
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

  customAuthentication(token, callback) {
    const jwt_token = TiledeskClient.fixToken(token)
    const HTTPREQUEST = {
      url: `${this.APIURL}/auth/signinWithCustomToken`,
      headers: {
        'Authorization' : jwt_token
      },
      // json: true,
      method: 'POST'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.status === 200) {
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
        if (response.status === 200) {
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

  /**
   * Sends a message to a support conversation.<br>
   * <a href='' target='_blank'>REST API</a>
   * 
   * @param {string} requestId - The request's ID.
   * @param {chatMessage} message - The chat21's message JSON object.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
  sendSupportMessage(requestId, message, callback, options) {
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
    const url = `${this.APIURL}/${projectId}/requests/${requestId}/messages`;
    const HTTPREQUEST = {
      url: url,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: message,
      method: 'POST'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (response.status === 200) {
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
   * The Chat21 message format. More on <a href='https://developer.tiledesk.com/widget/advanced/widget-json-protocol' target='_blank'>messages format (Review this link)</a>.
   * @typedef chatMessage
   * @type {Object}
   * @property {string} senderFullname - The sender full name
   * @property {string} recipient - The message recipiet's ID
   * @property {number} text - The message's text
   * @property {number} type - The message type. Allowed types are 'text' (default), 'image', 'frame'
   * @property {Object} metadata - The message's metadata. Some type as 'image' or 'frame' need metadata.
   * @property {Object} attributes - Custom attributes attacched to this message.
   */

  /**
   * Sends a message to a direct/group conversation.<br>
   * <a href='' target='_blank'>REST API</a>
   * 
   * @param {chatMessage} message - The chat21's message JSON object.
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   */
  sendChatMessage(message, callback, options) {
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
      json: message,
      method: 'POST'
    };
    TiledeskClient.myrequest(
      HTTPREQUEST,
      function(err, response, resbody) {
        if (err) {
          callback(TiledeskClient.getErr(err, HTTPREQUEST, response, resbody), null);
        }
        else if (response.status === 200) {
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
          if (response.status === 200) {
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
        if (response.status === 200) {
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
        if (response.status === 200) {
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
   * @param {string} requestId - The request ID
   * @param {string} depId - The new department ID
   * @param {resultCallback} callback - The callback that handles the response.
   * @param {Object} options - Optional configuration.
   * @param {string} options.token - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.projectId - The token for this request. Overrides instance token (if) provided in constructor.
   * @param {string} options.nobot - Optional. Defaults to <i>false</i>. If true ignores (if set) the bot in the Department.
   */
  updateRequestDepartment(requestId, depId, callback, options) {
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
      departmentid: depId
    }
    if (nobot_option_defined) {
      data['nobot'] = nobot;
    }
    const jwt_token = TiledeskClient.fixToken(token);
    const HTTPREQUEST = {
      url: `${this.APIURL}/${projectId}/requests/${requestId}/departments`,
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
        if (response.status === 200) {
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
      console.log("API URL:", options.url);
      console.log("** Options:", options);
    }
    axios(
      {
        url: options.url,
        method: options.method,
        data: options.json,
        headers: options.headers
      })
    .then(function (res) {
      if (log) {
        console.log("Response for url:", options.url);
        console.log("Response headers:\n", res.headers);
        console.log("******** Response for url:", res);
        console.log("Response body:\n", res.data);
      }
      if (callback) {
          callback(null, res, res.data);
      }
    })
    .catch(function (error) {
      console.error("Axios call error:", error);
      if (callback) {
          callback(error, null, null);
      }
    });


    // request(
    //   {
    //     url: options.url,
    //     method: options.method,
    //     json: options.json,
    //     headers: options.headers
    //   },
    //   function(err, res, resbody) {
    //     if (log) {
    //       console.log("** For url:", options.url);
    //       console.log("** Options:", options);
    //       console.log("** Err:", err);
    //       console.log("** Response headers:\n", res.headers);
    //       console.log("** Response body:\n", res.body);
    //     }
    //     if (callback) {
    //       callback(err, res, resbody);
    //     }
    //   }
    // );
  }

}

module.exports = { TiledeskClient };