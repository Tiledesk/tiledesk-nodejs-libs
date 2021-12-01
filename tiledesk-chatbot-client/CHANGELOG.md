# Node.js library to call Tiledesk APIs from an external chatbot 

### 0.5.30 - online
- removed Request dependency
- updated to TiledeskClient 0.8.5

### 0.5.29 - online
- - bug fix - supportRequest is a public property

### 0.5.28 - online
- updated dependency "@tiledesk/tiledesk-client": "^0.7.11"

### 0.5.27 - online
- bug fix
- testing improvements

### 0.5.26 - online
- updated dependency "@tiledesk/tiledesk-client": "^0.7.10"

### 0.5.25 - online
- bug fix

### 0.5.24 - online
- bug fix

### 0.5.23 - online
- introduced "log" property

### 0.5.22 - online
- bug fix

### 0.5.21 - online
- updated dependency "@tiledesk/tiledesk-client": "^0.7.7"

### 0.5.20 - online
- bug fix

### 0.5.19 - online
- added properties: this.chatbot_name, this.chatbot_id

### 0.5.18 - online
- updated dependency "@tiledesk/tiledesk-client": "^0.7.6"

### 0.5.17 - online
- updated dependency "@tiledesk/tiledesk-client": "^0.6.34"

### 0.5.16 - online
- removed: sendMessageRaw
- added member: tiledeskClient, the tiledesk client preconfigured on this chatbot webhook http request with projectId, token and API_ENDPOINT got from the current request payload
- updateLeadEmailFullname: now uses tiledeskClient
- updateDepartment: now uses tiledeskClient
- updateRequest: now uses tiledeskClient
- sendMessage: now uses tiledeskClient