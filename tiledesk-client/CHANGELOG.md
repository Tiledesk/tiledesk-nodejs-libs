# Client library for Tiledesk nodejs APIs client

### 0.8.3
- changed method signature (token first): customAuthentication(token, apikey, options, callback)

### 0.8.2
- 'project_id' instance property and constructor options property renamed in 'projectId' (camel case)
- updateDepartment() renamed in updateRequestDepartment()
- updateRequestDepartment: in options parameter added 'nobot' option
- added updateProjectUser()
- added documentation with jsdoc
- added getAllRequests()
- added test case for getRequestById()
- sendDirectMessage() renamed in sendChatMessage()
- sendMessage() renamed in sendSupportMessage()
- added newRequestId()
- anonymousAuthentication(callback, options) signature refactored (removed first 'projectId' param, added 'options' param)
- added Axios. Removed Request.
- anonymousAuthentication(), customAuthentication(), authEmailPassword() are now 'static'. Signature modifed to provide 'apikey' and options (APIURL, log).
- options.projectId and options.token are now mandatory in constructor()
- removed tail 'options' parameter from all calls.

### 0.7.14 - online
- added getRequestById()

### 0.7.13 - online
- bug fix - removed from updateLeadEmailFullname(): throw new Error('options.lead_id can NOT be empty.');

### 0.7.12 - online
- added sendDirectMessage()

### 0.7.11 - online
- bug fix - some projectId to project_id

### 0.7.10 - online
- removed token as explicit parameter in some function calls. token is now an optional constructor parameter. It's also supported by "options" parameter in some function calls.
- added customAuthentication()

### 0.7.9 - online
- Added "options" parameter some function calls.
- removed project_id as explicit parameter in some function calls. project_id is now an optional constructor parameter. It's also supported by "options" parameter in some function calls.
- added customAuthentication()

### 0.7.8 - online
- bug fix - Added missing jwt_token() to sendMessage and more.

### 0.7.7 - online
- bug fix: APIURL

### 0.7.6 - online
- added updateProjectUserCurrentlyLoggedIn
- added "options" as last parameter of getRequests to allow adding additional params as no_populate, snap_department etc.

### 0.7.5 - online
- error log refactored adding request and response headers of the http-request

### 0.7.4 - online
- for each call always do: const jwt_token = TiledeskClient.fixToken(token)
- added err.options in error obj replies
- improved log
- added getProjectUser() to test

### 0.7.3 - online
- removed the unused, undocumented "getAllProjectUsers()"


### 0.7.2 - online
- bug fix

### 0.7.1 - online
- Removed raw methods, now creating an instance of TiledeskClient is mandatory, see test 'init()'
- APIKEY is mandatory
- added option to log request and response HTTP calls, see test for the howto
- added automated testing

### 0.6.36 - online
- some methods refactoring

### 0.6.27 - online
- added updateLeadEmailFullname()
- added updateDepartment()
- added updateRequest()
- added dependency declaration in package.json: "request": "^2.88.2"

### 0.6.26 - online
- SendMessageRaw fix: response not defined

### 0.6.25 - online
- introduced myrequest() to decouple "request" lib
- now each method shares the same return callback/error handling

### 0.6.24 - online
- getErr()

### 0.6.22 - online
- added some console.log to openNow()

### 0.6.21 - online
- added: moved request -> myrequesat for openNow()
- fixed: call of fixToken for openNow()

### 0.6.20
- added: test fireEvent()
- added: test anonymousAuthentication()
- added: test openNow()

### 0.6.19
- added: fireEvent() raw method
- added: fireEvent() instance method

### 0.6.18
- added: openNow() instance method
