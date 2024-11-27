
const { v4: uuidv4 } = require('uuid');
const Utils = require('./utils')

class Department {
    constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG){
        this.APIURL = APIURL;
        this.PROJECT_ID = PROJECT_ID;
        this.JWT_TOKEN = JWT_TOKEN;
        this.LOG = LOG
    }


    async getDepartments() {
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/projects/${this.PROJECT_ID}/departments`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                json: true,
                method: 'GET',
                httpsOptions: this.httpsOptions
            };
            Utils.myrequest(
                HTTPREQUEST,
                function (err, resbody) {
                    if (err) {
                        if (callback) {
                            reject(err)
                            callback(err);
                        }
                    }
                    else {
                        resolve(resbody)
                        if (callback) {
                            callback(null, resbody);
                        }
                    }
                }, this.log
            );
        });
        
    }

    async createDepartment(depName, bot_id) {
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/${this.PROJECT_ID}/departments`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                json: {
                    id_bot :  bot_id,
                    id_project :  this.PROJECT_ID,
                    name :  depName,
                    routing :  "assigned", 
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
                        resolve(resbody)
                        
                    }
                }, this.LOG
            );
        });
        
    }

    async deleteDepartment(depId, callback) {
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/${this.PROJECT_ID}/departments/${depId}`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                method: 'DELETE',
                httpsOptions: this.httpsOptions
            };
            Utils.myrequest(
                HTTPREQUEST,
                function (err, resbody) {
                    if (err) {
                        if (callback) {
                            callback(err);
                        }
                        reject(err)
                    }
                    else {
                        if (callback) {
                            callback(null, resbody); 
                        }
                        resolve(resbody)
                    }
                }, this.log
            );

        });
    }
}

module.exports = Department