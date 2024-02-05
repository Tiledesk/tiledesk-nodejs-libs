const bot = {
    "webhook_enabled": false,
    "language": "en",
    "name": "Basic Capture Reply",
    "type": "tilebot",
    "description": "A simple chatbot demonstrating the Capture User Reply.\nPlease refer to official documentation to learn how to use the Capture User Reply action\n\n[Capture user reply documentation](https://gethelp.tiledesk.com/articles/capture-user-reply-action/)",
    "attributes": {
        "variables": {
            "user_name": "user_name"
        }
    },
    "intents": [
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionType": "intent",
                    "intentName": "#7b547741-3361-4fa3-bf7a-2de08e460a6f",
                    "_tdActionId": "86cdc993206740ce8946e8dd83df5c42"
                }
            ],
            "intent_display_name": "start",
            "intent_id": "b97528b7-d148-4b5b-8c3e-6c10a1c27cc6",
            "question": "\\start",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 172,
                    "y": 384
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "a0658fcb-814c-476b-9472-15ec8494e332",
                    "_tdActionType": "intent"
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
                                    "text": "I didn't understand. Can you rephrase your question? {{last_user_text}}",
                                    "attributes": {
                                        "attachment": {
                                            "type": "template",
                                            "buttons": []
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    "_tdActionId": "2935e51d7de14bd1b1a76ff569875340"
                }
            ],
            "intent_display_name": "defaultFallback",
            "intent_id": "e42dfe4f-74dd-44c4-aba8-9a1eb6282b5d",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 714,
                    "y": 528
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "a1504622-f185-4a4b-ae8b-ffb4454572f3",
                    "_tdActionType": "intent"
                }
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
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
                                    "text": "What is your name?",
                                    "attributes": {
                                        "attachment": {
                                            "type": "template",
                                            "buttons": []
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    "text": "Hi, how can I help you?\r\n",
                    "_tdActionId": "e13f36512b67453f9ed0144a4a6275b6"
                },
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "69223dc7-5d20-44a3-9988-332095afa7a9",
                    "_tdActionType": "capture_user_reply",
                    "assignResultTo": "user_name"
                }
            ],
            "intent_display_name": "welcome",
            "intent_id": "7b547741-3361-4fa3-bf7a-2de08e460a6f",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 714,
                    "y": 113
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "3d0d4a9d-dc59-41ec-9fc3-f1ccd5f99e7b",
                    "_tdActionType": "intent",
                    "intentName": "#ef9be460-18a5-47d0-a161-a1ecb690a43a"
                }
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "edd4fd15-a7b7-47af-a8bb-3baca54bd0ce",
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
                                    "text": "Hi {{user_name}}",
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
            "intent_display_name": "hello user name",
            "intent_id": "ef9be460-18a5-47d0-a161-a1ecb690a43a",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 1203,
                    "y": 167.5
                },
                "nextBlockAction": {
                    "_tdActionId": "9ff850f4-6bd0-4484-822f-f9df4160cf09",
                    "_tdActionType": "intent",
                    "intentName": ""
                }
            }
        }
    ]
}

module.exports = { bot: bot };