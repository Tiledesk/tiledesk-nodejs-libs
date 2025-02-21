const Utils = require('./utils')

class Project {

    constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG){
        this.APIURL = APIURL;
        this.PROJECT_ID = PROJECT_ID;
        this.JWT_TOKEN = JWT_TOKEN;
        this.LOG = LOG;
    }


    async getProjects(){
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/projects/`
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
                        resolve(resbody)
                    }
                }, this.LOG
            );

        });
    }

    async getProject(){
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/projects/${this.PROJECT_ID}/`
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
                        resolve(resbody)
                    }
                }, this.log
            );

        });
    }

    async updateProject(data){
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/projects/${this.PROJECT_ID}/`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                json: data,
                method: 'PUT',
                httpsOptions: this.httpsOptions
            };
            Utils.myrequest(
                HTTPREQUEST,
                function (err, resbody) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(resbody)
                    }
                }, this.LOG
            );

        });
    }


}

module.exports = Project