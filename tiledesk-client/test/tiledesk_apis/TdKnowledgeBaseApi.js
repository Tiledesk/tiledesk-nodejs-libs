const Utils = require("./utils");

class KnowledgeBase {

    constructor(APIURL, PROJECT_ID, JWT_TOKEN, LOG) {
        this.APIURL = APIURL;
        this.PROJECT_ID = PROJECT_ID;
        this.JWT_TOKEN = JWT_TOKEN;
        this.LOG = LOG
    }

    async getAllNamespaces() {
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/${this.PROJECT_ID}/kb/namespace/all`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                method: 'GET'
            };
            Utils.myrequest(
                HTTPREQUEST,
                (err, resbody) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(resbody);
                    }
                }, this.LOG
            )
        })
    }

    async addContentToNamespace(data) {
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/${this.PROJECT_ID}/kb/`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                json: data,
                method: 'POST'
            };
            Utils.myrequest(
                HTTPREQUEST,
                (err, resbody) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(resbody);
                    }
                }, this.LOG
            )
        })
    }

    async checkContentStatus(data) {
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/${this.PROJECT_ID}/kb/scrape/status`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                json: data,
                method: 'POST'
            };
            Utils.myrequest(
                HTTPREQUEST,
                (err, resbody) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(resbody);
                    }
                }, this.LOG
            )
        })
    }

    async deleteContent(content_id) {
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/${this.PROJECT_ID}/kb/${content_id}`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                method: 'DELETE'
            };
            Utils.myrequest(
                HTTPREQUEST,
                (err, resbody) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(resbody);
                    }
                }, this.LOG
            )
        })
    }

    async ask(data) {
        return new Promise((resolve, reject) => {
            const URL = `${this.APIURL}/${this.PROJECT_ID}/kb/qa`
            const HTTPREQUEST = {
                url: URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.JWT_TOKEN
                },
                json: data,
                method: 'POST'
            };
            Utils.myrequest(
                HTTPREQUEST,
                (err, resbody) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(resbody);
                    }
                }, this.LOG
            )
        })
    }
}

module.exports = KnowledgeBase