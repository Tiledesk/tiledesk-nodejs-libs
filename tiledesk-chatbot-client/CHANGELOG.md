# Node.js library to call Tiledesk APIs from an external chatbot 

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