const bot = {
    "webhook_enabled": false,
    "language": "en",
    "name": "Set Attribute (counter test)",
    "type": "tilebot",
    "attributes": {
        "variables": {
            "counter": "counter"
        }
    },
    "intents": [
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
            "intent_id": "972f97e8-635b-49ce-ae69-0f77fd2f0da4",
            "intent_display_name": "defaultFallback",
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
                    "intentName": "#0bf40bf2-4f58-4121-8e0b-d605493d9948",
                    "_tdActionId": "e3aa492afe224961a4ed44037eba2717"
                }
            ],
            "intent_id": "52753d89-4aa5-4c9e-9b18-57989c7a06c6",
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
                    "_tdActionId": "487c6249-75ff-4306-b8fe-3c0c06902899",
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
                                    "text": "incrementing counter...",
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
                    "_tdActionId": "40b0796064c040dea74e5540e9bd6d00"
                }
            ],
            "intent_id": "0bf40bf2-4f58-4121-8e0b-d605493d9948",
            "intent_display_name": "welcome",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 714,
                    "y": 113
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "68d74c01-277b-4b56-88ac-0e47183d9795",
                    "_tdActionType": "intent",
                    "intentName": "#b25c181e-9f3d-4dc7-9c4e-b9cd52ca64bb"
                }
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "fa12b2fb-57e5-4210-98a5-c75ca0dfc385",
                    "_tdActionType": "setattribute-v2",
                    "operation": {
                        "operands": [
                            {
                                "value": "counter",
                                "isVariable": true
                            },
                            {
                                "value": "1",
                                "isVariable": false
                            }
                        ],
                        "operators": [
                            "addAsNumber"
                        ]
                    },
                    "destination": "counter"
                }
            ],
            "language": "en",
            "intent_display_name": "inc counter",
            "intent_id": "b25c181e-9f3d-4dc7-9c4e-b9cd52ca64bb",
            "attributes": {
                "position": {
                    "x": 1164,
                    "y": 372
                },
                "nextBlockAction": {
                    "_tdActionId": "422b8cd5-1054-43fa-8f66-2f056fe724ca",
                    "_tdActionType": "intent",
                    "intentName": "#6a1dcf6e-59c9-409f-9b0e-15d5f76d2f00"
                },
                "connectors": {}
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "2e134617-e24f-4fd8-bd16-492bae880a7d",
                    "_tdActionType": "jsoncondition",
                    "groups": [
                        {
                            "type": "expression",
                            "conditions": [
                                {
                                    "type": "condition",
                                    "operand1": "counter",
                                    "operator": "equalAsNumbers",
                                    "operand2": {
                                        "type": "const",
                                        "value": "200",
                                        "name": ""
                                    }
                                }
                            ]
                        }
                    ],
                    "stopOnConditionMet": true,
                    "trueIntent": "#a8ff995a-9ede-4b6f-a025-3c26edf2e3aa",
                    "falseIntent": "#b25c181e-9f3d-4dc7-9c4e-b9cd52ca64bb"
                }
            ],
            "language": "en",
            "intent_display_name": "check",
            "intent_id": "6a1dcf6e-59c9-409f-9b0e-15d5f76d2f00",
            "attributes": {
                "position": {
                    "x": 1342,
                    "y": -100
                },
                "nextBlockAction": {
                    "_tdActionId": "04872e03-3b7b-4621-b2bc-6dbfc301f29e",
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
                    "_tdActionId": "426ad3fd-3e3a-4a4b-b46e-19813ff56ec1",
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
                                    "text": "final counter: {{counter}}",
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
            "intent_display_name": "end",
            "intent_id": "a8ff995a-9ede-4b6f-a025-3c26edf2e3aa",
            "attributes": {
                "position": {
                    "x": 1738,
                    "y": 262
                },
                "nextBlockAction": {
                    "_tdActionId": "7f1ba66b-6534-4c12-9889-1272b1e5f857",
                    "_tdActionType": "intent",
                    "intentName": ""
                }
            }
        }
    ]
}

module.exports = { bot: bot };