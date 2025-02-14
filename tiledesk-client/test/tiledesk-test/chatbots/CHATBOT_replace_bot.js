const bot = {
    "webhook_enabled": false,
    "language": "en",
    "name": "Replace Bot test",
    "type": "tilebot",
    "intents": [
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
                                    "text": "replacing bot...",
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
                    "_tdActionId": "e20051c72d774b4ea0e3b4eb08ba1908"
                },
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "f14d6709-5cc0-4feb-bd6d-98eb0f22ad82",
                    "_tdActionType": "replacebotv2",
                    "botName": "Replaced bot 1",
                    "blockName": "start"
                }
            ],
            "intent_id": "4e834fc7-31b1-4e39-a66e-f22b89fbe7ee",
            "intent_display_name": "welcome",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 714,
                    "y": 113
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "4cc1e02f-7c83-470b-a771-04cd731b8072",
                    "_tdActionType": "intent"
                }
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionType": "intent",
                    "intentName": "#4e834fc7-31b1-4e39-a66e-f22b89fbe7ee",
                    "_tdActionId": "d22d95cd145f44628f7a2e878674a4ad"
                }
            ],
            "intent_id": "2a99c94f-df62-45fe-80ff-c851af147c81",
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
                    "_tdActionId": "5d3903bc-47a3-4f58-9549-842e9f173469",
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
                                    "text": "I didn't understand. Can you rephrase your question?"
                                }
                            }
                        ]
                    }
                }
            ],
            "intent_id": "60584557-7782-48f3-b721-0a4ab2601c36",
            "intent_display_name": "defaultFallback",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 714,
                    "y": 528
                }
            }
        }
    ]
}

module.exports = { bot: bot };