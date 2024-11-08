const bot = {
    "webhook_enabled": false,
    "language": "en",
    "name": "CloseTestBot",
    "type": "tilebot",
    "attributes": null,
    "intents": [
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "506c0868-aff9-437e-99cc-ff47851edc5c",
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
                                    "text": "Closing conversation...\n\nProject:\n{{project_id}}\n\nRequest:\n{{conversation_id}}\n\nChatbot token:\n{{chatbotToken}}",
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
            "intent_display_name": "welcome",
            "intent_id": "3c2dcfbf-6051-4a92-b5ed-fea0195eecf3",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 714,
                    "y": 113
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "98c6e6aa-b074-488e-b112-4ac6904c75ca",
                    "_tdActionType": "intent",
                    "intentName": "#3bbfc10e-527a-407b-bbf8-87f36ab03cb7"
                }
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "a133b1b6-7a60-4925-8b78-38c43c6dc9d1",
                    "url": "http://35.198.150.252/api/{{project_id}}/requests/{{conversation_id}}",
                    "headersString": {
                        "Content-Type": "*/*",
                        "Cache-Control": "no-cache",
                        "User-Agent": "TiledeskBotRuntime",
                        "Accept": "*/*",
                        "Authorization": "JWT {{chatbotToken}}"
                    },
                    "settings": {
                        "timeout": 20000
                    },
                    "jsonBody": null,
                    "bodyType": "none",
                    "formData": [],
                    "assignStatusTo": "status",
                    "assignErrorTo": "error",
                    "method": "GET",
                    "_tdActionType": "webrequestv2",
                    "assignResultTo": "result",
                    "trueIntent": "#4f576fa6-4923-46ce-9b65-29eec16b5607",
                    "falseIntent": "#e25047fa-a012-409a-b822-e56101e83719"
                }
            ],
            "intent_display_name": "check_closed",
            "intent_id": "a4ed0952-d280-4b28-9886-0536d938196a",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 1699,
                    "y": 535
                },
                "nextBlockAction": {
                    "_tdActionId": "0af68a83-666e-413e-b98a-f7051d5b7802",
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
                                    "text": "I didn't understand. Can you rephrase your question?",
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
                    "_tdActionId": "a44307b3b1c94c2aa7e55e3480dbb361"
                }
            ],
            "intent_display_name": "defaultFallback",
            "intent_id": "6b07fdcf-fb87-4587-9680-3ef36e5903b2",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 714,
                    "y": 517
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "a8020bff-438b-41a0-a1d8-7f4841ea6673",
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
                    "intentName": "#3c2dcfbf-6051-4a92-b5ed-fea0195eecf3",
                    "_tdActionId": "4b5010c08d474de1a642faff515a7396"
                }
            ],
            "intent_display_name": "start",
            "intent_id": "6b333655-6892-4933-a7f4-37a6daf2d613",
            "question": "\\start",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 172,
                    "y": 384
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "d2727623-1a31-4382-8c06-8a48c683c2b6",
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
                    "_tdActionId": "a59d1c7e-e516-4d5a-8915-bd1bff2edc97",
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
                                    "text": "Result: {{result.status}}",
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
            "intent_display_name": "untitled_block_3",
            "intent_id": "4f576fa6-4923-46ce-9b65-29eec16b5607",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 2086,
                    "y": 479
                },
                "nextBlockAction": {
                    "_tdActionId": "0eeb888d-aef0-4e73-9f62-9565ebfc30df",
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
                    "_tdActionId": "d1d2bf05-f6c7-4e7d-ae76-91922032891f",
                    "_tdActionType": "close"
                }
            ],
            "intent_display_name": "untitled_block_1",
            "intent_id": "3bbfc10e-527a-407b-bbf8-87f36ab03cb7",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 1099,
                    "y": 110
                },
                "nextBlockAction": {
                    "_tdActionId": "cf75f50d-aa10-492a-a9f0-ae3564c77ead",
                    "_tdActionType": "intent",
                    "intentName": "#30245163-95fe-40ae-871e-bc3f185e5581"
                }
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "fe451cff-a65a-4065-8940-81ef67339f6c",
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
                                    "text": "Error: {{error}}",
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
            "intent_display_name": "untitled_block_4",
            "intent_id": "e25047fa-a012-409a-b822-e56101e83719",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 2118,
                    "y": 844
                },
                "nextBlockAction": {
                    "_tdActionId": "769b9def-24ae-43ca-95b1-058540baa315",
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
                    "_tdActionId": "77cfe947-be51-486b-b775-5850b4523164",
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
                                    "text": "Closed",
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
            "intent_display_name": "untitled_block_2",
            "intent_id": "30245163-95fe-40ae-871e-bc3f185e5581",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 1320,
                    "y": 332
                },
                "nextBlockAction": {
                    "_tdActionId": "bb0921dc-688b-4331-9a97-3657163c6664",
                    "_tdActionType": "intent",
                    "intentName": "#a4ed0952-d280-4b28-9886-0536d938196a"
                }
            }
        }
    ]
}

module.exports = { bot: bot };