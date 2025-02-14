const Utils = require('./utils')

class Config {

    constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG){
        this.APIURL = APIURL;
        this.PROJECT_ID = PROJECT_ID;
        this.JWT_TOKEN = JWT_TOKEN;
        this.LOG = LOG
    }

    
    async configure(){
        return new Promise((resolve, reject) => {
            let queryParams = '?project_id='+this.PROJECT_ID + '&token='+this.JWT_TOKEN

            const URL = `${this.APIURL}/manage/configure${queryParams}`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                method: 'GET',
                httpsOptions: this.httpsOptions
            };
            Utils.myrequest(
                HTTPREQUEST,
                function (err, resbody) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(resbody);
                    }
                }, this.LOG
            );
        });
    }

    async connect(department_id){
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/manage/update`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                json: {
                    project_id :  this.PROJECT_ID,
                    token :  this.JWT_TOKEN,
                    department :  department_id,
                },
                method: 'POST',
                httpsOptions: this.httpsOptions
            };
            Utils.myrequest(
                HTTPREQUEST,
                function (err, resbody) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(resbody);
                    }
                }, this.LOG
            );
        });
    }

    
}

module.exports = Config