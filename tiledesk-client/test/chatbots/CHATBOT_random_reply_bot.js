const bot = {
    "webhook_enabled": false,
    "language": "en",
    "name": "Random Reply Chatbot",
    "type": "tilebot",
    "intents": [
      {
        "webhook_enabled": false,
        "enabled": true,
        "actions": [
          {
            "_tdActionType": "intent",
            "intentName": "#d7eace6c-902b-4e81-a410-eebc948517c4",
            "_tdActionId": "33b0d3ebcdc04a25b9cdb3a03adc95ce"
          }
        ],
        "intent_id": "b9748d32-2cf5-4e9f-a375-8acddc732702",
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
            "_tdActionId": "a53c991f-ae77-44d8-94b5-030586db03d9",
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
            "_tdActionId": "d67778581efd4e48a80bf65f65844f80"
          }
        ],
        "intent_id": "42ea5ad1-acf0-4351-9839-a912257a1f15",
        "intent_display_name": "defaultFallback",
        "language": "en",
        "attributes": {
          "position": {
            "x": 801,
            "y": 529
          },
          "nextBlockAction": {
            "_tdActionTitle": "",
            "_tdActionId": "3d11b2fb-503c-4424-be9a-8ef41a0df9bb",
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
            "_tdActionId": "adc8f3a4-e2ed-4a3c-af84-6c473d18c08c",
            "_tdActionType": "randomreply",
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
                    "text": "Reply_1",
                    "attributes": {
                      "attachment": {
                        "type": "template",
                        "buttons": []
                      }
                    }
                  }
                },
                {
                  "type": "wait",
                  "time": 500
                },
                {
                  "type": "message",
                  "message": {
                    "type": "image",
                    "text": "Reply_2_with_image",
                    "metadata": {
                      "name": "pngtree_3d_cartoon_businessman_wearing_headset_clipart_illustration.png",
                      "src": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2Fbdc08499-f189-484a-b1f5-98f9310442ad%2Fpngtree_3d_cartoon_businessman_wearing_headset_clipart_illustration.png",
                      "width": 360,
                      "height": 360,
                      "type": "image/png",
                      "uid": "m3lthfhe",
                      "size": 115856,
                      "downloadURL": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2Fbdc08499-f189-484a-b1f5-98f9310442ad%2Fpngtree_3d_cartoon_businessman_wearing_headset_clipart_illustration.png"
                    },
                    "attributes": {
                      "attachment": {
                        "type": "template",
                        "buttons": []
                      }
                    }
                  }
                },
                {
                  "type": "wait",
                  "time": 500
                },
                {
                  "type": "message",
                  "message": {
                    "type": "text",
                    "text": "Reply_3_with_buttons",
                    "attributes": {
                      "attachment": {
                        "type": "template",
                        "buttons": [
                          {
                            "uid":"14d9a8e8700d4e05ad2f660417dd5ff1",
                            "type":"action",
                            "value":"btn1",
                            "link":"",
                            "target":"blank",
                            "action":"",
                            "attributes":"",
                            "show_echo":true,
                            "alias":"button1, button_1"
                         }
                        ]
                      }
                    }
                  }
                },
                {
                  "type": "wait",
                  "time": 500
                },
                {
                  "type": "message",
                  "message": {
                    "type": "frame",
                    "text": "Reply_4_with_iframe",
                    "metadata": {
                      "src": "https://www.youtube.com/embed/CzwQCmZ8FZQ",
                      "downloadURL": "",
                      "width": "100%",
                      "type": "frame"
                    }
                  }
                }
              ]
            }
          }
        ],
        "language": "en",
        "intent_display_name": "random_reply",
        "intent_id": "d7eace6c-902b-4e81-a410-eebc948517c4",
        "attributes": {
          "position": {
            "x": 469,
            "y": 11
          },
          "nextBlockAction": {
            "_tdActionId": "56a17c0c-b77e-4f36-b326-eb2823b1630b",
            "_tdActionType": "intent",
            "intentName": ""
          },
          "connectors": {}
        }
      }
    ]
}

module.exports = { bot: bot };