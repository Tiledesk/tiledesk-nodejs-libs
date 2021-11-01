var assert = require('assert');
const { TiledeskClient } = require('..');
const { v4: uuidv4 } = require('uuid');
var jwt = require('jsonwebtoken');

// FIRST CREATE A USER WITH UI
// THEN REPORT HERE USER CREDENTIALS AND
// FIRST PROJECT (OR ANOTHER PROJECT) DATA (ID AND NAME)
const EMAIL = "test@tiledesk.com"; // first user
const PASSWORD = "testtest";
const EMAIL2 = "test2@tiledesk.com"; // second user
const PASSWORD2 = "testtest";
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
const FAKE_USER_TOKEN = 'JWT ' + uuidv4();

describe('TiledeskClient', function() {
    describe('init() with projectId & token', function() {
      it('should return a new TiledeskClient', function() {
        const tdclient = new TiledeskClient({
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: FAKE_USER_TOKEN,
            log: LOG_STATUS
        })
          if (tdclient) {
            assert(tdclient != null);
            assert(tdclient.APIURL === API_ENDPOINT);
            assert(tdclient.projectId === PROJECT_ID);
            assert(tdclient.jwt_token === FAKE_USER_TOKEN);
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
            // const tdclient = new TiledeskClient({
            //     APIKEY: APIKEY,
            //     APIURL: API_ENDPOINT,
            //     projectId: PROJECT_ID,
            //     log: LOG_STATUS
            // })
            // if (tdclient) {
            //   assert(tdclient != null);
              TiledeskClient.anonymousAuthentication(
                PROJECT_ID,
                APIKEY,
                {
                    APIURL: API_ENDPOINT,
                    log: false
                },
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
            // }
            // else {
            //     assert.ok(false);
            // }
        });
    });
});

describe('TiledeskClient', function() {
    describe('authEmailPassword()', function() {
        it('should return the auth token', function(done) {
            // const tdclient = new TiledeskClient({
            //     APIKEY: APIKEY,
            //     APIURL: API_ENDPOINT,
            //     log: LOG_STATUS
            // })
            // if (tdclient) {
            //   assert(tdclient != null);
              TiledeskClient.authEmailPassword(
                  APIKEY,
                  EMAIL,
                  PASSWORD,
                  {
                    APIURL: API_ENDPOINT,
                    log: LOG_STATUS
                  },
                function(err, result) {
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
              });
            // }
            // else {
            //     assert.ok(false);
            // }
        });
    });
});

describe('TiledeskClient', function() {
    describe('customAuthentication()', function() {
        it('should return the auth token', function(done) {
            // const tdclient = new TiledeskClient({
            //     APIKEY: APIKEY,
            //     APIURL: API_ENDPOINT,
            //     log: LOG_STATUS
            // })
            // if (tdclient) {
            //   assert(tdclient != null);
              var externalUserId = uuidv4();
              var externalUser = {
                  _id: externalUserId,
                  firstname:"John",
                  lastname:"Wick",
                  email: "john@wick.com"
              };
              var signOptions = {                                                            
                subject:  'userexternal',
                audience:  'https://tiledesk.com/projects/' + PROJECT_ID
              };
              var jwtCustomToken = "JWT " + jwt.sign(externalUser, PROJECT_SECRET, signOptions);
              
              TiledeskClient.customAuthentication(
                  APIKEY,
                jwtCustomToken,
                {
                    APIURL: API_ENDPOINT,
                    log: LOG_STATUS
                },
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
            // }
            // else {
            //     assert.ok(false);
            // }
        });
    });
});

describe('TiledeskClient', function() {
  describe('fireEvent()', function() {
    it('should return the event echo json if fired correctly', function(done) {
        const tdclient = new TiledeskClient({
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: ANONYM_USER_TOKEN,
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
                    tdclient.fireEvent(event, function(err, result) {
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
                projectId: PROJECT_ID,
                token: USER_TOKEN,
                log: LOG_STATUS
            })
            if (tdclient) {
            //   tdclient.authEmailPassword(EMAIL, PASSWORD, function(err, result) {
                tdclient.getProjectSettings(
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
                projectId: PROJECT_ID,
                token: USER_TOKEN,
                log: LOG_STATUS
            })
            if (tdclient) {
                tdclient.updateProjectUserCurrentlyLoggedIn(
                    {
                        user_available: true
                    },
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
        it('gets the project-user by userId and verifies that he is AVAILABLE', function(done) {
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                projectId: PROJECT_ID,
                token: USER_TOKEN,
                log: LOG_STATUS
            })
            if (tdclient) {
                tdclient.getProjectUser(
                    USER_ID,
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
    describe('updateProjectUserCurrentlyLoggedIn()', function() {
        it('updates the project-user status to unavailable', function(done) {
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                projectId: PROJECT_ID,
                token: USER_TOKEN,
                log: LOG_STATUS
            })
            if (tdclient) {
                tdclient.updateProjectUserCurrentlyLoggedIn(
                    {
                        user_available: false
                    },
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
                projectId: PROJECT_ID,
                token: USER_TOKEN,
                log: LOG_STATUS
            })
            if (tdclient) {
                tdclient.getProjectUser(
                    USER_ID,
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
//         it('gets all the project users', function(done) {
//             const tdclient = new TiledeskClient(
//             {
//                 APIKEY: APIKEY,
//                 APIURL: API_ENDPOINT,
//                 log: true
//             })
//             if (tdclient) {
//               tdclient.authEmailPassword(EMAIL, PASSWORD, function(err, result) {
//                 console.log("RESULT:", result);
//                 tdclient.getAllProjectUsers(
//                     PROJECT_ID,
//                     result.token,
//                     function(err, resbody) {
//                         if (!err && resbody) {
//                             assert(resbody.name === PROJECT_NAME);
//                             done();
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
                projectId: PROJECT_ID,
                token: ANONYM_USER_TOKEN,
                log: LOG_STATUS
            });
            if (tdclient) {
              assert(tdclient != null);
              tdclient.openNow(function(err, result) {
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
                projectId: PROJECT_ID,
                token: ANONYM_USER_TOKEN,
                log: LOG_STATUS
            });
            if (tdclient) {
              assert(tdclient != null);
              tdclient.getWidgetSettings(function(err, result) {
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

// // describe('TiledeskClient', function() {
// //     describe('set teammate unavailable', function() {
// //         it('puts the project_user unavailable', function(done) {
// //             const tdclient = new TiledeskClient({
// //                 APIKEY: APIKEY,
// //                 API_ENDPOINT: API_ENDPOINT,
// //                 log: LOG_STATUS
// //             });
// //             if (tdclient) {
// //               assert(tdclient != null);
// //               tdclient.anonymousAuthentication(
// //                 PROJECT_ID,
// //                 function(err, resbody) {
// //                     if (!err && resbody) {
// //                         assert(resbody.token != null);
// //                         const text_value = 'test message';
// //                         const request_id = 'support-group-' + uuidv4();
// //                         // console.log("Sending message to REQUEST-ID:", request_id);
// //                         tdclient.sendMessage(PROJECT_ID, request_id, {text: text_value}, resbody.token, function(err, result) {
// //                             // console.log("RESULT:", result)
// //                             assert(err === null);
// //                             assert(result != null);
// //                             assert(result.text === text_value);
// //                             done();
// //                           });
// //                     }
// //                     else {
// //                         assert.ok(false);
// //                     }
// //                 }
// //               );
// //             }
// //             else {
// //                 assert.ok(false);
// //             }
// //         });
// //     });
// // });

/** DEPRECATED TEST */
// describe('TiledeskClient', function() {
//     describe('sendSupportMessage() anonymous', function() {
//         it('sends a message to a request conversation, "projectId" & "token" as options parameters', function(done) {
//             const tdclient = new TiledeskClient({
//                 APIKEY: APIKEY,
//                 APIURL: API_ENDPOINT,
//                 log: LOG_STATUS
//             });
//             if (tdclient) {
//               assert(tdclient != null);
//             //   tdclient.anonymousAuthentication(
//             //     PROJECT_ID,
//             //     function(err, resbody) {
//             //         if (!err && resbody) {
//             //             assert(resbody.token != null);
//                         const text_value = 'test message';
//                         const request_id = TiledeskClient.newRequestId(PROJECT_ID);
//                         // console.log("Sending message to REQUEST-ID:", request_id);
//                         tdclient.sendSupportMessage(request_id, {text: text_value}, function(err, result) {
//                             // console.log("RESULT:", result)
//                             assert(err === null);
//                             assert(result != null);
//                             assert(result.text === text_value);
//                             done();
//                           },
//                           {
//                               projectId: PROJECT_ID,
//                               token: ANONYM_USER_TOKEN
//                           });
//             //         }
//             //         else {
//             //             assert.ok(false);
//             //         }
//             //     }
//             //   );
//             }
//             else {
//                 assert.ok(false);
//             }
//         });
//     });
// });

describe('TiledeskClient', function() {
    describe('sendSupportMessage() anonymous', function() {
        it('sends a message to a request conversation', function(done) {
            const tdclient = new TiledeskClient({
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                projectId: PROJECT_ID,
                token: ANONYM_USER_TOKEN,
                log: LOG_STATUS
            });
            if (tdclient) {
              assert(tdclient != null);
                const text_value = 'test message';
                const request_id = TiledeskClient.newRequestId(PROJECT_ID);
                tdclient.sendSupportMessage(request_id, {text: text_value}, function(err, result) {
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

// describe('TiledeskClient', function() {
//     describe('sendDirectMessage() by anonymous', function() {
//         it('sends a direct message ANONYM_USER_TOKEN to on-the-fly-anonynous user, "projectId" & "token" are "options" parameters', function(done) {
//             const tdclient = new TiledeskClient({
//                 APIKEY: APIKEY,
//                 APIURL: API_ENDPOINT,
//                 log: true
//             });
//             if (tdclient) {
//               assert(tdclient != null);
//               tdclient.authEmailPassword(
//                 EMAIL2,
//                 PASSWORD2, 
//                 function(err, resbody) {
//                     if (!err && resbody) {
//                         console.log("resbody:", resbody)
//                         assert(resbody.token != null);
//                         assert(resbody.user != null);
//                         assert(resbody.user._id != null);
//                         const text_value = "test message";
//                         const msgJSON = {
//                             "senderFullname": "Guest 1",
//                             "recipient": resbody.user._id,
//                             "text": text_value
//                         }
//                         // console.log("Sending message to REQUEST-ID:", request_id);
//                         tdclient.sendDirectMessage(msgJSON, function(err, result) {
//                             console.log("Message sent:", result)
//                             if (err) {
//                                 console.error("An error occurred:", err);
//                                 assert(err === null);
//                             }
//                             assert(result != null);
//                             assert(result.text === text_value);
//                             done();
//                           },
//                           {
//                               projectId: PROJECT_ID,
//                               token: USER_TOKEN
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

// describe('TiledeskClient', function() {
//     describe('getRequests() DEPRECATED', function() {
//         it('gets the project requests', (done) => {
//             const tdclient = new TiledeskClient(
//             {
//                 APIKEY: APIKEY,
//                 APIURL: API_ENDPOINT,
//                 projectId: PROJECT_ID,
//                 token: USER_TOKEN,
//                 log: LOG_STATUS
//             })
//             const limit = 1;
//             tdclient.getRequests(limit, TiledeskClient.UNASSIGNED_STATUS, (err, result) => {
//                 // console.log("result:", JSON.stringify(result));
//                 assert(result);
//                 const requests = result.requests;
//                 assert(requests);
//                 assert(result.requests);
//                 assert(Array.isArray(requests));
//                 assert(result.requests.length > 0);
//                 done();
//             },
//             {
//                 additional_params: {
//                     "no_populate": "true",
//                     "snap_department_routing": "assigned"
//                 }
//             });
//                 // }
//             //   });
              
//             // }
//             // else {
//             //     assert.ok(false);
//             // }
//         });
//     });
// });

describe('TiledeskClient', function() {
    describe('getAllRequests()', function() {
        it('gets the project requests', (done) => {
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                projectId: PROJECT_ID,
                token: USER_TOKEN,
                log: LOG_STATUS
            })
            tdclient.getAllRequests(
                {
                    limit: 1,
                    status: TiledeskClient.UNASSIGNED_STATUS
                }, (err, result) => {
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

describe('TiledeskClient', function() {
    describe('getRequestById()', function() {
        it('gets a request by his ID', (done) => {
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                projectId: PROJECT_ID,
                token: USER_TOKEN,
                log: LOG_STATUS
            })
            const limit = 1;
            tdclient.getAllRequests(
                {
                    limit: 1,
                    status: TiledeskClient.UNASSIGNED_STATUS
                }, (err, result) => {
                assert(result);
                const requests = result.requests;
                assert(requests);
                assert(result.requests);
                assert(Array.isArray(requests));
                assert(result.requests.length > 0);
                const request = requests[0];
                assert(request.request_id != null);
                first_request_id = request.request_id;
                tdclient.getRequestById(first_request_id, (err, result) => {
                    // console.log("RICHIESTA", JSON.stringify(result))
                    assert(result != null);
                    const request = result;
                    assert(request.request_id != null);
                    assert(request.request_id === first_request_id);
                    done();
                });
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