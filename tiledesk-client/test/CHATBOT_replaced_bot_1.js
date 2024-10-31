const bot = {
    "webhook_enabled": false,
    "language": "en",
    "name": "Replaced bot 1",
    "type": "tilebot",
    "intents": [
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionType": "intent",
                    "intentName": "#f0a479a9-258f-48bf-8638-fc48268902e9",
                    "_tdActionId": "e40547556386443bb7f81f32d926e8cf"
                }
            ],
            "intent_id": "bcf7d539-ea4e-495d-a75a-71cdc1b5b1fe",
            "question": "\\start",
            "intent_display_name": "start",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 172,
                    "y": 384
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "da05c202-7df5-48c8-add3-98b3e873c112",
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
                                    "text": "I'm replace bot 1",
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
                    "_tdActionId": "a571f8680d9a4bdf87bdc45039abb572"
                }
            ],
            "intent_id": "f0a479a9-258f-48bf-8638-fc48268902e9",
            "intent_display_name": "welcome",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 714,
                    "y": 113
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "391718ee-da0a-4447-af03-1cd75211c35c",
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
                                    "text": "Unused",
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
                    "_tdActionId": "661079d03e054916a277f811a199b9c8"
                }
            ],
            "intent_id": "8dd270b2-afff-4077-8643-4859b1b1f980",
            "intent_display_name": "defaultFallback",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 714,
                    "y": 528
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "555d0db4-469a-405e-9fc5-cf1b9b2f646b",
                    "_tdActionType": "intent"
                }
            }
        }
    ]
}

module.exports = { bot: bot };