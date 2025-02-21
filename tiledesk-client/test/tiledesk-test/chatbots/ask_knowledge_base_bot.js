const bot = {
    "webhook_enabled": false,
    "language": "en",
    "name": "Ask KB Chatbot",
    "type": "tilebot",
    "attributes": {
        "variables": {
            "kb_reply": "kb_reply",
            "kb_source": "kb_source",
            "gpt_reply": "gpt_reply",
            "question": "question"
        }
    },
    "intents": [
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "920d22eb-6ac5-4d24-9022-19ff3699544f",
                    "_tdActionType": "setattribute-v2",
                    "operation": {
                        "operands": [
                            {
                                "value": "{{lastUserText}}",
                                "isVariable": false
                            }
                        ],
                        "operators": []
                    },
                    "destination": "question"
                },
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
                                    "text": "Choose model",
                                    "attributes": {
                                        "attachment": {
                                            "type": "template",
                                            "buttons": [
                                                {
                                                    "uid": "b4c8d9b60a97427c8caebf1eb4b9a6bf",
                                                    "type": "action",
                                                    "value": "gpt-4o",
                                                    "link": "",
                                                    "target": "blank",
                                                    "action": "#cfd4899c-fa85-45b0-ac3b-71c7905b5bb7",
                                                    "attributes": "",
                                                    "show_echo": true,
                                                    "alias": ""
                                                },
                                                {
                                                    "uid": "b39b76002eb84c0fa79e0a291936b567",
                                                    "type": "action",
                                                    "value": "gpt-4o-mini",
                                                    "link": "",
                                                    "target": "blank",
                                                    "action": "#5b01eb9f-3324-4f5c-8ea0-952c8b1d73a2",
                                                    "attributes": "",
                                                    "show_echo": true,
                                                    "alias": ""
                                                },
                                                {
                                                    "uid": "fe60c2476d5b4caa9ed8227cbeba5278",
                                                    "type": "action",
                                                    "value": "gpt-3.5-turbo",
                                                    "link": "",
                                                    "target": "blank",
                                                    "action": "#898d10cc-acc9-457a-96d5-d2296e55efe7",
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
                    },
                    "_tdActionId": "60ac9f95e3d34b20ab04ea8c19f3d70f"
                }
            ],
            "intent_id": "cffa7002-d029-4622-8094-7aad3b64e66f",
            "intent_display_name": "defaultFallback",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 714,
                    "y": 528
                },
                "readonly": true,
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "9cf016ae-a108-49d4-afeb-9fb22160cfcc",
                    "_tdActionType": "intent",
                    "intentName": null
                }
            },
            "agents_available": false
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
                                    "text": "Hi, how can I help you?"
                                }
                            }
                        ]
                    },
                    "text": "Hi, how can I help you?\r\n"
                }
            ],
            "intent_id": "4a98b101-6394-4f15-b99f-d90ddb2e6277",
            "intent_display_name": "welcome",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 714,
                    "y": 113
                }
            },
            "agents_available": false
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionType": "intent",
                    "intentName": "#4a98b101-6394-4f15-b99f-d90ddb2e6277"
                }
            ],
            "intent_id": "59eb8dfe-eb92-4d11-9131-1517de1368d4",
            "question": "\\start",
            "intent_display_name": "start",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 172,
                    "y": 384
                }
            },
            "agents_available": false
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "82427ba5-90f2-486f-9469-459c64bcd36f",
                    "_tdActionType": "askgptv2",
                    "question": "{{question}}",
                    "assignReplyTo": "kb_reply",
                    "assignSourceTo": "kb_source",
                    "max_tokens": 256,
                    "temperature": 0.7,
                    "top_k": 5,
                    "model": "gpt-4o",
                    "preview": [],
                    "history": false,
                    "citations": false,
                    "namespace": "Default",
                    "context": "",
                    "namespaceAsName": true,
                    "trueIntent": "#a71a0cfb-b307-461a-a1bb-c46c5417f2d5",
                    "falseIntent": "#804cb15d-decd-4016-91f0-a512cc70bb02"
                }
            ],
            "language": "en",
            "intent_display_name": "askkb_4o",
            "intent_id": "cfd4899c-fa85-45b0-ac3b-71c7905b5bb7",
            "agents_available": false,
            "attributes": {
                "position": {
                    "x": 1125,
                    "y": 429
                },
                "nextBlockAction": {
                    "_tdActionId": "0e2f5730-5077-4f94-9968-7fd4748a17e5",
                    "_tdActionType": "intent",
                    "intentName": ""
                },
                "connectors": {},
                "color": "80,100,147",
                "readonly": false
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "ce1baca2-cdcd-4777-bb02-84f502cc15b4",
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
                                    "text": "Reply: {{kb_reply}}\nSource: {{kb_source}}",
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
            "intent_display_name": "kb_answer",
            "intent_id": "a71a0cfb-b307-461a-a1bb-c46c5417f2d5",
            "agents_available": false,
            "attributes": {
                "position": {
                    "x": 1665,
                    "y": 491
                },
                "nextBlockAction": {
                    "_tdActionId": "89e06432-cd78-438a-bda4-04698b87f8e2",
                    "_tdActionType": "intent",
                    "intentName": "#dd953752-2e38-4e7d-9380-f265576edfb3"
                },
                "connectors": {},
                "color": "80,100,147",
                "readonly": false
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "ddf1b13e-7685-481c-95f3-ce33009b836f",
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
                                    "text": "Error: {{flowError}}",
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
            "intent_display_name": "kb_error",
            "intent_id": "804cb15d-decd-4016-91f0-a512cc70bb02",
            "agents_available": false,
            "attributes": {
                "position": {
                    "x": 1673,
                    "y": 780
                },
                "nextBlockAction": {
                    "_tdActionId": "519da77a-dc92-42b8-b114-bd9d7ded20df",
                    "_tdActionType": "intent",
                    "intentName": ""
                },
                "connectors": {},
                "color": "80,100,147",
                "readonly": false
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "f8db75c5-9bba-4ed9-a0b8-2b7ab715259a",
                    "_tdActionType": "gpt_task",
                    "max_tokens": 256,
                    "temperature": 0.7,
                    "model": "gpt-4o-mini",
                    "assignReplyTo": "gpt_reply",
                    "preview": [
                        {
                            "name": "kb_reply",
                            "value": "Quando è nato Napoleone?"
                        }
                    ],
                    "formatType": "none",
                    "question": "Analyze the answer of the chatbot. If the answer is about who Joe is or what he does, answer \"OK\", otherwise answer \"KO\".\n\nThis is the answer: \n{{kb_reply}}",
                    "context": "",
                    "trueIntent": "#4f4fc9e2-64df-45ef-b40e-df54bdc5cf85",
                    "falseIntent": "#f6b280c9-c823-4d06-97b4-3c816915f8b3"
                }
            ],
            "language": "en",
            "intent_display_name": "untitled_block_4",
            "intent_id": "dd953752-2e38-4e7d-9380-f265576edfb3",
            "agents_available": false,
            "attributes": {
                "position": {
                    "x": 2085,
                    "y": 522
                },
                "nextBlockAction": {
                    "_tdActionId": "60a5f84b-96cd-4e50-850e-f1ffedb12b4a",
                    "_tdActionType": "intent",
                    "intentName": ""
                },
                "connectors": {},
                "color": "80,100,147",
                "readonly": false
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "8164d24b-85de-4158-b555-617c3c664a19",
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
                                    "text": "{{gpt_reply}}",
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
            "intent_display_name": "answer",
            "intent_id": "4f4fc9e2-64df-45ef-b40e-df54bdc5cf85",
            "agents_available": false,
            "attributes": {
                "position": {
                    "x": 2524,
                    "y": 502
                },
                "nextBlockAction": {
                    "_tdActionId": "4a616e69-ea5e-46d6-a973-53f81cdb3fe7",
                    "_tdActionType": "intent",
                    "intentName": ""
                },
                "connectors": {},
                "color": "80,100,147",
                "readonly": false
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "360494f7-29bb-4300-9b65-99e1d47e9484",
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
                                    "text": "Error: {{flowError}}",
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
            "intent_display_name": "answer_ko",
            "intent_id": "f6b280c9-c823-4d06-97b4-3c816915f8b3",
            "agents_available": false,
            "attributes": {
                "position": {
                    "x": 2525,
                    "y": 844
                },
                "nextBlockAction": {
                    "_tdActionId": "1a8a9def-d798-4adf-aa46-fefc4af3382d",
                    "_tdActionType": "intent",
                    "intentName": ""
                },
                "connectors": {},
                "color": "80,100,147",
                "readonly": false
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "82427ba5-90f2-486f-9469-459c64bcd36f",
                    "_tdActionType": "askgptv2",
                    "question": "{{question}}",
                    "assignReplyTo": "kb_reply",
                    "assignSourceTo": "kb_source",
                    "max_tokens": 256,
                    "temperature": 0.7,
                    "top_k": 5,
                    "model": "gpt-4o-mini",
                    "preview": [],
                    "history": false,
                    "citations": false,
                    "namespace": "Default",
                    "context": "",
                    "namespaceAsName": true,
                    "trueIntent": "#a71a0cfb-b307-461a-a1bb-c46c5417f2d5",
                    "falseIntent": "#804cb15d-decd-4016-91f0-a512cc70bb02"
                }
            ],
            "language": "en",
            "intent_display_name": "askkb_4o_mini",
            "intent_id": "5b01eb9f-3324-4f5c-8ea0-952c8b1d73a2",
            "agents_available": false,
            "attributes": {
                "position": {
                    "x": 1129,
                    "y": 703
                },
                "nextBlockAction": {
                    "_tdActionId": "0e2f5730-5077-4f94-9968-7fd4748a17e5",
                    "_tdActionType": "intent",
                    "intentName": ""
                },
                "connectors": {},
                "color": "80,100,147",
                "readonly": false
            }
        },
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "f73945f6-3410-493a-ad6f-07056a30537a",
                    "_tdActionType": "askgptv2",
                    "question": "{{question}}",
                    "assignReplyTo": "kb_reply",
                    "assignSourceTo": "kb_source",
                    "max_tokens": 256,
                    "temperature": 0.7,
                    "top_k": 5,
                    "model": "gpt-3.5-turbo",
                    "preview": [],
                    "history": false,
                    "citations": false,
                    "namespace": "Default",
                    "context": "",
                    "namespaceAsName": true,
                    "trueIntent": "#a71a0cfb-b307-461a-a1bb-c46c5417f2d5",
                    "falseIntent": "#804cb15d-decd-4016-91f0-a512cc70bb02"
                }
            ],
            "language": "en",
            "intent_display_name": "askkb_3_5_turbo",
            "intent_id": "898d10cc-acc9-457a-96d5-d2296e55efe7",
            "agents_available": false,
            "attributes": {
                "position": {
                    "x": 1124,
                    "y": 995
                },
                "nextBlockAction": {
                    "_tdActionId": "3186adf5-2c95-440c-8326-a4a99952eaeb",
                    "_tdActionType": "intent",
                    "intentName": null
                },
                "connectors": {},
                "color": "80,100,147",
                "readonly": false
            }
        }
    ]
}

module.exports = { bot: bot }