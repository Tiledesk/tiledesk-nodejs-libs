/* 
    ver 0.7.1
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

    if (options && options.API_ENDPOINT) {
      this.API_ENDPOINT = options.API_ENDPOINT
    }
    else {
      this.API_ENDPOINT = TiledeskClient.DEFAULT_API_ENDPOINT;
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
    // TiledeskClient.createProjectRaw(TiledeskClient.DEFAULT_API_ENDPOINT, callback);
    
    const jwt_token = TiledeskClient.fixToken(token)
    const URL = `${this.API_ENDPOINT}/projects/${project_id}`
    TiledeskClient.myrequest({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: true,
      method: 'GET'
    },
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
         callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
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
    const URL = `${this.API_ENDPOINT}/projects/${projectId}`
    console.log("getProjectSettings URL:", URL);
    // console.log("getProjectSettings token:", _token);
    
    TiledeskClient.myrequest({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: true,
      method: 'GET'
    },
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
         callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
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

  // static getProjectSettingsRaw(API_ENDPOINT, project_id, token, callback) {
  //   const _token = TiledeskClient.fixToken(token)
  //   const URL = `${API_ENDPOINT}/projects/${project_id}`
  //   // console.log("getProjectSettings URL:", URL);
  //   // console.log("getProjectSettings token:", _token);
  //   TiledeskClient.myrequest({
  //     url: URL,
  //     headers: {
  //       'Content-Type' : 'application/json',
  //       'Authorization': _token
  //     },
  //     json: true,
  //     method: 'GET'
  //   },
  //   function(err, response, resbody) {
  //     if (response.statusCode === 200) {
  //       if (callback) {
  //        callback(null, resbody)
  //       }
  //     }
  //     else if (callback) {
  //       callback(TiledeskClient.getErr(err, response, resbody), null);
  //     }

  //     // if (response.statusCode == 200) {
  //     //   callback(null, resbody)
  //     // }
  //     // else {
  //     //   const error_msg = "getProjectSettings. Status code: " + response.statusCode
  //     //   callback(error_msg, null)
  //     // }
  //   });
  // }

  // static getAllProjectUsersRaw(API_ENDPOINT, project_id, departmentid, token, callback) {
  //   const _token = TiledeskClient.fixToken(token)
  //   const URL = `${API_ENDPOINT}/${project_id}/departments/${departmentid}/operators?disableWebHookCall=true`
  //   console.log("getAllProjectUsers URL:", URL);
  //   TiledeskClient.myrequest({
  //     url: URL,
  //     headers: {
  //       'Content-Type' : 'application/json',
  //       'Authorization': _token
  //     },
  //     json: true,
  //     method: 'GET'
  //   },
  //   function(err, response, resbody) {
  //     if (response.statusCode === 200) {
  //       if (callback) {
  //        callback(null, resbody)
  //       }
  //     }
  //     else if (callback) {
  //       callback(TiledeskClient.getErr(err, response, resbody), null);
  //     }

  //     // callback(err, resbody)
  //   });
  // }

  getAllProjectUsers(project_id, departmentid, token, callback) {
    const _token = TiledeskClient.fixToken(token)
    const URL = `${this.API_ENDPOINT}/${project_id}/departments/${departmentid}/operators?disableWebHookCall=true`
    TiledeskClient.myrequest({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': _token
      },
      json: true,
      method: 'GET'
    },
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
         callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
      }

      // callback(err, resbody)
    }, this.log);
  }

  // static updateRequestPropertiesRaw(API_ENDPOINT, request_id, project_id, properties, token, callback) {
  //   const jwt_token = TiledeskClient.fixToken(token)
  //   var URL = `${API_ENDPOINT}/${project_id}/requests/${request_id}`
  //   data = properties
  //   console.log("updating request attributes URL:", URL)
  //   console.log("updating request attributes jwt_token:", jwt_token)
  //   TiledeskClient.myrequest({
  //     url: URL,
  //     headers: {
  //       'Content-Type' : 'application/json',
  //       'Authorization': jwt_token
  //     },
  //     json: data,
  //     method: 'PATCH'
  //     },
  //     function(err, response, resbody) {
  //       if (response.statusCode === 200) {
  //         if (callback) {
  //          callback(null, resbody)
  //         }
  //       }
  //       else if (callback) {
  //         callback(TiledeskClient.getErr(err, response, resbody), null);
  //       }

  //       // if (callback) {
  //       //   callback(err)
  //       // }
  //     }
  //   );
  // }

  updateRequestProperties(project_id, request_id, properties, token, callback) {
    const jwt_token = TiledeskClient.fixToken(token)
    var URL = `${this.API_ENDPOINT}/${project_id}/requests/${request_id}`
    data = properties
    TiledeskClient.myrequest({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: data,
      method: 'PATCH'
      },
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
           callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, response, resbody), null);
        }

        // if (callback) {
        //   callback(err)
        // }
      }, this.log);
  }

  // static updateRequestAttributesRaw(API_ENDPOINT, request_id, project_id, attributes, token, callback) {
  //   const jwt_token = TiledeskClient.fixToken(token)
  //   var URL = `${API_ENDPOINT}/${project_id}/requests/${request_id}/attributes`
  //   var data = attributes
  //   console.log("updating request attributes URL:", URL)
  //   console.log("updating request attributes jwt_token:", jwt_token)
  //   TiledeskClient.myrequest({
  //     url: URL,
  //     headers: {
  //       'Content-Type' : 'application/json',
  //       'Authorization': jwt_token
  //     },
  //     json: data,
  //     method: 'PATCH'
  //     },
  //     function(err, response, resbody) {
  //       if (response.statusCode === 200) {
  //         if (callback) {
  //          callback(null, resbody)
  //         }
  //       }
  //       else if (callback) {
  //         callback(TiledeskClient.getErr(err, response, resbody), null);
  //       }

  //       // if (callback) {
  //       //   callback(err)
  //       // }
  //     }
  //   );
  // }

  static updateRequestAttributes(project_id, request_id, attributes, token, callback) {
    const jwt_token = TiledeskClient.fixToken(token)
    var URL = `${this.API_ENDPOINT}/${project_id}/requests/${request_id}/attributes`
    var data = attributes
    TiledeskClient.myrequest({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: data,
      method: 'PATCH'
      },
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
           callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, response, resbody), null);
        }

        // if (callback) {
        //   callback(err)
        // }
      }, this.log);
  }

  // static getProjectUserRaw(APIENDPOINT, project_id, user_id, token, callback) {
  //   const jwt_token = 'JWT ' + token
  //   const URL = `${APIENDPOINT}/${project_id}/project_users/users/${user_id}`
  //   console.log("getProjectUser.URL: ", URL);
  //   console.log("with token: ", jwt_token)
  //   TiledeskClient.myrequest({
  //     url: URL,
  //     headers: {
  //       'Content-Type' : 'application/json',
  //       'Authorization': jwt_token
  //     },
  //     json: true,
  //     method: 'GET'
  //   },
  //   function(err, response, resbody) {
  //     if (response.statusCode === 200) {
  //       if (callback) {
  //        callback(null, resbody)
  //       }
  //     }
  //     else if (callback) {
  //       callback(TiledeskClient.getErr(err, response, resbody), null);
  //     }
      
  //     // if (resbody && resbody[0]) {
  //     //   if (callback) {
  //     //     callback(err, resbody[0])
  //     //   }
  //     // }
  //     // else {
  //     //   if (callback) {
  //     //     callback(err, null)
  //     //   }
  //     // }
  //   });
  // }

  getProjectUser(project_id, user_id, token, callback) {
    const jwt_token = 'JWT ' + token
    const URL = `${this.API_ENDPOINT}/${project_id}/project_users/users/${user_id}`
    TiledeskClient.myrequest({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: true,
      method: 'GET'
    },
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
         callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
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
    }, this.log);
  }

  // static updateProjectUserAvailableRaw(APIENDPOINT, project_id, project_user_id, user_available, token, callback) {
  //   const jwt_token = 'JWT ' + token
  //   const URL = `${APIENDPOINT}/${project_id}/project_users/${project_user_id}`
  //   console.log("setProjectUserAvailable. URL:", URL);
  //   console.log("with token: ", jwt_token)
  //   TiledeskClient.myrequest({
  //     url: URL,
  //     headers: {
  //       'Content-Type' : 'application/json',
  //       'Authorization': jwt_token
  //     },
  //     json: {
  //       user_available: user_available
  //     },
  //     method: 'PUT'
  //   },
  //   function(err, response, resbody) {
  //     if (response.statusCode === 200) {
  //       if (callback) {
  //        callback(null, resbody)
  //       }
  //     }
  //     else if (callback) {
  //       callback(TiledeskClient.getErr(err, response, resbody), null);
  //     }

  //     // if (callback) {
  //     //   callback(err, resbody)
  //     // }
  //   });
  // }

  updateProjectUserAvailable(project_id, project_user_id, user_available, token, callback) {
    const jwt_token = 'JWT ' + token
    const URL = `${this.API_ENDPOINT}/${project_id}/project_users/${project_user_id}`
    TiledeskClient.myrequest({
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
      if (response.statusCode === 200) {
        if (callback) {
         callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
      }

      // if (callback) {
      //   callback(err, resbody)
      // }
    }, this.log);
  }

  // static updateProjectUserAttributesRaw(APIENDPOINT, project_id, project_user_id, attributes, token, callback) {
  //   const jwt_token = 'JWT ' + token
  //   const URL = `${APIENDPOINT}/${project_id}/project_users/${project_user_id}`
  //   console.log("setProjectUserAvailable. URL:", URL);
  //   console.log("with token: ", jwt_token)
  //   TiledeskClient.myrequest({
  //     url: URL,
  //     headers: {
  //       'Content-Type' : 'application/json',
  //       'Authorization': jwt_token
  //     },
  //     json: {
  //       attributes: attributes
  //     },
  //     method: 'PUT'
  //   },
  //   function(err, response, resbody) {
  //     if (response.statusCode === 200) {
  //       if (callback) {
  //        callback(null, resbody)
  //       }
  //     }
  //     else if (callback) {
  //       callback(TiledeskClient.getErr(err, response, resbody), null);
  //     }

  //     // if (callback) {
  //     //   callback(err, resbody)
  //     // }
  //   });
  // }

  updateProjectUserAttributes(project_id, project_user_id, attributes, token, callback) {
    const jwt_token = 'JWT ' + token
    const URL = `${this.API_ENDPOINT}/${project_id}/project_users/${project_user_id}`
    TiledeskClient.myrequest({
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
      if (response.statusCode === 200) {
        if (callback) {
         callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
      }

      // if (callback) {
      //   callback(err, resbody)
      // }
    }, this.log);
  }

  // static getRequestsRaw(APIENDPOINT, project_id, token, limit, status, callback) {
  //   const jwt_token = 'JWT ' + token
  //   // direction = 1 => oldest must be served first
  //   const URL = `${APIENDPOINT}/${project_id}/requests?status=${status}&limit=${limit}&direction=1`
  //   TiledeskClient.myrequest({
  //     url: URL,
  //     headers: {
  //       'Content-Type' : 'application/json',
  //       'Authorization': jwt_token
  //     },
  //     json: true,
  //     method: 'GET'
  //   },
  //   function(err, response, resbody) {
  //     if (response.statusCode === 200) {
  //       if (callback) {
  //        callback(null, resbody)
  //       }
  //     }
  //     else if (callback) {
  //       callback(TiledeskClient.getErr(err, response, resbody), null);
  //     }

  //     // if (resbody && resbody.requests) {
  //     //   if (callback) {
  //     //     callback(err, resbody.requests)
  //     //   }
  //     // }
  //     // else {
  //     //   // throw
  //     //   console.log("Error getting requests. Error:", err, " URL", URL, " token:", jwt_token, " Body:", resbody)
  //     // }

  //   });
  // }

  getRequests(project_id, limit, status, token, callback) {
    const jwt_token = 'JWT ' + token
    // direction = 1 => oldest must be served first
    const URL = `${this.API_ENDPOINT}/${project_id}/requests?status=${status}&limit=${limit}&direction=1`
    TiledeskClient.myrequest({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: true,
      method: 'GET'
    },
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
         callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
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

    }, this.log);
  }

  // static updateRequestParticipantsRaw(API_ENDPOINT, project_id, request_id, token, participants, callback) {
  //   const jwt_token = 'JWT ' + token
  //   const URL = `${API_ENDPOINT}/${project_id}/requests/${request_id}/participants`
  //   console.log("update request participant... URL:", URL);
  //   console.log("with token: ", jwt_token)
  //   TiledeskClient.myrequest({
  //     url: URL,
  //     headers: {
  //       'Content-Type' : 'application/json',
  //       'Authorization': jwt_token
  //     },
  //     json: participants,
  //     method: 'PUT'
  //   },
  //   function(err, response, resbody) {
  //     if (response.statusCode === 200) {
  //       if (callback) {
  //        callback(null, resbody)
  //       }
  //     }
  //     else if (callback) {
  //       callback(TiledeskClient.getErr(err, response, resbody), null);
  //     }
  //   });
  // }

  updateRequestParticipants(project_id, request_id, participants, token, callback) {
    const jwt_token = 'JWT ' + token
    const URL = `${this.API_ENDPOINT}/${project_id}/requests/${request_id}/participants`
    TiledeskClient.myrequest({
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': jwt_token
      },
      json: participants,
      method: 'PUT'
    },
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
         callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
      }
    }, this.log);
  }

  // static getWidgetSettingsRaw(APIENDPOINT, project_id, callback) {
  //   TiledeskClient.myrequest(
  //   {
  //     url: `${APIENDPOINT}/${project_id}/widgets`,
  //     method: 'GET',
  //     json: true
  //   },
  //   function(err, response, resbody) {
  //     if (response.statusCode === 200) {
  //       if (callback) {
  //         callback(null, resbody)
  //       }
  //     }
  //     else if (callback) {
  //       callback(TiledeskClient.getErr(err, response, resbody), null);
  //     }
  //   });
  // }

  getWidgetSettings(project_id, callback) {
    TiledeskClient.myrequest(
    {
      url: `${this.API_ENDPOINT}/${project_id}/widgets`,
      method: 'GET',
      json: true
    },
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
          callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null); 
      }
    }, this.log);
  }

  openNow(project_id, callback) {
    // const jwt_token = TiledeskClient.fixToken(token)
    const url = `${this.API_ENDPOINT}/projects/${project_id}/isopen`
    TiledeskClient.myrequest({
       url: url,
       headers: {
        'Content-Type' : 'application/json'
        //  'Authorization': jwt_token
       },
       method: 'GET',
       json: true
     },
     function(err, response, resbody) {
       if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
       }
       else if (callback) {
         callback(TiledeskClient.getErr(err, response, resbody), null);
       }
    }, this.log);
  }

  static getErr(err, response, resbody) {
    let res_err = {}
    res_err.tiledesk_err = resbody;
    res_err.http_err = err;
    return res_err;
  }

  // openNow(callback) {
  //   TiledeskClient.openNow(this.API_ENDPOINT, this.projectId, this.token, callback);
  // }
  
  static myrequest(options, callback, log) {
    if (log) {
      console.log("options.method:", options.method);
      console.log("options.url:", options.url);
      console.log("options.headers:", options.headers);
      console.log("options.json:", options.json);
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
            console.log("err:", err);
            console.log("Response headers:\n", res.headers);
            console.log("Response body:\n", res.body);
          }
          if (callback) {
            callback(err, res, resbody);
          }
        }
      );
  }

  // static anonymousAuthenticationRaw(API_ENDPOINT, project_id, callback) {
  //   // console.log("using project_id", project_id)
  //   TiledeskClient.myrequest({
  //     url: `${API_ENDPOINT}/auth/signinAnonymously`,
  //     headers: {
  //       'Content-Type' : 'application/json'
  //     },
  //     json: {
  //       "id_project": project_id
  //     },
  //     method: 'POST'
  //   },
  //   function(err, response, resbody) {
  //     if (response.statusCode === 200) {
  //       if (callback) {
  //         callback(null, resbody)
  //       }
  //     }
  //     else if (callback) {
  //       callback(TiledeskClient.getErr(err, response, resbody), null);
  //     }

  //     // if (callback) {
  //     //   callback(err, response, resbody)
  //     // }
  //   });
  // }

  anonymousAuthentication(project_id, callback) {
    TiledeskClient.myrequest({
      url: `${this.API_ENDPOINT}/auth/signinAnonymously`,
      headers: {
        'Content-Type' : 'application/json'
      },
      json: {
        "id_project": project_id
      },
      method: 'POST'
    },
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
          callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
      }

      // if (callback) {
      //   callback(err, response, resbody)
      // }
    }, this.log);
  }

  authEmailPassword(email, password, callback) {
    TiledeskClient.myrequest({
      url: `${this.API_ENDPOINT}/auth/signin`,
      headers: {
        'Content-Type' : 'application/json'
      },
      json: {
        email: email,
        password: password
      },
      method: 'POST'
    },
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
          callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
      }

      // if (callback) {
      //   callback(err, response, resbody)
      // }
    }, this.log);
  }

  // static anonymousAuthentication(project_id, callback) {
  //   TiledeskClient.anonymousAuthenticationRaw(TiledeskClient.DEFAULT_API_ENDPOINT, project_id, callback);
  // }

  // static sendMessageRaw(API_ENDPOINT, token, project_id, msgJSON, request_id, callback) {
  //   const url = `${API_ENDPOINT}/${project_id}/requests/${request_id}/messages`;
  //   TiledeskClient.myrequest(
  //   {
  //     url: url,
  //     headers: {
  //       'Content-Type' : 'application/json',
  //       'Authorization': token
  //     },
  //     json: msgJSON,
  //     method: 'POST'
  //   },
  //     function(err, response, resbody) {
  //       if (response.statusCode === 200) {
  //         if (callback) {
  //           callback(null, resbody)
  //         }
  //       }
  //       else if (callback) {
  //         callback(TiledeskClient.getErr(err, response, resbody), null);
  //       }
  //     }
  //   );
  // }

  sendMessage(project_id, request_id, msgJSON, token, callback) {
    const url = `${this.API_ENDPOINT}/${project_id}/requests/${request_id}/messages`;
    TiledeskClient.myrequest(
    {
      url: url,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': token
      },
      json: msgJSON,
      method: 'POST'
    },
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
          callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
      }
    }, this.log);
  }

  // sendMessage(msgJSON, request_id, callback) {
  //   TiledeskClient.sendMessageRaw(this.API_ENDPOINT, this.token, this.projectId, msgJSON, request_id, callback);
  // }

  // static fireEvent(APIENDPOINT, project_id, token, event, callback) {
  //   const jwt_token = TiledeskClient.fixToken(token)
  //   TiledeskClient.myrequest({
  //      url: `${APIENDPOINT}/${project_id}/events`,
  //      headers: {
  //        'Content-Type' : 'application/json',
  //        'Authorization': jwt_token
  //      },
  //      json: event,
  //      method: 'POST'
  //    },
  //    function(err, response, resbody) {
  //       if (response.statusCode === 200) {
  //         if (callback) {
  //           callback(null, resbody)
  //         }
  //       }
  //       else if (callback) {
  //         callback(TiledeskClient.getErr(err, response, resbody), null);
  //       }
  //     }
  //   );
  // }

  fireEvent(project_id, event, token, callback) {
    const jwt_token = TiledeskClient.fixToken(token)
    TiledeskClient.myrequest(
    {
       url: `${this.API_ENDPOINT}/${project_id}/events`,
       headers: {
         'Content-Type' : 'application/json',
         'Authorization': jwt_token
       },
       json: event,
       method: 'POST'
    },
    function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, response, resbody), null);
        }
    }, this.log);
  }

  // fireEvent(event, callback) {
  //   TiledeskClient.fireEvent(this.API_ENDPOINT, this.projectId, this.token, event, callback);
  // }

  // migrated from TiledeskChatbotUtil

  updateLeadEmailFullname(projectId, lead_id, email, fullname, callback) {
    // if (!this.lead_id) {
    //   throw new Error('options.lead_id can NOT be empty.');
    // }
    TiledeskClient.myrequest(
    {
      url: `${this.API_ENDPOINT}/${projectId}/leads/${lead_id}`, // this.conversation.lead._id
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
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
          callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
      }
    }, this.log);
  }

  updateRequest(projectId, request_id, properties, attributes, callback) {
    let URL = `${this.API_ENDPOINT}/${projectId}/requests/${request_id}/attributes`
    let data = attributes
    if (properties) {
      URL = `${this.API_ENDPOINT}/${projectId}/requests/${request_id}/`
      data = properties
    }
    
    TiledeskClient.myrequest(
    {
      url: URL,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': this.token
      },
      json: data,
      method: 'PATCH'
    },
    function(err, response, resbody) {
      if (response.statusCode === 200) {
        if (callback) {
          callback(null, resbody)
        }
      }
      else if (callback) {
        callback(TiledeskClient.getErr(err, response, resbody), null);
      }
    }, this.log);
  }

  updateDepartment(projectId, request_id, dep_id, callback) {
    request({
      url: `${this.API_ENDPOINT}/${projectId}/requests/${request_id}/departments`,
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': this.token
      },
      json: {
        departmentid: dep_id
      },
      method: 'PUT'
      },
      function(err, response, resbody) {
        if (response.statusCode === 200) {
          if (callback) {
            callback(null, resbody)
          }
        }
        else if (callback) {
          callback(TiledeskClient.getErr(err, response, resbody), null);
        }
      }
    );
  }

}

module.exports = { TiledeskClient };