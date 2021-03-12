var assert = require('assert');
const { TiledeskChatbotClient } = require('..');

describe('TiledeskChatbotClient', function() {
    describe('init()', function() {
      it('should return a new TiledeskChatbotClient', function() {
          const APIKEY = "__APIKEY__";
          const APIURL = "https://tiledesk-server-pre.herokuapp.com/v3";
          const LOG = true;
          const cbclient = new TiledeskChatbotClient({
              APIKEY: APIKEY,
              APIURL: APIURL,
              request_id: "support-group-...",
              token: "TOKENUID",
              project_id: "PROJECTID",
              log: LOG
          })
          if (cbclient) {
            assert(cbclient != null);
            assert(cbclient.tiledeskClient.APIKEY === APIKEY);
            assert(cbclient.tiledeskClient.APIURL === cbclient.APIURL);
            assert(cbclient.tiledeskClient.log === LOG);
          }
          else {
              assert.ok(false);
          }
      });
    });
});
