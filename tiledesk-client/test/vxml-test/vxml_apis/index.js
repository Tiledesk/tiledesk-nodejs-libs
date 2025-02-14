const {TiledeskClient} = require('../../../index.js');
const Config = require('./ConfigApi.js');
const ManageCall = require('./ManageCall.js');

class VoiceConnectorTest {


    constructor(options){
        if (options && options.CONNECTOR_BASE_URL) {
            this.CONNECTOR_BASE_URL = options.CONNECTOR_BASE_URL
        }
        else {
            this.CONNECTOR_BASE_URL = TiledeskClient.DEFAULT_API_ENDPOINT;
        }
    
        if (!options.PROJECT_ID) {
            throw new Error('options.projectId can NOT be null.');
        }
        else {
            this.PROJECT_ID = options.PROJECT_ID;
        }
    
        if (!options.TOKEN) {
            throw new Error('options.token can NOT be null.');
        }
        else {
            // this.token = options.token;
            this.JWT_TOKEN = VoiceConnectorTest.fixToken(options.TOKEN)
        }
      
        if (options.httpsOptions) {
            this.httpsOptions = options.httpsOptions;
        }
    
        this.log = false;
        if (options.log) {
            this.log = options.log;
        }

        this.configConnector = new Config(this.CONNECTOR_BASE_URL, this.PROJECT_ID, this.JWT_TOKEN)
        this.manageCall = new ManageCall(this.CONNECTOR_BASE_URL, this.PROJECT_ID, this.JWT_TOKEN)


    }

    static fixToken(token) {
        if (token.startsWith('JWT ')) {
          return token
        }
        else {
          return 'JWT ' + token
        }
    }
    
}

module.exports= VoiceConnectorTest