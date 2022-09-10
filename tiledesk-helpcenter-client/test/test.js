const { rejects } = require('assert');
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
            projectId: PROJECT_ID
        });
        if (helpcenter) {
            assert(helpcenter != null);
            assert(helpcenter.projectId === PROJECT_ID);
            assert(helpcenter.APIKEY === APIKEY);
        }
        else {
            assert.ok(false);
        }

        const helpcenter_full_init = new HelpCenterQuery({
            APIKEY: APIKEY,
            projectId: PROJECT_ID,
            APIURL: API_ENDPOINT,
            log: true
        });
        if (helpcenter_full_init) {
            assert(helpcenter_full_init != null);
            assert(helpcenter_full_init.projectId === PROJECT_ID);
            assert(helpcenter_full_init.APIKEY === APIKEY);
            assert(helpcenter_full_init.APIURL === API_ENDPOINT);
            assert(helpcenter_full_init.log === true);
        }
        else {
            assert.ok(false);
        }
    });

    it('should return search results', function(done) {
        const helpcenter = new HelpCenterQuery({
            APIKEY: APIKEY,
            projectId: PROJECT_ID
        });
        text_to_search = "military";
        maxresults = 3;
        helpcenter.search(WORKSPACE_ID, text_to_search, maxresults, (err, results) => {
            //console.log("search results:", results)
            assert(results)
            assert(results.length > 0);
            assert(results[0].title)
            assert(results[0].score)
            assert(results[0].url)
            if (err) {
              console.error("HelpCenter Error:", err);
              assert.ok(false);
            }
            done();
        });
    });

    it('should return search results async', async () => {
        const helpcenter = new HelpCenterQuery({
            APIKEY: APIKEY,
            projectId: PROJECT_ID
        });
        text_to_search = "military";
        maxresults = 3;
        try {
            const results = await helpcenter.search(WORKSPACE_ID, text_to_search, maxresults);
            // console.log("results:", results)
            assert(results);
            assert(results.length > 0);
            assert(results[0].title);
            assert(results[0].score);
            assert(results[0].url);
            assert.ok(true);
        }
        catch(err) {
            console.error("HelpCenter Error:", err);
            assert.ok(false);
        }
    });

    it('should return the workspaces list', function(done) {
        const helpcenter = new HelpCenterQuery({
            APIKEY: APIKEY,
            projectId: PROJECT_ID
        });
        helpcenter.allWorkspaces((err, workspaces) => {
            if (err) {
                console.error("HelpCenter Error:", err);
                assert.ok(false);
            }
            assert(workspaces.length === 3);
            assert(workspaces[0].name === "MyCompany");
            assert(workspaces[1].name === "The Tourist Guide");
            assert(workspaces[2].name === "Marketing Help");
            done();
        });
    });

    it('should return the workspaces list async', async () => {
        const helpcenter = new HelpCenterQuery({
            APIKEY: APIKEY,
            projectId: PROJECT_ID
        });
        try {
            const workspaces = await helpcenter.allWorkspaces();
            assert(workspaces.length === 3);
            assert(workspaces[0].name === "MyCompany");
            assert(workspaces[1].name === "The Tourist Guide");
            assert(workspaces[2].name === "Marketing Help");
            assert.ok(true);
        }
        catch(err) {
            console.error("HelpCenter Error:", err);
            assert.ok(false);
        }
    });

    it('Combinend. Gets workspaces list and run search on the first. Async', async () => {
        const helpcenter = new HelpCenterQuery({
            APIKEY: APIKEY,
            projectId: PROJECT_ID
        });
        try {
            const workspaces = await helpcenter.allWorkspaces();
            // console.log("workspaces:", workspaces);
            assert(workspaces.length === 3);
            assert(workspaces[0].name === "MyCompany");
            assert(workspaces[1].name === "The Tourist Guide");
            assert(workspaces[2].name === "Marketing Help");
            // allWorkspaces result example instance
            // [
                // {
                //   _id: '6308582654a7290023c4a3cf',
                //   project_id: '630858150da8e800358687cf',
                //   name: 'MyCompany',
                //   domain: null,
                //   default: true,
                //   custom_url: '1wkxie',
                //   language: 'en',
                //   deployed: true,
                //   deployedAt: '2022-08-26T05:24:19.537Z'
                // }
            // ]
            // now searching...
            text_to_search = "military";
            maxresults = 3;
            const results = await helpcenter.search(workspaces[0]._id, text_to_search, maxresults);
            assert(results);
            assert(results.length > 0);
            assert(results[0].title);
            assert(results[0].score);
            assert(results[0].url);
            assert.ok(true);
        }
        catch(err) {
            console.error("HelpCenter Error:", err);
            assert.ok(false);
        }
    });
    
});