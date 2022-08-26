var assert = require('assert');
const { HelpCenterQuery } = require('..');
require('dotenv').config();

const PROJECT_ID = process.env.PROJECT_ID;
const WORKSPACE_ID = process.env.WORKSPACE_ID;
const API_ENDPOINT = process.env.API_ENDPOINT;
const APIKEY = process.env.APIKEY;
const LOG_STATUS = (process.env.LOG_STATUS && process.env.LOG_STATUS) === 'true' ? true : false;

describe('HelpCenterQuery test', function() {
    it('should return a new HelpCenterQuery', function() {
        const helpcenter = new HelpCenterQuery({
            APIKEY: APIKEY,
            projectId: PROJECT_ID,
            workspaceId: WORKSPACE_ID
        });
        if (helpcenter) {
            assert(helpcenter != null);
            assert(helpcenter.projectId === PROJECT_ID);
            assert(helpcenter.workspaceId === WORKSPACE_ID);
            assert(helpcenter.APIKEY === APIKEY);
        }
        else {
            assert.ok(false);
        }

        const helpcenter_full_init = new HelpCenterQuery({
            APIKEY: APIKEY,
            projectId: PROJECT_ID,
            workspaceId: WORKSPACE_ID,
            APIURL: API_ENDPOINT,
            log: true
        });
        if (helpcenter_full_init) {
            assert(helpcenter_full_init != null);
            assert(helpcenter_full_init.projectId === PROJECT_ID);
            assert(helpcenter_full_init.workspaceId === WORKSPACE_ID);
            assert(helpcenter_full_init.APIKEY === APIKEY);
            assert(helpcenter_full_init.APIURL === API_ENDPOINT);
            assert(helpcenter_full_init.log === true);
        }
        else {
            assert.ok(false);
        }
    });

    it('should return the auth token', function(done) {
        const helpcenter = new HelpCenterQuery({
            APIKEY: APIKEY,
            projectId: PROJECT_ID,
            workspaceId: WORKSPACE_ID
        });
        text_to_search = "military";
        maxresults = 3;
        helpcenter.search(text_to_search, maxresults, (err, results) => {
            console.log("results:", results)
            assert(results[0].title)
            assert(results[0].score)
            assert(results[0].url)
            if (err) {
              console.error("HelpCenter Error:", err);
              assert.ok(false);
            }
            assert(results)
            assert(results.length > 0);
            done();
        });
    });
    
});