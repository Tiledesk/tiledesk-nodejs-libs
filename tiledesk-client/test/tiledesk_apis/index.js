const Department = require('./TdDeparmentApi')
const Project = require('./TdProjectsApi')
const Request = require('./TdRequestApi')
const User = require('./TdUserApi')
const Lead = require('./TdLeadApi')
const Tag = require('./TdTagApi')
const Chatbot = require('./TdChatbotApi')
const {TiledeskClient} = require('../../index.js')

class TiledeskClientTest {


    constructor(options){
        if (options && options.APIURL) {
            this.APIURL = options.APIURL
        }
        else {
            this.APIURL = TiledeskClient.DEFAULT_API_ENDPOINT;
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
            this.JWT_TOKEN = TiledeskClientTest.fixToken(options.TOKEN)
        }
      
        if (options.httpsOptions) {
            this.httpsOptions = options.httpsOptions;
        }
    
        this.log = false;
        if (options.log) {
            this.log = options.log;
        }

        this.project = new Project(this.APIURL, this.PROJECT_ID, this.JWT_TOKEN)
        this.department = new Department(this.APIURL, this.PROJECT_ID, this.JWT_TOKEN);
        this.chatbot = new Chatbot(this.APIURL, this.PROJECT_ID, this.JWT_TOKEN)
        this.request = new Request(this.APIURL, this.PROJECT_ID, this.JWT_TOKEN);
        this.user = new User(this.APIURL, this.PROJECT_ID, this.JWT_TOKEN,);
        this.lead = new Lead(this.APIURL, this.PROJECT_ID, this.JWT_TOKEN);
        this.tag = new Tag(this.APIURL, this.PROJECT_ID, this.JWT_TOKEN);

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

module.exports= TiledeskClientTest


