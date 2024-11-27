const bot = {
  "webhook_enabled": false,
  "language": "en",
  "name": "Add tags Chatbot",
  "type": "tilebot",
  "attributes": {
    "variables": {
      "tagListConv": "tagListConv",
      "tagListLead": "tagListLead"
    }
  },
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
                  "text": "Add tag",
                  "attributes": {
                    "attachment": {
                      "type": "template",
                      "buttons": [
                        {
                          "uid": "a0e6a5e27351447db3b276ee45169cc5",
                          "type": "action",
                          "value": "conversation",
                          "link": "",
                          "target": "blank",
                          "action": "#992bb459-a677-4fdc-b555-f5255d972461",
                          "attributes": "",
                          "show_echo": true,
                          "alias": ""
                        },
                        {
                          "uid": "7f17b9a0a2404863b7e9e9508359cd4c",
                          "type": "action",
                          "value": "lead",
                          "link": "",
                          "target": "blank",
                          "action": "#15d03d31-1d73-41bd-833e-88749f6c6565",
                          "attributes": "",
                          "show_echo": true,
                          "alias": ""
                        },
                        {
                          "uid": "d66a155eae6d4a999bbc7285de2b3ac9",
                          "type": "action",
                          "value": "conversation_var",
                          "link": "",
                          "target": "blank",
                          "action": "#8692b049-63b3-4328-be7f-e4679087a667",
                          "attributes": "",
                          "show_echo": true,
                          "alias": ""
                        },
                        {
                          "uid": "65538e9aaf874c5ba6886a6d5678d7ed",
                          "type": "action",
                          "value": "lead_var",
                          "link": "",
                          "target": "blank",
                          "action": "#1c96c314-c174-42bc-ac31-03873f0bfa1e",
                          "attributes": "",
                          "show_echo": true,
                          "alias": ""
                        },
                        {
                          "uid": "4bb7330191d94dedac602c47f0197514",
                          "type": "action",
                          "value": "conversation_and_push",
                          "link": "",
                          "target": "blank",
                          "action": "#48a1e1f2-c990-4cc3-9aca-b78a80debd0e",
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
          "text": "Hi, how can I help you?\r\n",
          "_tdActionId": "ae0bf05d89204fc6af57c3cfbce6d00b"
        }
      ],
      "intent_id": "715bf0c9-3143-4452-b7d7-834b9e955540",
      "intent_display_name": "welcome",
      "language": "en",
      "attributes": {
        "position": {
          "x": 618,
          "y": 101
        },
        "nextBlockAction": {
          "_tdActionTitle": "",
          "_tdActionId": "5a2659fb-de1c-4aec-a098-3b4c6f20894d",
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
          "_tdActionId": "a21e5def0e3748a0a873b27e75d07849"
        }
      ],
      "intent_id": "dc7c0fb0-c904-40dc-b933-22f9fa69d996",
      "intent_display_name": "defaultFallback",
      "language": "en",
      "attributes": {
        "position": {
          "x": 441,
          "y": 598
        },
        "nextBlockAction": {
          "_tdActionTitle": "",
          "_tdActionId": "002a255e-9a7d-42d2-a92e-f4a0dc782abf",
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
          "intentName": "#715bf0c9-3143-4452-b7d7-834b9e955540",
          "_tdActionId": "86434f817028445295b48e20dece3e65"
        }
      ],
      "intent_id": "c2a265f0-007e-458a-80ff-ce3a437f6af9",
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
          "_tdActionId": "c18b9e93-1a89-43f0-af41-ac3889256744",
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
          "_tdActionId": "dbe6a213-86bd-4305-acd2-acf641ac4cb3",
          "_tdActionType": "add_tags",
          "target": "request",
          "tags": "tagConv1,tagConv2",
          "pushToList": false
        }
      ],
      "language": "en",
      "intent_display_name": "add_conv_tag",
      "intent_id": "992bb459-a677-4fdc-b555-f5255d972461",
      "attributes": {
        "position": {
          "x": 1065,
          "y": -391
        },
        "nextBlockAction": {
          "_tdActionId": "2cd128fe-6dc4-4b90-8996-d4c6ae848337",
          "_tdActionType": "intent",
          "intentName": "#2bb6784f-b641-425f-ada5-53cfacab1a53"
        }
      }
    },
    {
      "webhook_enabled": false,
      "enabled": true,
      "actions": [
        {
          "_tdActionTitle": "",
          "_tdActionId": "f76421d4-aa4f-42c9-bfb4-1fe9388b68cd",
          "_tdActionType": "add_tags",
          "target": "lead",
          "tags": "tagLead1",
          "pushToList": false
        }
      ],
      "language": "en",
      "intent_display_name": "add_lead_tag",
      "intent_id": "15d03d31-1d73-41bd-833e-88749f6c6565",
      "attributes": {
        "position": {
          "x": 1094,
          "y": -171
        },
        "nextBlockAction": {
          "_tdActionId": "08047b9c-0052-40b7-8d75-86e789890b4c",
          "_tdActionType": "intent",
          "intentName": "#2bb6784f-b641-425f-ada5-53cfacab1a53"
        }
      }
    },
    {
      "webhook_enabled": false,
      "enabled": true,
      "actions": [
        {
          "_tdActionTitle": "",
          "_tdActionId": "8bc54e36-22e9-4e94-ba0c-05d34eca9874",
          "_tdActionType": "setattribute-v2",
          "operation": {
            "operands": [
              {
                "value": "tagConvVar1",
                "isVariable": false
              }
            ],
            "operators": []
          },
          "destination": "tagListConv"
        },
        {
          "_tdActionTitle": "",
          "_tdActionId": "3037d9e6-4117-4174-9c45-6f297438150d",
          "_tdActionType": "add_tags",
          "target": "request",
          "tags": "tagConv1,{{tagListConv}}",
          "pushToList": false
        }
      ],
      "language": "en",
      "intent_display_name": "add_conv_tag_var",
      "intent_id": "8692b049-63b3-4328-be7f-e4679087a667",
      "attributes": {
        "position": {
          "x": 1107,
          "y": 28
        },
        "nextBlockAction": {
          "_tdActionId": "0b46df25-3b91-4cfe-ac0e-e0dfd169a004",
          "_tdActionType": "intent",
          "intentName": "#2bb6784f-b641-425f-ada5-53cfacab1a53"
        }
      }
    },
    {
      "webhook_enabled": false,
      "enabled": true,
      "actions": [
        {
          "_tdActionTitle": "",
          "_tdActionId": "7cc8a1da-5f78-4c45-8b25-ef233a672aae",
          "_tdActionType": "setattribute-v2",
          "operation": {
            "operands": [
              {
                "value": "tagLeadVar1,tagLeadVar2",
                "isVariable": false
              }
            ],
            "operators": []
          },
          "destination": "tagListLead"
        },
        {
          "_tdActionTitle": "",
          "_tdActionId": "7c26a6c1-7760-4b94-96ee-aff01dfbd8ec",
          "_tdActionType": "add_tags",
          "target": "lead",
          "tags": "tagLead1,{{tagListLead}}",
          "pushToList": false
        }
      ],
      "language": "en",
      "intent_display_name": "add_lead_tag_var",
      "intent_id": "1c96c314-c174-42bc-ac31-03873f0bfa1e",
      "attributes": {
        "position": {
          "x": 1111,
          "y": 380
        },
        "nextBlockAction": {
          "_tdActionId": "9c73df51-4e07-48e4-b3e5-29007c551636",
          "_tdActionType": "intent",
          "intentName": "#2bb6784f-b641-425f-ada5-53cfacab1a53"
        }
      }
    },
    {
      "webhook_enabled": false,
      "enabled": true,
      "actions": [
        {
          "_tdActionTitle": "",
          "_tdActionId": "d8a018e7-fe60-4742-8312-56bad0c1b070",
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
                  "text": "tag_ok",
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
      "intent_display_name": "tag_ok",
      "intent_id": "2bb6784f-b641-425f-ada5-53cfacab1a53",
      "attributes": {
        "position": {
          "x": 1605,
          "y": 268
        },
        "nextBlockAction": {
          "_tdActionId": "2497b986-6e2b-49b2-8776-0c1e25fd6b03",
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
          "_tdActionId": "55bfa98f-8a00-49b6-a39f-15d490eacbe4",
          "_tdActionType": "add_tags",
          "target": "request",
          "tags": "tagConvPush1,tagConvPush2",
          "pushToList": true
        }
      ],
      "language": "en",
      "intent_display_name": "untitled_block_1",
      "intent_id": "48a1e1f2-c990-4cc3-9aca-b78a80debd0e",
      "attributes": {
        "position": {
          "x": 1115,
          "y": 757
        },
        "nextBlockAction": {
          "_tdActionId": "10c1d3d7-c662-4bc9-bcfc-5feda9b1edcc",
          "_tdActionType": "intent",
          "intentName": "#2bb6784f-b641-425f-ada5-53cfacab1a53"
        },
        "connectors": {}
      }
    }
  ]
}

module.exports = { bot: bot }