var assert = require('assert');
const { TiledeskClient } = require('..');
const { v4: uuidv4 } = require('uuid');

// FIRST CREATE A USER WITH UI
// THEN REPORT HERE USER CREDENTIALS AND
// FIRST PROJECT (OR ANOTHER PROJECT) DATA (ID AND NAME)
const EMAIL = "test@tiledesk.com"; // first user
const PASSWORD = "testtest";
const PROJECT_ID = "6011eafd51245600345cdf72"; // first user project
const PROJECT_NAME = 'First Test Project' // first project name
// const REQUEST_ID = 'support-group-5a484009-518f-43ed-96b8-1b23282f64d8';
const API_ENDPOINT = "https://tiledesk-server-pre.herokuapp.com"; //TiledeskClient.DEFAULT_API_ENDPOINT;
const APIKEY = '____TODO____';
const LOG_STATUS = false;

describe('TiledeskClient', function() {
    describe('init()', function() {
      it('should return a new TiledeskClient', function() {
          const tdclient = new TiledeskClient({
              APIKEY: APIKEY,
              API_ENDPOINT: API_ENDPOINT,
              log: LOG_STATUS
          })
          if (tdclient) {
            assert(tdclient != null);
          }
          else {
              assert.ok(false);
          }
      });
    });
});

describe('TiledeskClient', function() {
    describe('anonymousAuthentication()', function() {
        it('should return the auth token', function() {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                API_ENDPOINT: API_ENDPOINT,
                log: LOG_STATUS
            })
            if (tdclient) {
              assert(tdclient != null);
              tdclient.anonymousAuthentication(
                PROJECT_ID,
                function(err, result) {
                    // console.log("*********************")
                    // console.log(err, resbody)
                    if (!err && result) {
                        assert(result.token != null);
                    }
                    else {
                        assert.ok(false);
                    }
                }
              );
            }
            else {
                assert.ok(false);
            }
        });
    });
});

describe('TiledeskClient', function() {
    describe('authEmailPassword()', function() {
        it('should return the auth token', function() {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                API_ENDPOINT: API_ENDPOINT,
                log: LOG_STATUS
            })
            if (tdclient) {
              assert(tdclient != null);
              tdclient.authEmailPassword(EMAIL, PASSWORD, function(err, result) {
                // console.log("authEmailPassword().result:", result);
                if (!err && result) {
                    assert(result.success == true);
                    assert(result.token != null);
                    assert(result.user)
                    assert(result.user._id !== null);
                    assert(result.user.email !== null);
                }
                else {
                    assert.ok(false);
                }
              })
            }
            else {
                assert.ok(false);
            }
        });
    });
});

describe('TiledeskClient', function() {
  describe('fireEvent()', function() {
    it('should return the event echo json if fired correctly', function() {
        const tdclient = new TiledeskClient({
            APIKEY: APIKEY,
            API_ENDPOINT: API_ENDPOINT,
            log: LOG_STATUS
        })
        tdclient.anonymousAuthentication(
            PROJECT_ID,
            function(err, result) {
                if (!err && result.token) {
                    const event = {
                        name: "faqbot.answer_not_found",
                        attributes: {
                            bot: {
                                _id: "testbot_id",
                                name: "testbot_name"
                            },
                            message: {
                                text: "help"
                            }
                        }
                    };
                    tdclient.fireEvent(PROJECT_ID, event, result.token, function(err, result) {
                        assert.strictEqual(result.name, "faqbot.answer_not_found");
                    });
                }
                else {
                    assert.ok(false);
                }
            }
        );
    });
  });
});

describe('TiledeskClient', function() {
    describe('getProjectSettings()', function() {
        it('gets the project settings', function() {
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                API_ENDPOINT: API_ENDPOINT,
                log: LOG_STATUS
            })
            if (tdclient) {
              tdclient.authEmailPassword(EMAIL, PASSWORD, function(err, result) {
                tdclient.getProjectSettings(
                    PROJECT_ID,
                    result.token,
                    function(err, resbody) {
                        if (!err && resbody) {
                            assert(resbody.name === PROJECT_NAME);
                        }
                        else {
                            assert.ok(false);
                        }
                    }
                );
              })
              
            }
            else {
                assert.ok(false);
            }
        });
    });
});

