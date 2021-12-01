var assert = require('assert');
const { TiledeskChatbotClient } = require('..');
const { TiledeskClient } = require('@tiledesk/tiledesk-client');

const APIKEY = "__APIKEY__";
const API_ENDPOINT = "https://tiledesk-server-pre.herokuapp.com"; //TiledeskClient.DEFAULT_API_ENDPOINT;
const LOG_STATUS = false;
const WEBHOOK_REQUEST_BODY = {
	"timestamp": 1616144169190,
	"payload": {
		"senderFullname": "Bot",
		"type": "text",
		"channel_type": "group",
		"status": 0,
		"_id": "605467285812d60034c6cc97",
		"sender": "system",
		"recipient": "support-group-b82ed6aa-bd69-4d51-8ee6-59cf9fa6fa83",
		"text": "\\start",
		"id_project": "5fc4c150f2fc4d0034b96e50",
		"createdBy": "system",
		"attributes": {
			"subtype": "info",
			"updateconversation": false,
			"tiledesk_message_id": "605467285812d60034c6cc97",
			"projectId": "5fc4c150f2fc4d0034b96e50"
		},
		"channel": {
			"name": "chat21"
		},
		"createdAt": "2021-03-19T08:56:08.839Z",
		"updatedAt": "2021-03-19T08:56:08.839Z",
		"__v": 0,
		"request": {
			"_id": "605467265812d60034c6cc77",
			"status": 200,
			"preflight": true,
			"hasBot": true,
			"participants": ["bot_5fc4c193f2fc4d0034b96e70"],
			"participantsAgents": [],
			"participantsBots": ["5fc4c193f2fc4d0034b96e70"],
			"request_id": "support-group-b82ed6aa-bd69-4d51-8ee6-59cf9fa6fa83",
			"requester": {
				"_id": "6045ee769c259c0034e09936",
				"user_available": true,
				"number_assigned_requests": 0,
				"last_login_at": "2021-03-07T17:47:45.393Z",
				"status": "active",
				"id_project": "5fc4c150f2fc4d0034b96e50",
				"uuid_user": "b930fcb0-e2b4-4677-b2a3-0712cfd08033",
				"role": "guest",
				"createdBy": "b930fcb0-e2b4-4677-b2a3-0712cfd08033",
				"createdAt": "2021-03-08T09:29:26.081Z",
				"updatedAt": "2021-03-19T08:54:12.154Z",
				"__v": 0,
				"presence": {
					"status": "online",
					"changedAt": "2021-03-19T08:54:12.133Z"
				}
			},
			"lead": {
				"_id": "6045ee819c259c0034e099eb",
				"status": 100,
				"lead_id": "b930fcb0-e2b4-4677-b2a3-0712cfd08033",
				"fullname": "Andrea",
				"email": "andreasponziello@tiledesk.com",
				"attributes": {
					"departmentId": "5fc4c150f2fc4d0034b96e52",
					"departmentName": "Default Department",
					"ipAddress": "151.46.166.44",
					"client": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36",
					"sourcePage": "https://widget-pre.tiledesk.com/v5/assets/twp/index.html?tiledesk_projectid=5fc4c150f2fc4d0034b96e50&project_name=Microlang%20Dialogflow%20test%20-%20PRE&isOpen=true",
					"projectId": "5fc4c150f2fc4d0034b96e50",
					"requester_id": "b930fcb0-e2b4-4677-b2a3-0712cfd08033",
					"payload": [],
					"privacyApproved": false,
					"userFullname": "Andrea",
					"userEmail": "andreasponziello@tiledesk.com",
					"subtype": "info"
				},
				"id_project": "5fc4c150f2fc4d0034b96e50",
				"createdBy": "system",
				"tags": [],
				"createdAt": "2021-03-08T09:29:37.998Z",
				"updatedAt": "2021-03-17T10:01:41.031Z",
				"__v": 0
			},
			"first_text": "welcome",
			"department": {
				"_id": "5fc4c150f2fc4d0034b96e52",
				"routing": "assigned",
				"default": true,
				"status": 1,
				"name": "Default Department",
				"id_project": "5fc4c150f2fc4d0034b96e50",
				"createdBy": "5e09d16d4d36110017506d7f",
				"createdAt": "2020-11-30T09:54:24.671Z",
				"updatedAt": "2020-11-30T09:56:19.322Z",
				"__v": 0,
				"id_bot": "5fc4c193f2fc4d0034b96e70",
				"id_group": null,
				"bot": {
					"webhook_enabled": false,
					"type": "dialogflow",
					"_id": "5fc4c193f2fc4d0034b96e70",
					"name": "Techy",
					"id_project": "5fc4c150f2fc4d0034b96e50",
					"trashed": false,
					"createdBy": "5e09d16d4d36110017506d7f",
					"createdAt": "2020-11-30T09:55:31.698Z",
					"updatedAt": "2020-11-30T10:09:21.080Z",
					"__v": 0,
					"url": "https://tiledesk-df-connector-pre.herokuapp.com/tdbot/"
				}
			},
			"agents": [{
				"user_available": false,
				"number_assigned_requests": 0,
				"last_login_at": "2020-12-10T08:01:40.350Z",
				"status": "active",
				"_id": "5fd25eea5355ad0034940811",
				"id_project": "5fc4c150f2fc4d0034b96e50",
				"id_user": "5aaa99024c3b110014b478f0",
				"role": "admin",
				"createdBy": "5e09d16d4d36110017506d7f",
				"createdAt": "2020-12-10T17:46:18.593Z",
				"updatedAt": "2020-12-10T17:46:18.593Z",
				"__v": 0,
				"presence": {
					"status": "online",
					"changedAt": "2021-03-18T09:57:55.248Z"
				},
				"settings": {
					"email": {
						"notification": {
							"conversation": {
								"assigned": {
									"toyou": true
								},
								"pooled": true
							}
						}
					}
				}
			}, {
				"user_available": false,
				"number_assigned_requests": 0,
				"last_login_at": "2020-12-30T08:44:40.475Z",
				"status": "active",
				"_id": "5fec3e19f3c2a3003485df4d",
				"id_project": "5fc4c150f2fc4d0034b96e50",
				"id_user": "5ddd30bff0195f0017f72c6d",
				"role": "admin",
				"createdBy": "5e09d16d4d36110017506d7f",
				"createdAt": "2020-12-30T08:45:13.784Z",
				"updatedAt": "2020-12-30T08:45:13.784Z",
				"__v": 0,
				"presence": {
					"status": "online",
					"changedAt": "2021-03-10T17:12:41.006Z"
				}
			}, {
				"user_available": false,
				"number_assigned_requests": 0,
				"last_login_at": "2020-11-30T06:51:13.693Z",
				"status": "active",
				"_id": "5fc4c150f2fc4d0034b96e51",
				"id_project": "5fc4c150f2fc4d0034b96e50",
				"id_user": "5e09d16d4d36110017506d7f",
				"role": "owner",
				"createdBy": "5e09d16d4d36110017506d7f",
				"createdAt": "2020-11-30T09:54:24.625Z",
				"updatedAt": "2020-11-30T09:54:24.625Z",
				"__v": 0,
				"presence": {
					"status": "online",
					"changedAt": "2021-03-17T14:25:33.791Z"
				}
			}],
			"sourcePage": "https://widget-pre.tiledesk.com/v5/assets/twp/index.html?tiledesk_projectid=5fc4c150f2fc4d0034b96e50&project_name=Dialogflow%20Connector%20test%20-%20PRE&isOpen=true",
			"language": "it",
			"userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
			"attributes": {
				"departmentId": "5fc4c150f2fc4d0034b96e52",
				"departmentName": "Default Department",
				"ipAddress": "151.43.150.222",
				"client": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
				"sourcePage": "https://widget-pre.tiledesk.com/v5/assets/twp/index.html?tiledesk_projectid=5fc4c150f2fc4d0034b96e50&project_name=Dialogflow%20Connector%20test%20-%20PRE&isOpen=true",
				"projectId": "5fc4c150f2fc4d0034b96e50",
				"requester_id": "b930fcb0-e2b4-4677-b2a3-0712cfd08033",
				"payload": [],
				"privacyApproved": false,
				"userFullname": "Andrea",
				"userEmail": "andreasponziello@tiledesk.com",
				"subtype": "info"
			},
			"id_project": "5fc4c150f2fc4d0034b96e50",
			"createdBy": "b930fcb0-e2b4-4677-b2a3-0712cfd08033",
			"channel": {
				"name": "chat21"
			},
			"snapshot": {
				"department": {
					"routing": "assigned",
					"default": true,
					"status": 1,
					"_id": "5fc4c150f2fc4d0034b96e52",
					"name": "Default Department",
					"id_project": "5fc4c150f2fc4d0034b96e50",
					"createdBy": "5e09d16d4d36110017506d7f",
					"createdAt": "2020-11-30T09:54:24.671Z",
					"updatedAt": "2021-03-19T08:56:08.750Z",
					"__v": 0,
					"id_bot": "5fc4c193f2fc4d0034b96e70",
					"id_group": null
				},
				"agents": [{
					"user_available": false,
					"number_assigned_requests": 0,
					"last_login_at": "2020-12-10T08:01:40.350Z",
					"status": "active",
					"_id": "5fd25eea5355ad0034940811",
					"id_project": "5fc4c150f2fc4d0034b96e50",
					"id_user": "5aaa99024c3b110014b478f0",
					"role": "admin",
					"createdBy": "5e09d16d4d36110017506d7f",
					"createdAt": "2020-12-10T17:46:18.593Z",
					"updatedAt": "2020-12-10T17:46:18.593Z",
					"__v": 0,
					"presence": {
						"status": "online",
						"changedAt": "2021-03-18T09:57:55.248Z"
					},
					"settings": {
						"email": {
							"notification": {
								"conversation": {
									"assigned": {
										"toyou": true
									},
									"pooled": true
								}
							}
						}
					}
				}, {
					"user_available": false,
					"number_assigned_requests": 0,
					"last_login_at": "2020-12-30T08:44:40.475Z",
					"status": "active",
					"_id": "5fec3e19f3c2a3003485df4d",
					"id_project": "5fc4c150f2fc4d0034b96e50",
					"id_user": "5ddd30bff0195f0017f72c6d",
					"role": "admin",
					"createdBy": "5e09d16d4d36110017506d7f",
					"createdAt": "2020-12-30T08:45:13.784Z",
					"updatedAt": "2020-12-30T08:45:13.784Z",
					"__v": 0,
					"presence": {
						"status": "online",
						"changedAt": "2021-03-10T17:12:41.006Z"
					}
				}, {
					"user_available": false,
					"number_assigned_requests": 0,
					"last_login_at": "2020-11-30T06:51:13.693Z",
					"status": "active",
					"_id": "5fc4c150f2fc4d0034b96e51",
					"id_project": "5fc4c150f2fc4d0034b96e50",
					"id_user": "5e09d16d4d36110017506d7f",
					"role": "owner",
					"createdBy": "5e09d16d4d36110017506d7f",
					"createdAt": "2020-11-30T09:54:24.625Z",
					"updatedAt": "2020-11-30T09:54:24.625Z",
					"__v": 0,
					"presence": {
						"status": "online",
						"changedAt": "2021-03-17T14:25:33.791Z"
					}
				}],
				"requester": {
					"user_available": true,
					"number_assigned_requests": 0,
					"last_login_at": "2021-03-07T17:47:45.393Z",
					"status": "active",
					"_id": "6045ee769c259c0034e09936",
					"id_project": "5fc4c150f2fc4d0034b96e50",
					"uuid_user": "b930fcb0-e2b4-4677-b2a3-0712cfd08033",
					"role": "guest",
					"createdBy": "b930fcb0-e2b4-4677-b2a3-0712cfd08033",
					"createdAt": "2021-03-08T09:29:26.081Z",
					"updatedAt": "2021-03-08T09:29:26.081Z",
					"__v": 0,
					"presence": {
						"status": "online",
						"changedAt": "2021-03-19T08:54:12.133Z"
					}
				},
				"lead": {
					"status": 100,
					"_id": "6045ee819c259c0034e099eb",
					"lead_id": "b930fcb0-e2b4-4677-b2a3-0712cfd08033",
					"fullname": "Andrea",
					"email": "andreasponziello@tiledesk.com",
					"attributes": {
						"departmentId": "5fc4c150f2fc4d0034b96e52",
						"departmentName": "Default Department",
						"ipAddress": "151.46.166.44",
						"client": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36",
						"sourcePage": "https://widget-pre.tiledesk.com/v5/assets/twp/index.html?tiledesk_projectid=5fc4c150f2fc4d0034b96e50&project_name=Microlang%20Dialogflow%20test%20-%20PRE&isOpen=true",
						"projectId": "5fc4c150f2fc4d0034b96e50",
						"requester_id": "b930fcb0-e2b4-4677-b2a3-0712cfd08033",
						"payload": [],
						"privacyApproved": false,
						"userFullname": "Andrea",
						"userEmail": "andreasponziello@tiledesk.com",
						"subtype": "info"
					},
					"id_project": "5fc4c150f2fc4d0034b96e50",
					"createdBy": "system",
					"tags": [],
					"createdAt": "2021-03-08T09:29:37.998Z",
					"updatedAt": "2021-03-08T09:29:37.998Z",
					"__v": 0
				}
			},
			"tags": [],
			"notes": [],
			"channelOutbound": {
				"name": "chat21"
			},
			"createdAt": "2021-03-19T08:56:07.046Z",
			"updatedAt": "2021-03-19T08:56:08.751Z",
			"__v": 1,
			"location": {
				"geometry": {
					"type": "Point",
					"coordinates": [43.1479, 12.1097]
				},
				"country": "IT",
				"ipAddress": "151.43.150.222"
			},
			"assigned_at": "2021-03-19T08:56:08.731Z",
			"participatingAgents": [],
			"participatingBots": [{
				"_id": "5fc4c193f2fc4d0034b96e70",
				"type": "dialogflow",
				"name": "Techy",
				"id_project": "5fc4c150f2fc4d0034b96e50",
				"trashed": false,
				"createdBy": "5e09d16d4d36110017506d7f",
				"createdAt": "2020-11-30T09:55:31.698Z",
				"updatedAt": "2020-11-30T10:09:21.080Z",
				"__v": 0,
				"url": "https://tiledesk-df-connector-pre.herokuapp.com/tdbot/"
			}]
		}
	},
	"hook": {
		"webhook_enabled": false,
		"type": "dialogflow",
		"_id": "5fc4c193f2fc4d0034b96e70",
		"name": "Techy",
		"id_project": "5fc4c150f2fc4d0034b96e50",
		"trashed": false,
		"createdBy": "5e09d16d4d36110017506d7f",
		"createdAt": "2020-11-30T09:55:31.698Z",
		"updatedAt": "2020-11-30T10:09:21.080Z",
		"__v": 0,
		"url": "https://tiledesk-df-connector-pre.herokuapp.com/tdbot/"
	},
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3ZWJob29rX2VuYWJsZWQiOmZhbHNlLCJ0eXBlIjoiZGlhbG9nZmxvdyIsIl9pZCI6IjVmYzRjMTkzZjJmYzRkMDAzNGI5NmU3MCIsIm5hbWUiOiJUZWNoeSIsImlkX3Byb2plY3QiOiI1ZmM0YzE1MGYyZmM0ZDAwMzRiOTZlNTAiLCJ0cmFzaGVkIjpmYWxzZSwiY3JlYXRlZEJ5IjoiNWUwOWQxNmQ0ZDM2MTEwMDE3NTA2ZDdmIiwiY3JlYXRlZEF0IjoiMjAyMC0xMS0zMFQwOTo1NTozMS42OThaIiwidXBkYXRlZEF0IjoiMjAyMC0xMS0zMFQxMDowOToyMS4wODBaIiwiX192IjowLCJ1cmwiOiJodHRwczovL3RpbGVkZXNrLWRmLWNvbm5lY3Rvci1wcmUuaGVyb2t1YXBwLmNvbS90ZGJvdC8iLCJpYXQiOjE2MTYxNDQxNjksImF1ZCI6Imh0dHBzOi8vdGlsZWRlc2suY29tL2JvdHMvNWZjNGMxOTNmMmZjNGQwMDM0Yjk2ZTcwIiwiaXNzIjoiaHR0cHM6Ly90aWxlZGVzay5jb20iLCJzdWIiOiJib3QiLCJqdGkiOiJlNjE2MWQ0Yy03MWJmLTQxNDctODAwOC1lZmRjYzFhNzBkMDgifQ.fwqw0tcEAtwP_Ev4ozLl6oP8ShPOdfhkAwT-VpYG7Vs"
};

