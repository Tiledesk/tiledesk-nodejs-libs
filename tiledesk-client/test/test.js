var assert = require('assert');
const { TiledeskClient } = require('..');
const { v4: uuidv4 } = require('uuid');
var jwt = require('jsonwebtoken');
require('dotenv').config();

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const PROJECT_ID = process.env.PROJECT_ID;
const PROJECT_NAME = process.env.PROJECT_NAME;
const PROJECT_SECRET = process.env.PROJECT_SECRET;
const API_ENDPOINT = process.env.API_ENDPOINT;
const APIKEY = process.env.APIKEY;
const LOG_STATUS = (process.env.LOG_STATUS && process.env.LOG_STATUS) === 'true' ? true : false;

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

describe('TiledeskClient auth', function() {
    
    it('anonymousAuthentication. should return the auth token', function(done) {
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
    
    it('authEmailPassword should return the auth token', function(done) {
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
    
    it('customAuthentication. should return the auth token', function(done) {
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
            jwtCustomToken,
            APIKEY,
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

describe('TiledeskClient fireEvent()', function() {
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

describe('Projects', function() {
    it('getProjectSettings()', function(done) {
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

    it('getProjectAvailableAgents()', function(done) {
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: LOG_STATUS
        })
        if (tdclient) {
            tdclient.getProjectAvailableAgents(
                function(err, agents) {
                    if (!err && agents) {
                        assert(Array.isArray(agents));
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

    it('getProjectAvailableAgents() async ', async function() {
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: LOG_STATUS
        });
        try {
            let agents = await tdclient.getProjectAvailableAgents();
            assert(agents != null);
            assert(Array.isArray(agents));
        }
        catch (err) {
            assert.ok(false);
        }
    });
});

  // ***************************************************
  // ********************* TEAM ************************
  // ***************************************************

describe('Team', function() {
    it('updateProjectUser(). updates the project-user status to AVAILABLE', function(done) {
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

    it('getProjectUser() gets the project-user by userId and verifies that he is AVAILABLE', function(done) {
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
    
    it('updateProjectUserCurrentlyLoggedIn(). updates the project-user status to unavailable', function(done) {
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
   


    
    it('getProjectUser(). verifies the project-user status is unavailable', function(done) {
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


    it('getTeam(). gets all the project users (the team)', function(done) {
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: LOG_STATUS
        })
        if (tdclient) {
            tdclient.getTeam(
                (err, teammates) => {
                    if (!err && teammates) {
                        assert(teammates != null);
                        assert(teammates.length > 0);
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


  // *******************************************************
  // ********************* REQUESTS ************************
  // *******************************************************

describe('Requests', function() {
    it('sendSupportMessage() anonymous to create a new request. sends a message to a new request conversation to create the support conversation', function(done) {
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

// TODO: this one never passes. BUG!
// describe('TiledeskClient', function() {
//     describe('sendSupportMessage() anonymous to throw an error (text is empty)', function() {
//         it('sends a message to a new request conversation to create the support conversation', function(done) {
//             const tdclient = new TiledeskClient({
//                 APIKEY: APIKEY,
//                 APIURL: API_ENDPOINT,
//                 projectId: PROJECT_ID,
//                 token: ANONYM_USER_TOKEN,
//                 log: this.LOG_STATUS
//             });
//             if (tdclient) {
//               assert(tdclient != null);
//                 const text_value = '';
//                 const request_id = TiledeskClient.newRequestId(PROJECT_ID);
//                 tdclient.sendSupportMessage(request_id, {text: text_value}, function(err, result) {
//                     //console.log("Error", err)
//                     assert(err);
//                     done();
//                 });
//             }
//             else {
//                 assert.ok(false);
//             }
//         });
//     });
// });


    
    it('Assign the request without a bot. Sends a message to a new request conversation to create the support conversation, the it assigns the request to a human, bypassing the bot', function(done) {
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
                // just to get the departmentId of the request.
                const tdclient_user = new TiledeskClient(
                    {
                        APIKEY: APIKEY,
                        APIURL: API_ENDPOINT,
                        projectId: PROJECT_ID,
                        token: USER_TOKEN,
                        log: LOG_STATUS
                    })
                    tdclient_user.getRequestById(request_id, (err, result) => {
                    //console.log("RICHIESTA:", err, JSON.stringify(result))
                    assert(result != null);
                    const request = result;
                    assert(request.request_id != null);
                    assert(request.request_id === request_id);
                    // done();
                    const departmentId = request.department._id;
                    // const departmentName = request.department.name;
                    tdclient_user.assign(request_id, departmentId, {nobot: true}, (err, result) => {
                        assert(err === null);
                        assert(result != null);
                        //console.log("Successfully reassigned request:", request_id);
                        done();
                    });
                });
                
            });
        }
        else {
            assert.ok(false);
        }
    });
    


    it('getAllRequests(). gets the project requests', (done) => {
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
    });
    

    it('getRequestById(). gets a request by his ID', (done) => {
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
            tdclient.getRequestById(first_request_id, async (err, result) => {
                //console.log("RICHIESTA", JSON.stringify(result))
                assert(result != null);
                const request = result;
                assert(request.request_id != null);
                assert(request.request_id === first_request_id);
                // async/await version
                let _request;
                try {
                    _request = await tdclient.getRequestById(first_request_id);
                    //console.log("Async request", JSON.stringify(_request));
                    assert(_request != null);
                    assert(_request.request_id != null);
                    assert(_request.request_id === first_request_id);
                    done();
                }
                catch (error) {
                    console.error("Error on async request", error);
                    process.exit(0);
                }
            });
        },
        {
            additional_params: {
                "no_populate": "true",
                "snap_department_routing": "assigned"
            }
        });
    });

    it('getRequestById(). gets a not existing request and correctly manages the 404 return status code', (done) => {
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: LOG_STATUS
        })
        
        tdclient.getRequestById("NOT-EXISTING-REQUEST", async (err, result) => {
            if (!err && !result) {
                // console.log("REQUEST NOT FOUND:", result)
                done();
            }
            else {
                assert.ok(false);
            }
        });
        
    });

    it('Closes a request', function(done) {
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
                // just to get the departmentId of the request.
                const tdclient_user = new TiledeskClient(
                    {
                        APIKEY: APIKEY,
                        APIURL: API_ENDPOINT,
                        projectId: PROJECT_ID,
                        token: USER_TOKEN,
                        log: LOG_STATUS
                    })
                    tdclient_user.getRequestById(request_id, (err, result) => {
                    assert(result != null);
                    const request = result;
                    assert(request.request_id != null);
                    assert(request.request_id === request_id);
                    tdclient_user.closeRequest(request_id, (err, result) => {
                        assert(err === null);
                        assert(result != null);
                        done();
                    });
                });
                
            });
        }
        else {
            assert.ok(false);
        }
    });

    it('Closes a request async version', async function() {
        const tdclient = new TiledeskClient({
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: ANONYM_USER_TOKEN,
            log: LOG_STATUS
        });
        if (tdclient) {
            try {
                assert(tdclient != null);
                const text_value = 'test message';
                const request_id = TiledeskClient.newRequestId(PROJECT_ID);
                const message = await tdclient.sendSupportMessage(request_id, {text: text_value});
                assert(message != null);
                assert(message.text === text_value);
                const tdclient_user = new TiledeskClient(
                    {
                        APIKEY: APIKEY,
                        APIURL: API_ENDPOINT,
                        projectId: PROJECT_ID,
                        token: USER_TOKEN,
                        log: LOG_STATUS
                    });
                const request = await tdclient_user.getRequestById(request_id);
                assert(request != null);
                assert(request.request_id != null);
                assert(request.request_id === request_id);
                const response = await tdclient_user.closeRequest(request_id);
                assert(response != null);
            }
            catch (err) {
                console.error("An error occurred:", err);
                assert.ok(false);
            }
            
        }
        else {
            assert.ok(false);
        }
    });
    
});

  // ***************************************************
  // ********************* BOTS ************************
  // ***************************************************

describe('Bots', function() {
    
    it('createBot(). creates a native bot, then deletes it', (done) => {
        const bot_name = "my bot " + uuidv4();
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: LOG_STATUS
        })
        tdclient.createBot(bot_name, false, null, (err, result) => {
            assert(!err);
            assert(result);
            assert(result.type === 'internal');
            assert(result.name === bot_name);
            assert(result._id);
            tdclient.deleteBot(result._id, (err, result) => {
                assert(!err);
                assert(result);
                done();
            });
        });
    });
    

    
    it('updateBot(). creates, updates and deletes a native bot', (done) => {
        const bot_name = "my bot " + uuidv4();
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: LOG_STATUS
        })
        tdclient.createBot(bot_name, false, null, (err, result) => {
            assert(!err);
            assert(result);
            assert(result.type === 'internal');
            assert(result.name === bot_name);
            assert(result._id);
            const bot_id = result._id;
            const new_bot_name = "new bot name";
            tdclient.updateBot(bot_id, new_bot_name, false, null, (err, result) => {
                assert(!err);
                assert(result);
                assert(result.type === 'internal');
                assert(result.name === new_bot_name);
                assert(result._id);
                assert(result._id === bot_id);
                tdclient.deleteBot(bot_id, (err, result) => {
                    assert(!err);
                    assert(result);
                    done();
                });
            });
        });
    });

    it('getBot(). gets a bot by id: 1. create a bot, 2. query bots, 3. delete created bot', (done) => {
        const bot_name = "my bot " + uuidv4();
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: LOG_STATUS
        })
        tdclient.createBot(bot_name, false, null, (err, result) => {
            assert(result);
            assert(result.type === 'internal');
            assert(result.name === bot_name);
            assert(result._id !== null);
            tdclient.getBot(result._id, (err, result) => {
                //console.log("bot:", result);
                tdclient.deleteBot(result._id, (err, result) => {
                    assert(!err);
                    assert(result);
                    done();
                });
            });
        });
    });

    it('findBotByName(). gets a bot by name: 1. create a bot, 2. find bot by name, 3. delete created bot', (done) => {
        const bot_name = "my bot " + uuidv4();
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: LOG_STATUS
        })
        tdclient.createBot(bot_name, false, null, (err, result) => {
            assert(result);
            assert(result.type === 'internal');
            assert(result.name === bot_name);
            assert(result._id !== null);
            tdclient.findBotByName(bot_name, (err, bot) => {
                //console.log("bot:", bot)
                assert(bot);
                assert(bot.name === bot_name);
                tdclient.deleteBot(bot._id, (err, result) => {
                    assert(!err);
                    assert(result);
                    done();
                });
            });
        });
    });

    it('getAllBots(). creates 2 bots and gets all bots, then deletes the 2 bots.', (done) => {
        const bot_name1 = "my bot " + uuidv4();
        const bot_name2 = "my bot " + uuidv4();
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: LOG_STATUS
        })
        tdclient.createBot(bot_name1, false, null, (err, result) => {
            assert(result);
            assert(result.type === 'internal');
            assert(result.name === bot_name1);
            assert(result._id !== null);
            const bot1_id = result._id;
            tdclient.createBot(bot_name2, false, null, (err, result) => {
                assert(result);
                assert(result.type === 'internal');
                assert(result.name === bot_name2);
                assert(result._id !== null);
                const bot2_id = result._id;
                tdclient.getAllBots((err, result) => {
                    //console.log("bots:", result.length);
                    assert(result.length >= 2);
                    tdclient.deleteBot(bot1_id, (err, result) => {
                        assert(!err);
                        assert(result);
                        tdclient.deleteBot(bot2_id, (err, result) => {
                            assert(!err);
                            assert(result);
                            done();
                        });
                    });
                });
            });
        });
    });
    
});

// *********** INTENTS **********

describe('Intents', function() {
    
    it('create a Faq, query the faq by intent display name. 1. create a bot, 2. create a faq, 3. query the faq by intent display name, 4. delete created bot', (done) => {
        const bot_name = "my bot " + uuidv4();
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: LOG_STATUS
        })
        tdclient.createBot(bot_name, false, null, (err, thebot) => {
            //console.log("bot created:", thebot);
            assert(thebot);
            assert(thebot.type === 'internal');
            assert(thebot.name === bot_name);
            assert(thebot._id !== null);
            const intent_display_name = "mytestintent"
            tdclient.createIntent(thebot._id, intent_display_name, "My question", "My answer", "en", false, (err, thefaq) => {
                //console.log("intent created", thefaq);
                assert(thefaq);
                tdclient.getIntents(thebot._id, intent_display_name, 0, 0, null, (err, faqs) => {
                    assert(faqs.length == 1);
                    assert(faqs[0]);
                    assert(faqs[0].intent_display_name === intent_display_name);
                    tdclient.getIntents(thebot._id, "unknown", 0, 0, null, async (err, faqs) => {
                        assert(faqs.length == 0);
                        // test the Promise version
                        const awaited_faqs = await tdclient.getIntents(thebot._id, intent_display_name, 0, 0, null);
                        assert(awaited_faqs.length == 1);
                        assert(awaited_faqs[0]);
                        //console.log("awaited_faqs await", awaited_faqs[0]);
                        assert(awaited_faqs[0].intent_display_name === intent_display_name);
                        tdclient.deleteBot(thebot._id, (err, result) => {
                            assert(!err);
                            assert(result);
                            done();
                        });
                    });
                });
            });
        });
    });
});

// *********** ORCHESTERATION ***********

describe('Orchestration', function() {
    it('changeBot(). change a conversation bot (who had no bots)', (done) => {
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: false
        })
        // 1. Creates a request
        const text_value = 'test message';
        const request_id = TiledeskClient.newRequestId(PROJECT_ID);
        tdclient.sendSupportMessage(request_id, {text: text_value}, function(err, result) {
            assert(err === null);
            assert(result != null);
            assert(result.text === text_value);
            const bot_name = "my bot " + uuidv4();
            // 2. Creates a bot
            tdclient.createBot(bot_name, false, null, (err, bot) => {
                // console.log("bot created:", bot);
                assert(bot);
                assert(bot.type === 'internal');
                assert(bot.name === bot_name);
                assert(bot._id !== null);
                const bot_id = 'bot_' + bot._id;
                // 3. Changes the bot (adding effectively)
                tdclient.changeBot(request_id, bot_id, (err) => {
                    assert(err == null);
                    tdclient.getRequestById(request_id, (err, request) => {
                        assert(request.participantsBots != null);
                        assert(request.participantsBots.length > 0);
                        assert(request.participantsBots[0] === bot._id);
                        done();
                    });
                });
            });
        });
    });

    it('changeBot(). change a conversation bot (with a previous bot)', (done) => {
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: false
        })
        
        // 1. Creates a request
        const text_value = 'test message';
        const request_id = TiledeskClient.newRequestId(PROJECT_ID);
        tdclient.sendSupportMessage(request_id, {text: text_value}, function(err, result) {
            assert(err === null);
            assert(result != null);
            assert(result.text === text_value);
            const bot_name = "my bot " + uuidv4();
            // 2. Creates a bot
            tdclient.createBot(bot_name, false, null, (err, bot) => {
                // console.log("bot created:", bot);
                assert(bot);
                assert(bot.type === 'internal');
                assert(bot.name === bot_name);
                assert(bot._id !== null);
                const bot_id = 'bot_' + bot._id;
                // 3. Adds the bot to the request
                tdclient.addRequestParticipant(request_id, bot_id, (err, result) => {
                    const bot_name2 = "my bot " + uuidv4();
                    // 4. Creates a second bot
                    tdclient.createBot(bot_name2, false, null, (err, bot) => {
                        // console.log("bot2 created:", bot);
                        assert(bot);
                        assert(bot.type === 'internal');
                        assert(bot.name === bot_name2);
                        assert(bot._id !== null);
                        const bot_id2 = 'bot_' + bot._id;
                        // 5. Changes the bot
                        tdclient.changeBot(request_id, bot_id2, (err) => {
                            assert(err == null);
                            tdclient.getRequestById(request_id, (err, request) => {
                                assert(request.participantsBots != null);
                                assert(request.participantsBots.length > 0);
                                assert(request.participantsBots[0] === bot._id);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    it('replaceBot(). replace a conversation bot by bot-name (with a previous bot)', (done) => {
        const tdclient = new TiledeskClient(
        {
            APIKEY: APIKEY,
            APIURL: API_ENDPOINT,
            projectId: PROJECT_ID,
            token: USER_TOKEN,
            log: false
        })
        
        // 1. Creates a request
        const text_value = 'test message';
        const request_id = TiledeskClient.newRequestId(PROJECT_ID);
        tdclient.sendSupportMessage(request_id, {text: text_value}, function(err, result) {
            assert(err === null);
            assert(result != null);
            assert(result.text === text_value);
            const bot_name = "my bot " + uuidv4();
            // 2. Creates a bot
            tdclient.createBot(bot_name, false, null, (err, bot) => {
                // console.log("bot created:", bot);
                assert(bot);
                assert(bot.type === 'internal');
                assert(bot.name === bot_name);
                assert(bot._id !== null);
                const bot_id = 'bot_' + bot._id;
                // 3. Adds the bot to the request
                tdclient.addRequestParticipant(request_id, bot_id, (err, result) => {
                    const bot_name2 = "my bot " + uuidv4();
                    // 4. Creates a second bot
                    tdclient.createBot(bot_name2, false, null, (err, bot) => {
                        // console.log("bot2 created:", bot);
                        assert(bot);
                        assert(bot.type === 'internal');
                        assert(bot.name === bot_name2);
                        assert(bot._id !== null);
                        const bot_id2 = bot._id;
                        // 5. Changes the bot
                        tdclient.replaceBotByName(request_id, bot_name2, (err) => {
                            assert(err == null);
                            tdclient.getRequestById(request_id, (err, request) => {
                                assert(request.participantsBots != null);
                                assert(request.participantsBots.length > 0);
                                assert(request.participantsBots[0] === bot_id2);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
    
});

// **************** DEPARTMENTS *****************

describe('Departments', function() {
        it('createDepartment() getAllDepartments() deleteDepartment() getDepartment(). Creates 2 deps and gets all deps, then deletes the 2 deps.', (done) => {
            const dep_name1 = "my dep " + uuidv4();
            const dep_name2 = "my dep " + uuidv4();
            const tdclient = new TiledeskClient(
            {
                APIKEY: APIKEY,
                APIURL: API_ENDPOINT,
                projectId: PROJECT_ID,
                token: USER_TOKEN,
                log: this.LOG_STATUS
            })
            tdclient.createDepartment(dep_name1, null, null, null, (err, result) => {
                assert(result);
                assert(result.default === false);
                assert(result.routing === null);
                assert(result.name === dep_name1);
                assert(result._id !== null);
                const dep1_id = result._id;
                // console.log("dep1_id", dep1_id)
                tdclient.createDepartment(dep_name2, 'assigned', null, null, (err, result) => {
                    assert(result);
                    assert(result.default === false);
                    assert(result.name === dep_name2);
                    assert(result._id !== null);
                    const dep2_id = result._id;
                    // console.log("dep2_id", dep2_id)
                    tdclient.getDepartment(dep2_id, (err, result) => {
                        assert(!err);
                        assert(result);
                        assert(result.default === false);
                        assert(result.name === dep_name2);
                        assert(result.routing === 'assigned');
                        assert(result._id === dep2_id);
                        tdclient.getAllDepartments((err, result) => {
                            // console.log("deps:", result.length);
                            assert(result.length >= 2);
                            tdclient.deleteDepartment(dep1_id, (err, result) => {
                                assert(!err);
                                assert(result);
                                tdclient.deleteDepartment(dep2_id, (err, result) => {
                                    assert(!err);
                                    assert(result);
                                    done();
                                });
                            });
                        });
                    });
                    
                });
            });
        });
});