describe('TiledeskClient', function() {
    describe('getProjectUser()', function() {
        it('gets the project-user by user_id', function() {
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                API_ENDPOINT: API_ENDPOINT,
                log: LOG_STATUS
            })
            if (tdclient) {
              tdclient.authEmailPassword(EMAIL, PASSWORD, function(err, result) {
                const user_id = result.user._id;
                // console.log("user_id**********", user_id)
                tdclient.getProjectUser(
                    PROJECT_ID,
                    user_id,
                    result.token,
                    function(err, resbody) {
                        // console.log("getProjectUser", result);
                        if (!err && result) {
                            assert(result.user !== null);
                            assert(result.user._id !== null);
                            assert(result.user.email !== null);
                        }
                        else {
                            assert.ok(false);
                        }
                    }
                );
              })
              
            }
            else {
                assert.ok(false);
            }
        });
    });
});

// describe('TiledeskClient', function() {
//     describe('getAllProjectUsers()', function() {
//         it('gets all the project users', function() {
//             const tdclient = new TiledeskClient(
//             {
//                 APIKEY: APIKEY,
//                 API_ENDPOINT: API_ENDPOINT,
//                 log: LOG_STATUS
//             })
//             if (tdclient) {
//               tdclient.authEmailPassword(EMAIL, PASSWORD, function(err, result) {
//                 tdclient.getAllProjectUsers(
//                     PROJECT_ID,
//                     result.token,
//                     function(err, resbody) {
//                         if (!err && resbody) {
//                             assert(resbody.name === PROJECT_NAME);
//                         }
//                         else {
//                             assert.ok(false);
//                         }
//                     }
//                 );
//               })
              
//             }
//             else {
//                 assert.ok(false);
//             }
//         });
//     });
// });



describe('TiledeskClient', function() {
    describe('openNow()', function() {
        it('should return false because of project not having open hours setup', function() {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                API_ENDPOINT: API_ENDPOINT,
                log: LOG_STATUS
            });
            if (tdclient) {
              assert(tdclient != null);
              tdclient.openNow(PROJECT_ID, function(err, result) {
                assert(err === null);
                assert(result.isopen === true);
              });
            }
            else {
                assert.ok(false);
            }
        });
    });
});

describe('TiledeskClient', function() {
    describe('getWidgetSettings()', function() {
        it('Widget settings JSON', function() {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                API_ENDPOINT: API_ENDPOINT,
                log: LOG_STATUS
            });
            if (tdclient) {
              assert(tdclient != null);
              tdclient.getWidgetSettings(PROJECT_ID, function(err, result) {
                assert(err === null);
                assert(result != null);
              });
            }
            else {
                assert.ok(false);
            }
        });
    });
});

describe('TiledeskClient', function() {
    describe('sendMessage() anonymous', function() {
        it('sends a message to a request conversation', function() {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                API_ENDPOINT: API_ENDPOINT,
                log: LOG_STATUS
            });
            if (tdclient) {
              assert(tdclient != null);
              tdclient.anonymousAuthentication(
                PROJECT_ID,
                function(err, resbody) {
                    if (!err && resbody) {
                        assert(resbody.token != null);
                        const text_value = 'test message';
                        const request_id = 'support-group-' + uuidv4();
                        // console.log("Sending message to REQUEST-ID:", request_id);
                        tdclient.sendMessage(PROJECT_ID, request_id, {text: text_value}, resbody.token, function(err, result) {
                            // console.log("RESULT:", result)
                            assert(err === null);
                            assert(result != null);
                            assert(result.text === text_value);
                          });
                    }
                    else {
                        assert.ok(false);
                    }
                }
              );
            }
            else {
                assert.ok(false);
            }
        });
    });
});