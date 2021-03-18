var assert = require('assert');
const { TiledeskClient } = require('..');
const { v4: uuidv4 } = require('uuid');
var jwt = require('jsonwebtoken');

// FIRST CREATE A USER WITH UI
// THEN REPORT HERE USER CREDENTIALS AND
// FIRST PROJECT (OR ANOTHER PROJECT) DATA (ID AND NAME)
const EMAIL = "test@tiledesk.com"; // first user
const PASSWORD = "testtest";
const PROJECT_ID = "6011eafd51245600345cdf72"; // first user project
const PROJECT_NAME = 'First Test Project' // first project name
const PROJECT_SECRET = "f42349dd-882c-40c8-92ad-7f385f073dce";
// const REQUEST_ID = 'support-group-5a484009-518f-43ed-96b8-1b23282f64d8';
const API_ENDPOINT = "https://tiledesk-server-pre.herokuapp.com"; //TiledeskClient.DEFAULT_API_ENDPOINT;
const APIKEY = '____TODO____';
const LOG_STATUS = false;
// set during the test
let USER_TOKEN = null;
let PROJECT_USER_ID = null;
let USER_ID = null;
let ANONYM_USER_TOKEN = null;

describe('TiledeskClient', function() {
    describe('init()', function() {
      it('should return a new TiledeskClient', function() {
          const tdclient = new TiledeskClient({
              APIKEY: APIKEY,
              APIURL: "https://tiledesk-server-pre.herokuapp.com/v3",
              log: LOG_STATUS
          })
          if (tdclient) {
            assert(tdclient != null);
            assert(tdclient.APIURL === "https://tiledesk-server-pre.herokuapp.com/v3");
            assert(tdclient.APIKEY === APIKEY);
            assert(tdclient.log === LOG_STATUS);
          }
          else {
              assert.ok(false);
          }
      });
    });
});

