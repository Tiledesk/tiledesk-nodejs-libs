# Node.js library to call Tiledesk APIs from an external chatbot 

### 0.5.16
- removed: sendMessageRaw
- added member: tiledeskClient, the tiledesk client preconfigured on this chatbot webhook http request with projectId, token and API_ENDPOINT got from the current request payload
- updateLeadEmailFullname: now uses tiledeskClient
- updateDepartment: now uses tiledeskClient
- updateRequest: now uses tiledeskClient
- sendMessage: now uses tiledeskClient