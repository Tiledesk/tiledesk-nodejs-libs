const bot = {
	"webhook_enabled": false,
	"language": "en",
	"name": "Hidden message Chatbot",
	"type": "tilebot",
	"attributes": null,
	"intents": [
	  {
		"webhook_enabled": false,
		"enabled": true,
		"actions": [
		  {
			"_tdActionTitle": "",
			"_tdActionId": "c4243d8b-e27c-40c0-895a-cada16d4420b",
			"_tdActionType": "reply",
			"attributes": {
			  "disableInputMessage": false,
			  "commands": [
				{
				  "type": "wait",
				  "time": 500
				},
				{
				  "type": "message",
				  "message": {
					"type": "text",
					"text": "Test hidden message",
					"attributes": {
					  "attachment": {
						"type": "template",
						"buttons": [
						  {
							"uid": "0b6a7decd4f74f75b21a4a3ca1c544ee",
							"type": "action",
							"value": "draft_request",
							"link": "",
							"target": "blank",
							"action": "#c1a041fd-e866-41df-989b-e5d9b145a599",
							"attributes": "",
							"show_echo": true,
							"alias": ""
						  },
						  {
							"uid": "f8dcce60ea3c4bffaa0a8ce144661cd5",
							"type": "action",
							"value": "no_draft_request",
							"link": "",
							"target": "blank",
							"action": "#5221dde8-c687-4a1b-8c50-870699f8e24c",
							"attributes": "",
							"show_echo": true,
							"alias": ""
						  }
						]
					  }
					}
				  }
				}
			  ]
			}
		  }
		],
		"intent_display_name": "welcome",
		"intent_id": "cec0304f-5bd4-4741-87b4-6693b87797a0",
		"language": "en",
		"attributes": {
		  "position": {
			"x": 635,
			"y": 119
		  },
		  "nextBlockAction": {
			"_tdActionTitle": "",
			"_tdActionId": "8fb40df2-fd33-46ef-a9fb-50e034e7e410",
			"_tdActionType": "intent",
			"intentName": null
		  }
		}
	  },
	  {
		"webhook_enabled": false,
		"enabled": true,
		"actions": [
		  {
			"_tdActionType": "reply",
			"text": "I didn't understand. Can you rephrase your question?",
			"attributes": {
			  "commands": [
				{
				  "type": "wait",
				  "time": 500
				},
				{
				  "type": "message",
				  "message": {
					"type": "text",
					"text": "I didn't understand. Can you rephrase your question?"
				  }
				}
			  ]
			}
		  }
		],
		"intent_display_name": "defaultFallback",
		"intent_id": "c4ca466b-8ee7-4df3-83f7-33e4dd51e767",
		"language": "en",
		"attributes": {
		  "position": {
			"x": 714,
			"y": 528
		  }
		}
	  },
	  {
		"webhook_enabled": false,
		"enabled": true,
		"actions": [
		  {
			"_tdActionType": "intent",
			"intentName": "#cec0304f-5bd4-4741-87b4-6693b87797a0",
			"_tdActionId": "548559d74ceb418da1d8bc0bbf1d88c3"
		  }
		],
		"intent_display_name": "start",
		"intent_id": "48673a18-d16f-4c2f-b9da-a4e1651ec7f8",
		"question": "\\start",
		"language": "en",
		"attributes": {
		  "position": {
			"x": 172,
			"y": 384
		  },
		  "nextBlockAction": {
			"_tdActionTitle": "",
			"_tdActionId": "b7fdeb73-d5c8-49bc-8995-0fd46a39034d",
			"_tdActionType": "intent"
		  }
		}
	  },
	  {
		"webhook_enabled": false,
		"enabled": true,
		"actions": [
		  {
			"_tdActionTitle": "",
			"_tdActionId": "97d03302-790d-4944-b488-5c64b4ab0d92",
			"_tdActionType": "hmessage",
			"attributes": {
			  "subtype": "info"
			},
			"text": "this is an hidden message not to sent"
		  },
		  {
			"_tdActionTitle": "",
			"_tdActionId": "e5c74e88-eb73-492a-ac07-8190e27fd2c8",
			"_tdActionType": "reply",
			"attributes": {
			  "disableInputMessage": false,
			  "commands": [
				{
				  "type": "wait",
				  "time": 500
				},
				{
				  "type": "message",
				  "message": {
					"type": "text",
					"text": "hidden message not sent: ok",
					"attributes": {
					  "attachment": {
						"type": "template",
						"buttons": []
					  }
					}
				  }
				}
			  ]
			}
		  }
		],
		"intent_display_name": "no_draft",
		"intent_id": "5221dde8-c687-4a1b-8c50-870699f8e24c",
		"language": "en",
		"attributes": {
		  "position": {
			"x": 1080,
			"y": 196
		  },
		  "nextBlockAction": {
			"_tdActionId": "a596376f-6be7-4121-8aac-2533b1e04e48",
			"_tdActionType": "intent",
			"intentName": ""
		  }
		}
	  },
	  {
		"webhook_enabled": false,
		"enabled": true,
		"actions": [
		  {
			"_tdActionTitle": "",
			"_tdActionId": "41e3661f-3a8a-4c22-95ba-3dbe305eb48b",
			"_tdActionType": "hmessage",
			"attributes": {
			  "subtype": "info"
			},
			"text": "this is an hidden message"
		  },
		  {
			"_tdActionTitle": "",
			"_tdActionId": "e5c74e88-eb73-492a-ac07-8190e27fd2c8",
			"_tdActionType": "reply",
			"attributes": {
			  "disableInputMessage": false,
			  "commands": [
				{
				  "type": "wait",
				  "time": 500
				},
				{
				  "type": "message",
				  "message": {
					"type": "text",
					"text": "hidden message sent: ok",
					"attributes": {
					  "attachment": {
						"type": "template",
						"buttons": []
					  }
					}
				  }
				}
			  ]
			}
		  }
		],
		"language": "en",
		"intent_display_name": "draft",
		"intent_id": "c1a041fd-e866-41df-989b-e5d9b145a599",
		"attributes": {
		  "position": {
			"x": 1026,
			"y": 1
		  },
		  "nextBlockAction": {
			"_tdActionId": "b715d893-12e0-46cf-adbe-a1fb70e2d5b5",
			"_tdActionType": "intent",
			"intentName": ""
		  },
		  "connectors": {}
		}
	  }
	]
}

module.exports = { bot: bot }