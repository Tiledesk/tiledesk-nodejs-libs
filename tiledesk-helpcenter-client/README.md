Full [NodeJS API reference](https://tiledesk.github.io/tiledesk-nodejs-libs/TiledeskClient.html) is hosted on Github

# Introduction

Follow this guide to use the Tiledesk Helpcenter JavaScript SDK in your ``Node.js`` application.

Before you can add Tiledesk Helpcenter npm lib to your Node.js app, you need a [Tiledesk account](https://docs.tiledesk.com/knowledge-base/creating-a-tiledesk-account/) and a [Tiledesk project](https://docs.tiledesk.com/knowledge-base/creating-a-tiledesk-account/). Once you create your project you will have a _projectID_, a _user_ to play with project APIs.
Next you must create your own Helpcenter workspace (in one Tiledesk project you can create more Workspaces)

# Add Helpcenter to your project

Install ``HelpCenterQuery`` library with *npm* command:

```
npm install @tiledesk/helpcenter-query-client
```

Alternatively use package.json to import the library in the "dependencies" property, as in the following example:

```json
{
  "name": "Hello Tiledesk nodeJS",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@tiledesk/helpcenter-query-client": "^0.1.3"
  }
}
```

Then run

```
npm install
```

Once installed you can import ```HelpCenterQuery()``` class in your Node.js file using the "require" command:

```
const { HelpCenterQuery } = require('@tiledesk/helpcenter-query-client');
```

# The HelpCenterQuery class

To interact with Tiledesk Helpcenter APIs and query your documents you need to create an instance of a HelpCenterQuery() class using his constructor. You MUST supply an *APIKEY*, an existing *Project ID* and a valid *Workspace ID*.

Please refer to the official [Tiledesk Help Center guide](https://gethelp.tiledesk.com/articles/getting-started-with-help-center/) to better understand how Help Center works and how to get your *Workspace ID*.

In the next example we first authenticate using our user credentials, then we create a new TiledeskClient instance using a ``PROJECT_ID`` and the ``token`` we got from authentication:

```javascript
const helpcenter = new HelpCenterQuery({
  APIKEY: "__",
  projectId: "YOUR_PROJECT_ID",
  workspaceId: "YOUR_HELPCENTER_WORKSPACE_ID",
  log: false
});
```

# Query your Helpcenter Workspace

Once you created your Helpcenter instance you can query your workspace as in the following example:

```javascript
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
});
```

### Specify the API endpoint in instance methods

If instead you are using instance methods working with an instance of TiledeskClient, you must specify the parameter in the constructor config object as config.APIRUL:

```javascript
const helpcenter = new HelpCenterQuery({
  APIKEY: APIKEY,
  projectId: PROJECT_ID,
  workspaceId: WORKSPACE_ID,
  APIURL: API_ENDPOINT,
  log: true
});
```