const WEBHOOK_REQUEST = {
  body: WEBHOOK_REQUEST_BODY
};

describe('TiledeskChatbotClient', function() {
    describe('init()', function() {
      it('should return a new TiledeskChatbotClient', function() {
          const cbclient = new TiledeskChatbotClient({
              APIKEY: APIKEY,
              APIURL: API_ENDPOINT,
              requestId: "support-group-...",
              token: "TOKENUID",
              projectId: "PROJECTID",
              log: LOG_STATUS
          })
          if (cbclient) {
            assert(cbclient != null);
            assert(cbclient.tiledeskClient.APIKEY === APIKEY);
            assert(cbclient.tiledeskClient.APIURL === cbclient.APIURL);
            assert(cbclient.tiledeskClient.log === LOG_STATUS);
          }
          else {
              assert.ok(false);
          }
      });
    });
});

describe('TiledeskChatbotClient', function() {
  describe('init() with webhook request', function() {
    it('should return a new TiledeskChatbotClient', function() {
        const cbclient = new TiledeskChatbotClient({
          APIKEY: APIKEY,
          APIURL: API_ENDPOINT,
          request: WEBHOOK_REQUEST,
          log: LOG_STATUS
        });
        if (cbclient) {
          assert(cbclient != null);
          assert(cbclient.tiledeskClient != null);
          assert(cbclient.tiledeskClient.APIKEY === APIKEY);
          assert(cbclient.tiledeskClient.APIURL === cbclient.APIURL);
          assert(cbclient.tiledeskClient.projectId === WEBHOOK_REQUEST.body.payload.id_project);
          assert(cbclient.tiledeskClient.jwt_token === TiledeskClient.fixToken(WEBHOOK_REQUEST.body.token));
          assert(cbclient.supportRequest != null);
          assert(cbclient.tiledeskClient.log === LOG_STATUS);
          // chatbot object
          assert(cbclient.requestId === WEBHOOK_REQUEST.body.payload.request.request_id);
        }
        else {
            assert.ok(false);
        }
    });
  });
});

describe('TiledeskClient', function() {
  describe('sendMessage()', function() {
      it('sends a message to the chatbot request conversation', function(done) {
        const cbclient = new TiledeskChatbotClient({
          APIKEY: APIKEY,
          APIURL: API_ENDPOINT,
          request: WEBHOOK_REQUEST,
          log: LOG_STATUS
        });
        assert(cbclient != null);
        assert(cbclient.tiledeskClient != null);
        assert(cbclient.tiledeskClient.APIKEY === APIKEY);
        assert(cbclient.tiledeskClient.APIURL === cbclient.APIURL);
        assert(cbclient.tiledeskClient.projectId === WEBHOOK_REQUEST.body.payload.id_project);
        assert(cbclient.tiledeskClient.jwt_token === TiledeskClient.fixToken(WEBHOOK_REQUEST.body.token));
        assert(cbclient.supportRequest != null);
        assert(cbclient.tiledeskClient.log === LOG_STATUS);
        const text_value = 'test message';
        cbclient.sendMessage({text: text_value}, function(err, result) {
          // console.log("err", err)
            assert(err === null);
            assert(result != null);
            assert(result.text === text_value);
            done();
        });
      });
  });
});
