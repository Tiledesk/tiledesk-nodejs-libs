const bot = {
    "webhook_enabled": false,
    "language": "en",
    "name": "delete attribute with form",
    "type": "tilebot",
    "attributes": {
        "variables": {
            "nome": "nome",
            "codice_fiscale": "codice_fiscale"
        }
    },
    "intents": [
        {
            "webhook_enabled": false,
            "enabled": true,
            "actions": [
                {
                    "_tdActionType": "intent",
                    "intentName": "#6e91839c-138b-4c90-9862-d9f537db9c69",
                    "_tdActionId": "5ea20b2ea0024433a57ec0ff01c62c26"
                }
            ],
            "intent_display_name": "start",
            "intent_id": "4a929bea-b178-4738-9c60-7e0bdcd09901",
            "question": "\\start",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 172,
                    "y": 384
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "b8e9e075-ea90-4969-b9cf-137cacb855f2",
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
                    "_tdActionId": "c43f6750-a56d-459c-be53-418fa11f0985",
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
                                    "text": "I got your data:\nuserFullname: {{userFullname}}\nuserEmail: {{userEmail}}",
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
            "intent_display_name": "ask",
            "intent_id": "eaa3d642-e5cd-431d-9363-889599e34676",
            "form": {
                "name": "Base",
                "id": 1,
                "cancelCommands": [
                    "Cancel"
                ],
                "cancelReply": "Form deleted",
                "description": "\"Base\" model contains the following fields: user fullname, user email",
                "fields": [
                    {
                        "name": "userFullname",
                        "type": "text",
                        "label": "What is your name?"
                    },
                    {
                        "name": "userEmail",
                        "type": "text",
                        "regex": "^.{1,}$",
                        "label": "Hi ${userFullname}\n\nJust one last question\n\nYour email ",
                        "errorLabel": "${userFullname} this email address is invalid\n\nCan you insert a correct email address?"
                    }
                ]
            },
            "language": "en",
            "attributes": {
                "position": {
                    "x": 1191,
                    "y": 178
                },
                "nextBlockAction": {
                    "_tdActionId": "8ee3428d-398a-4a02-b609-defdc9dd0b0b",
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
                    "_tdActionId": "9e83c9b8-4c41-43ce-9fad-f823fea84097",
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
                                    "text": "Fallback message",
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
            "intent_display_name": "defaultFallback",
            "intent_id": "de826c91-4f09-4315-b655-39658a2b3f61",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 660,
                    "y": 647
                },
                "nextBlockAction": {
                    "_tdActionTitle": "",
                    "_tdActionId": "4d944eaf-0a81-46b3-96a3-2475fa9ff431",
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
                    "_tdActionTitle": "",
                    "_tdActionId": "a89032a6-86cf-4bfc-aa12-bc35adc8c469",
                    "_tdActionType": "delete",
                    "variableName": "userEmail"
                },
                {
                    "_tdActionTitle": "",
                    "_tdActionId": "a89032a6-86cf-4bfc-aa12-bc35adc8c470",
                    "_tdActionType": "delete",
                    "variableName": "userFullname"
                }
            ],
            "intent_display_name": "welcome2",
            "intent_id": "6e91839c-138b-4c90-9862-d9f537db9c69",
            "language": "en",
            "attributes": {
                "position": {
                    "x": 656,
                    "y": 194
                },
                "nextBlockAction": {
                    "_tdActionId": "d3e3c1bc-dcfd-4659-8888-7c2b0a441dd7",
                    "_tdActionType": "intent",
                    "intentName": "#eaa3d642-e5cd-431d-9363-889599e34676"
                }
            }
        }
    ]
}

module.exports = { bot: bot };