describe('TiledeskClient', function() {
    describe('anonymousAuthentication()', function() {
        it('should return the auth token', function(done) {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                log: LOG_STATUS
            })
            if (tdclient) {
              assert(tdclient != null);
              tdclient.anonymousAuthentication(
                PROJECT_ID,
                function(err, result) {
                    if (!err && result) {
                        assert(result.token != null);
                        ANONYM_USER_TOKEN = result.token;
                        done();
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
    describe('customAuthentication()', function() {
        it('should return the auth token', function(done) {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                log: true
            })
            if (tdclient) {
              assert(tdclient != null);
              var externalUserId = uuidv4();
              var externalUser = {
                  _id: externalUserId,
                  firstname:"John",
                  lastname:"Wick",
                  email: "john@wick.com"
              };
              console.log("externalUser", externalUser);
              var signOptions = {                                                            
                subject:  'userexternal',                                                                 
                audience:  'https://tiledesk.com/projects/' + PROJECT_ID                                             
              };
              var jwtCustomToken = "JWT " + jwt.sign(externalUser, PROJECT_SECRET, signOptions);
              
              tdclient.customAuthentication(
                jwtCustomToken,
                function(err, result) {
                    if (!err && result) {
                        // console.log("result.token", result.token);
                        assert(result.token != null);
                        done();
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
        it('should return the auth token', function(done) {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
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
                    USER_TOKEN = result.token;
                    USER_ID = result.user._id;
                    done();
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
    it('should return the event echo json if fired correctly', function(done) {
        const tdclient = new TiledeskClient({
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            project_id: PROJECT_ID,
            log: LOG_STATUS
        })
        // tdclient.anonymousAuthentication(
        //     PROJECT_ID,
        //     function(err, result) {
        //         if (!err && result.token) {
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
                    tdclient.fireEvent(event, ANONYM_USER_TOKEN, function(err, result) {
                        assert.strictEqual(result.name, "faqbot.answer_not_found");
                        done();
                    });
            //     }
            //     else {
            //         assert.ok(false);
            //     }
            // });
    });
  });
});

describe('TiledeskClient', function() {
    describe('getProjectSettings()', function() {
        it('gets the project settings', function(done) {
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                log: LOG_STATUS
            })
            if (tdclient) {
            //   tdclient.authEmailPassword(EMAIL, PASSWORD, function(err, result) {
                tdclient.getProjectSettings(
                    PROJECT_ID,
                    USER_TOKEN,
                    function(err, resbody) {
                        if (!err && resbody) {
                            assert(resbody.name === PROJECT_NAME);
                            done();
                        }
                        else {
                            assert.ok(false);
                        }
                    }
                );
            //   })
              
            }
            else {
                assert.ok(false);
            }
        });
    });
});

describe('TiledeskClient', function() {
    describe('updateProjectUser()', function() {
        it('updates the project-user status to AVAILABLE', function(done) {
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                project_id: PROJECT_ID,
                log: LOG_STATUS
            })
            if (tdclient) {
                tdclient.updateProjectUserCurrentlyLoggedIn(
                    {
                        user_available: true
                    },
                    USER_TOKEN,
                    function(err, result) {
                        // console.log("ProjectUser (teammate):::::::::", result);
                        if (!err && result) {
                            assert(result);
                            assert(result.user_available === true);
                            // PROJECT_USER_ID = result[0]._id;
                            done();
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
    describe('getProjectUser()', function() {
        it('gets the project-user by user_idand verifies that he is AVAILABLE', function(done) {
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                project_id: PROJECT_ID,
                log: LOG_STATUS
            })
            if (tdclient) {
                tdclient.getProjectUser(
                    USER_ID,
                    USER_TOKEN,
                    function(err, result) {
                        // console.log("getProjectUser (teammate):", result);
                        if (!err && result) {
                            assert(Array.isArray(result));
                            assert(result[0]._id != null);
                            assert(result[0].user_available === true);
                            PROJECT_USER_ID = result[0]._id;
                            done();
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
    describe('updateProjectUser()', function() {
        it('updates the project-user status to unavailable', function(done) {
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                project_id: PROJECT_ID,
                log: LOG_STATUS
            })
            if (tdclient) {
                tdclient.updateProjectUserCurrentlyLoggedIn(
                    {
                        user_available: false
                    },
                    USER_TOKEN,
                    function(err, result) {
                        // console.log("ProjectUser (teammate):", result);
                        if (!err && result) {
                            assert(result);
                            assert(result.user_available === false);
                            // assert(result[0]._id != null);
                            // PROJECT_USER_ID = result[0]._id;
                            done();
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
    describe('getProjectUser()', function() {
        it('verifies the project-user status is unavailable', function(done) {
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                project_id: PROJECT_ID,
                log: LOG_STATUS
            })
            if (tdclient) {
                tdclient.getProjectUser(
                    USER_ID,
                    USER_TOKEN,
                    function(err, result) {
                        if (!err && result) {
                            assert(Array.isArray(result));
                            assert(result[0]._id != null);
                            assert(result[0].user_available === false);
                            done();
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
        it('should return false because of project not having open hours setup', function(done) {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                log: LOG_STATUS
            });
            if (tdclient) {
              assert(tdclient != null);
              tdclient.openNow(PROJECT_ID, function(err, result) {
                assert(err === null);
                assert(result.isopen === true);
                done();
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
        it('Widget settings JSON', function(done) {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                log: LOG_STATUS
            });
            if (tdclient) {
              assert(tdclient != null);
              tdclient.getWidgetSettings(PROJECT_ID, function(err, result) {
                assert(err === null);
                assert(result != null);
                done();
              });
            }
            else {
                assert.ok(false);
            }
        });
    });
});

// describe('TiledeskClient', function() {
//     describe('set teammate unavailable', function() {
//         it('puts the project_user unavailable', function(done) {
//             const tdclient = new TiledeskClient({
//                 APIKEY: APIKEY,
//                 API_ENDPOINT: API_ENDPOINT,
//                 log: LOG_STATUS
//             });
//             if (tdclient) {
//               assert(tdclient != null);
//               tdclient.anonymousAuthentication(
//                 PROJECT_ID,
//                 function(err, resbody) {
//                     if (!err && resbody) {
//                         assert(resbody.token != null);
//                         const text_value = 'test message';
//                         const request_id = 'support-group-' + uuidv4();
//                         // console.log("Sending message to REQUEST-ID:", request_id);
//                         tdclient.sendMessage(PROJECT_ID, request_id, {text: text_value}, resbody.token, function(err, result) {
//                             // console.log("RESULT:", result)
//                             assert(err === null);
//                             assert(result != null);
//                             assert(result.text === text_value);
//                             done();
//                           });
//                     }
//                     else {
//                         assert.ok(false);
//                     }
//                 }
//               );
//             }
//             else {
//                 assert.ok(false);
//             }
//         });
//     });
// });

describe('TiledeskClient', function() {
    describe('sendMessage() anonymous', function() {
        it('sends a message to a request conversation, "project_id" in options parameter', function(done) {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                log: LOG_STATUS
            });
            if (tdclient) {
              assert(tdclient != null);
            //   tdclient.anonymousAuthentication(
            //     PROJECT_ID,
            //     function(err, resbody) {
            //         if (!err && resbody) {
            //             assert(resbody.token != null);
                        const text_value = 'test message';
                        const request_id = 'support-group-' + uuidv4();
                        // console.log("Sending message to REQUEST-ID:", request_id);
                        tdclient.sendMessage(request_id, {text: text_value}, ANONYM_USER_TOKEN, function(err, result) {
                            // console.log("RESULT:", result)
                            assert(err === null);
                            assert(result != null);
                            assert(result.text === text_value);
                            done();
                          },
                          {
                              project_id: PROJECT_ID
                          });
            //         }
            //         else {
            //             assert.ok(false);
            //         }
            //     }
            //   );
            }
            else {
                assert.ok(false);
            }
        });
    });
});

describe('TiledeskClient', function() {
    describe('sendMessage() anonymous', function() {
        it('sends a message to a request conversation, "project_id" in constructor()', function(done) {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                project_id: PROJECT_ID,
                log: LOG_STATUS
            });
            if (tdclient) {
              assert(tdclient != null);
                const text_value = 'test message';
                const request_id = 'support-group-' + uuidv4();
                // console.log("Sending message to REQUEST-ID:", request_id);
                tdclient.sendMessage(request_id, {text: text_value}, ANONYM_USER_TOKEN, function(err, result) {
                    // console.log("RESULT:", result)
                    assert(err === null);
                    assert(result != null);
                    assert(result.text === text_value);
                    done();
                });
            }
            else {
                assert.ok(false);
            }
        });
    });
});

describe('TiledeskClient', function() {
    describe('getRequests()', function() {
        it('gets the project requests', (done) => {
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                project_id: PROJECT_ID,
                log: LOG_STATUS
            })
            const limit = 1;
            tdclient.getRequests(limit, TiledeskClient.UNASSIGNED_STATUS, USER_TOKEN, (err, result) => {
                // console.log("result:", JSON.stringify(result));
                assert(result);
                const requests = result.requests;
                assert(requests);
                assert(result.requests);
                assert(Array.isArray(requests));
                assert(result.requests.length > 0);
                done();
            },
            {
                additional_params: {
                    "no_populate": "true",
                    "snap_department_routing": "assigned"
                }
            });
                // }
            //   });
              
            // }
            // else {
            //     assert.ok(false);
            // }
        });
    });
});