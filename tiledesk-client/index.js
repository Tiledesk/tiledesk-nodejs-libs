/* 
    ver 0.1
    Andrea Sponziello - (c) Tiledesk.com
*/

const request = require('request')
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
   */
  constructor() {
  }

  fixToken(token) {
    if (token.startsWith('JWT ')) {
      return token
    }
    else {
      return 'JWT ' + token
    }
  }

  getProjectSettings(project_id, token, callback) {
    const _token = this.fixToken(token)
    const URL = `${API_ENDPOINT}/projects/${project_id}`
    console.log("getProjectSettings URL:", URL);
    console.log("getProjectSettings token:", _token);
    
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

  getAllProjectUsers(project_id, departmentid, token, callback) {
    const _token = this.fixToken(token)
    const URL = `${API_ENDPOINT}/${project_id}/departments/${departmentid}/operators?disableWebHookCall=true`
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

  updateRequestProperties(request_id, project_id, properties, token, callback) {
    const jwt_token = this.fixToken(token)
    var URL = `${API_ENDPOINT}/${project_id}/requests/${request_id}`
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

  updateRequestAttributes(request_id, project_id, attributes, token, callback) {
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

  getProjectUser(project_id, user_id, token, callback) {
    const jwt_token = 'JWT ' + token
    const URL = `${API_ENDPOINT}/${project_id}/project_users/users/${user_id}`
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
        callback(err, resbody[0])
      }
      else {
        callback(err, null)
        console.log("Error getting project_user. Error:", err, " Body:", resbody)
      }
    });
  }

  updateProjectUserAvailable(project_id, project_user_id, user_available, token, callback) {
    const jwt_token = 'JWT ' + token
    const URL = `${API_ENDPOINT}/${project_id}/project_users/${project_user_id}`
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

  updateProjectUserAttributes(project_id, project_user_id, attributes, token, callback) {
    const jwt_token = 'JWT ' + token
    const URL = `${API_ENDPOINT}/${project_id}/project_users/${project_user_id}`
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

  getRequests(project_id, token, limit, status, callback) {
    const jwt_token = 'JWT ' + token
    // direction = 1 => oldest must be served first
    const URL = `${API_ENDPOINT}/${project_id}/requests?status=${status}&limit=${limit}&direction=1`
    // console.log("requests.URL: ", URL);
    // console.log("\nwith token: ", jwt_token)
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
        callback(err, resbody.requests)
      }
      else {
        console.log("Error getting requests. Error:", err, " URL", URL, " token:", jwt_token, " Body:", resbody)
      }
    });
  }

  updateRequestParticipants(project_id, request_id, token, participants, callback) {
    const jwt_token = 'JWT ' + token
    const URL = `${API_ENDPOINT}/${project_id}/requests/${request_id}/participants`
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

  getWidgetSettings(project_id, callback) {
    request(
    {
      url: `https://tiledesk-server-pre.herokuapp.com/${project_id}/widgets`,
      method: 'GET',
      json: true
    },
    function(err, response, resbody) {
      // if (err) {
      //   console.log("ERROR: ", err);
      // }
      if(response.statusCode === 200) {
        console.log(resbody)
        callback(resbody)
      }
    });
  }

  openNow(project_id, token, callback) {
    const jwt_token = 'JWT ' + token
    request({
       url: `${API_ENDPOINT}/projects/${project_id}/isopen`,
       headers: {
         'Content-Type' : 'application/json',
         'Authorization': jwt_token
       },
       method: 'GET'
     },
     function(err, response, resbody) {
      //  console.log("resbody: ", resbody)
       if(response.statusCode === 200) {
         callback(JSON.parse(resbody).isopen)
       }
     });
   }
   
   anonymauth(project_id, callback) {
     request({
       url: `${API_ENDPOINT}/auth/signinAnonymously`,
       headers: {
         'Content-Type' : 'application/json'
       },
       json: {
         "id_project": project_id
       },
       method: 'POST'
     },
     function(err, response, resbody) {
      //  console.log("resbody: ", resbody)
       if(response.statusCode === 200) {
         callback(resbody.token)
       }
     });
   }

}

module.exports = { TiledeskClient };