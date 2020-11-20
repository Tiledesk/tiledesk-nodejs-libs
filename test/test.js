var assert = require('assert');
const { TiledeskClient } = require('../tiledesk-client');

const project_id = "5fb8137070e3c1001928efd7";
const api_endpoint = TiledeskClient.DEFAULT_API_ENDPOINT;
const username = "test@tiledesk.com";
const password = "test";

describe('TiledeskClient', function() {
  describe('fireEvent()', function() {
    it('should return the event echo json if fired correctly', function() {
        TiledeskClient.anonymousAuthentication(
            project_id,
            function(err, response, resbody) {
                if (!err && resbody.user) {
                    const tdclient = new TiledeskClient(
                    {
                        projectId: project_id,
                        token: resbody.token
                    });
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
                    tdclient.fireEvent(event, function(err, response, resbody) {
                        assert.strictEqual(resbody.name, "faqbot.answer_not_found");
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
    describe('anonymousAuthentication()', function() {
        it('should return the auth token', function() {
            TiledeskClient.anonymousAuthentication(
                project_id,
                function(err, response, resbody) {
                    if (!err && resbody) {
                        assert(resbody.token != null);
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
    describe('openNow()', function() {
        it('should return true if open', function() {
            TiledeskClient.anonymousAuthentication(
                project_id,
                function(err, response, resbody) {
                  if (!err && resbody.user) {
                    const tdclient = new TiledeskClient(
                    {
                        projectId: project_id,
                        token: resbody.token
                    });
                    tdclient.openNow(function(is_open) {
                        assert(is_open === true);
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