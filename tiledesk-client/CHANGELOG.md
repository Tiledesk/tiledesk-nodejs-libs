# Client library for Tiledesk APIs for nodejs 

### 0.7.1 - onnline
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
