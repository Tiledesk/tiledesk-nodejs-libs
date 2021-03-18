/* 
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
   * @param {Object} options.APIKEY Mandatory. Tiledesk APIKEY
   * @param {Object} options.APIURL Optional. Tiledesk server api endpoint
   * @param {Object} options.project_id Optional. Tiledesk server api endpoint
   * @param {Object} options.log Optional. If true requests are logged
   * 
   * 
   */
  static DEFAULT_API_ENDPOINT = "https://api.tiledesk.com/v2";
  // static BETA_API_ENDPOINT = "https://tiledesk-server-pre.herokuapp.com";
  static ASSIGNED_STATUS = 200;
  static UNASSIGNED_STATUS = 100;

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

    if (options && options.project_id) {
      this.project_id = options.project_id
    }

    this.log = false;
    if (options && options.log) {
      this.log = options.log;
    }

    // this.projectId = options.projectId
    // this.token = TiledeskClient.fixToken(options.token);
    
  }

  static fixToken(token) {
    if (token.startsWith('JWT ')) {
      return token
    }
    else {
      return 'JWT ' + token
    }
  }

  // curl -v -X POST -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 -d '{"name":"testprj"}' https://api.tiledesk.com/v2/projects

  createProject(project_id, token, callback) {
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/projects/${project_id}`
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

  getProjectSettings(projectId, token, callback) {
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
      //   if (callback) {
      //     callback(null, resbody)
      //   }
      // }
      // else if (callback) {
      //   const error_msg = "getProjectSettings. Status code: " + response.statusCode
      //   callback(error_msg, null)
      // }

      // if (response.statusCode == 200) {
      //   callback(null, resbody)
      // }
      // else {
      //   const error_msg = "getProjectSettings. Status code: " + response.statusCode
      //   callback(error_msg, null)
      // }
    }, this.log);
  }

  updateRequestProperties(request_id, properties, token, callback, options) {
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    var URL = `${this.APIURL}/${project_id}/requests/${request_id}`
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

        // if (callback) {
        //   callback(err)
        // }
      }, this.log
    );
  }

  updateRequestAttributes(request_id, attributes, token, callback, options) {
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    var URL = `${this.APIURL}/${project_id}/requests/${request_id}/attributes`
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

        // if (callback) {
        //   callback(err)
        // }
      }, this.log
    );
  }

  getProjectUser(user_id, token, callback, options) {
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/${project_id}/project_users/users/${user_id}`
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
        
        // if (resbody && resbody[0]) {
        //   if (callback) {
        //     callback(err, resbody[0])
        //   }
        // }
        // else {
        //   if (callback) {
        //     callback(err, null)
        //   }
        // }
      }, this.log
    );
  }

  updateProjectUserCurrentlyLoggedIn(values, token, callback, options) {
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/${project_id}/project_users/`
    const HTTPREQUEST = {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: values,
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

  updateProjectUserAvailable(project_user_id, user_available, token, callback, options) {
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/${project_id}/project_users/${project_user_id}`
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

  updateProjectUserAttributes(project_user_id, attributes, token, callback, options) {
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/${project_id}/project_users/${project_user_id}`
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

  getRequests(limit, status, token, callback, options) {
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    // direction = 1 => oldest must be served first
    // const URL = `${this.API_ENDPOINT}/${project_id}/requests?status=${status}&limit=${limit}&direction=1`
    let url = new URL(`${this.APIURL}/${project_id}/requests`)
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

  updateRequestParticipants(request_id, participants, token, callback, options) {
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.APIURL}/${project_id}/requests/${request_id}/participants`
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

  getWidgetSettings(project_id, callback) {
    const HTTPREQUEST = {
      url: `${this.APIURL}/${project_id}/widgets`,
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

  openNow(project_id, callback) {
    // const jwt_token = TiledeskClient.fixToken(token)
    const url = `${this.APIURL}/projects/${project_id}/isopen`
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
  
  anonymousAuthentication(project_id, callback) {
    const HTTPREQUEST = {
      url: `${this.APIURL}/auth/signinAnonymously`,
      headers: {
        'Content-Type' : 'application/json'
      },
      json: {
        "id_project": project_id
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

  sendMessage(request_id, msgJSON, token, callback, options) {
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const url = `${this.APIURL}/${project_id}/requests/${request_id}/messages`;
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

  fireEvent(event, token, callback, options) {
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const HTTPREQUEST = {
      url: `${this.APIURL}/${project_id}/events`,
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
  
  updateLeadEmailFullname(lead_id, email, fullname, token, callback, options) {
    if (!this.lead_id) {
      throw new Error('options.lead_id can NOT be empty.');
    }
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
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

  updateRequest(request_id, properties, attributes, token, callback, options) {
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
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

  updateDepartment(request_id, dep_id, token, callback, options) {
    if (!token) {
      throw new Error('token can NOT be null.');
    }
    let project_id;
    if (options && options.project_id) {
      project_id = options.project_id
    }
    else if (this.project_id) {
      project_id = this.project_id
    }
    else {
      throw new Error('project_id can NOT be null.');
    }
    const jwt_token = TiledeskClient.fixToken(token)
    const HTTPREQUEST = {
      url: `${this.APIURL}/${projectId}/requests/${request_id}/departments`,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: {
        departmentid: dep_id
      },
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