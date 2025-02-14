const bot = {
  "webhook_enabled": false,
  "language": "en",
  "name": "Reply V2 types Chatbot",
  "type": "tilebot",
  "attributes": null,
  "intents": [
    {
      "webhook_enabled": false,
      "enabled": true,
      "actions": [
        {
          "_tdActionTitle": "",
          "_tdActionId": "ca1ed9bd-8185-403b-b191-8c8de915f946",
          "_tdActionType": "replyv2",
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
                  "text": "Test reply type",
                  "attributes": {
                    "attachment": {
                      "type": "template",
                      "buttons": [
                        {
                          "uid": "abd2b882493846cc8e5a33cfdc49c105",
                          "type": "action",
                          "value": "text",
                          "link": "",
                          "target": "blank",
                          "action": "#476d493c-bd72-4552-a322-c8e735f66966",
                          "attributes": "",
                          "show_echo": true,
                          "alias": ""
                        },
                        {
                          "uid": "ae5ecbf147f742518449aa08cc5a8d59",
                          "type": "action",
                          "value": "image",
                          "link": "",
                          "target": "blank",
                          "action": "#9b9ec488-c6e6-4db2-b903-552e84eee1e8",
                          "attributes": "",
                          "show_echo": true,
                          "alias": ""
                        },
                        {
                          "uid": "6fa98885d91e4edab06b0a7997d81b04",
                          "type": "action",
                          "value": "frame",
                          "link": "",
                          "target": "blank",
                          "action": "#4c617f40-63d2-4074-b178-095f1b60ee2e",
                          "attributes": "",
                          "show_echo": true,
                          "alias": ""
                        },
                        {
                          "uid": "ffb4cca42dd44ebdae91d19af6c0441f",
                          "type": "action",
                          "value": "gallery",
                          "link": "",
                          "target": "blank",
                          "action": "#326efb53-e5a7-48ae-b62b-c5aecc7c7fa5",
                          "attributes": "",
                          "show_echo": true,
                          "alias": ""
                        },
                        {
                          "uid": "0cebceaee98d4b74941e64c203e5f387",
                          "type": "action",
                          "value": "redirect",
                          "link": "",
                          "target": "blank",
                          "action": "#b9999ef3-13ac-4080-b55e-bf950eb82b5f",
                          "attributes": "",
                          "show_echo": true,
                          "alias": ""
                        },
                        {
                          "uid": "3873836ef09945a1af867e7038225140",
                          "type": "action",
                          "value": "text with buttons",
                          "link": "",
                          "target": "blank",
                          "action": "#292ba576-b97f-4a4e-b2bc-4e6954ca0a63",
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
          "noInputTimeout": 10000
        }
      ],
      "intent_display_name": "welcome",
      "intent_id": "ca4cb8a0-8041-4400-9244-2d9c91dff66c",
      "language": "en",
      "attributes": {
        "position": {
          "x": 714,
          "y": 113
        },
        "nextBlockAction": {
          "_tdActionTitle": "",
          "_tdActionId": "8f0218e4-adbe-44f6-b582-1def3e38bddd",
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
          "_tdActionId": "66d6a3f52036483bb6068837c1bd1e98"
        }
      ],
      "intent_display_name": "defaultFallback",
      "intent_id": "b642b5e9-e7e6-446a-9ed3-18adf4fbbbe6",
      "language": "en",
      "attributes": {
        "position": {
          "x": 321,
          "y": 724
        },
        "nextBlockAction": {
          "_tdActionTitle": "",
          "_tdActionId": "078b61e5-72f1-4229-965a-de43081dc7bb",
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
          "intentName": "#ca4cb8a0-8041-4400-9244-2d9c91dff66c",
          "_tdActionId": "1caef45306e04256a72ebd757d490818"
        }
      ],
      "intent_display_name": "start",
      "intent_id": "f551ce6a-de36-4223-9466-714cc6482ce3",
      "question": "\\start",
      "language": "en",
      "attributes": {
        "position": {
          "x": 172,
          "y": 384
        },
        "nextBlockAction": {
          "_tdActionTitle": "",
          "_tdActionId": "ee5dd282-536f-4b7a-8413-0fa8b0d9768c",
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
          "_tdActionId": "6ee340ed-ce11-4e71-828c-a09e6119c817",
          "_tdActionType": "replyv2",
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
                  "text": "text_type",
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
          "noInputTimeout": 10000
        }
      ],
      "intent_display_name": "text",
      "intent_id": "476d493c-bd72-4552-a322-c8e735f66966",
      "language": "en",
      "attributes": {
        "position": {
          "x": 1165,
          "y": -467
        },
        "nextBlockAction": {
          "_tdActionId": "d2575064-13b3-4ebf-a52f-be4ea09b9821",
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
          "_tdActionId": "2aaad2b2-1fe5-4412-8735-128a84af209e",
          "_tdActionType": "replyv2",
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
                  "text": "button: {{user_city}}",
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
          "noInputTimeout": 10000
        }
      ],
      "intent_display_name": "buttons",
      "intent_id": "4d3e6ad8-eca5-4a5c-aa2d-77bfb87c69d2",
      "language": "en",
      "attributes": {
        "position": {
          "x": 1712,
          "y": 831
        },
        "nextBlockAction": {
          "_tdActionId": "410afcea-6ed3-4f19-bbd1-e56319402005",
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
          "_tdActionId": "49666d1d-ce24-4caf-b0fd-9df98a782108",
          "_tdActionType": "replyv2",
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
                  "type": "redirect",
                  "text": "",
                  "metadata": {
                    "src": "tiledesk.com",
                    "downloadURL": "",
                    "target": "blank",
                    "type": "redirect"
                  }
                }
              }
            ]
          },
          "noInputTimeout": 10000
        }
      ],
      "intent_display_name": "redirect",
      "intent_id": "b9999ef3-13ac-4080-b55e-bf950eb82b5f",
      "language": "en",
      "attributes": {
        "position": {
          "x": 1178,
          "y": 1105
        },
        "nextBlockAction": {
          "_tdActionId": "2bcbc5f6-ad3e-4156-8f78-fd40cf6d8787",
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
          "_tdActionId": "01a30856-0034-4d8c-b69a-bb89b7099326",
          "_tdActionType": "replyv2",
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
                  "type": "gallery",
                  "text": "",
                  "attributes": {
                    "attachment": {
                      "type": "gallery",
                      "gallery": [
                        {
                          "preview": {
                            "name": "pngtree-3d-cartoon-businessman-wearing-headset-clipart-illustration-png-image_13710409.png",
                            "src": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2Fc914ec7d-d496-44f1-92bf-7e943b6791c1%2Fpngtree-3d-cartoon-businessman-wearing-headset-clipart-illustration-png-image_13710409.png",
                            "width": 360,
                            "height": 360,
                            "type": "image/png",
                            "uid": "m3oqef17",
                            "size": 115856,
                            "downloadURL": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2Fc914ec7d-d496-44f1-92bf-7e943b6791c1%2Fpngtree-3d-cartoon-businessman-wearing-headset-clipart-illustration-png-image_13710409.png"
                          },
                          "title": "Title_1",
                          "description": "Description_1",
                          "buttons": [
                            {
                              "uid": "7a4fdfb235d94732b9f14ad1d4878ee0",
                              "type": "action",
                              "value": "Button",
                              "link": "",
                              "target": "blank",
                              "action": "#4d3e6ad8-eca5-4a5c-aa2d-77bfb87c69d2",
                              "attributes": "",
                              "show_echo": true
                            }
                          ]
                        },
                        {
                          "preview": {
                            "name": "0S8P41N4P688D4MAK3B4FS4L3HYFQWSZ.png",
                            "src": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2F0c57cfb3-63af-4844-84b4-d95541df76c0%2F0S8P41N4P688D4MAK3B4FS4L3HYFQWSZ.png",
                            "width": 420,
                            "height": 280,
                            "type": "image/png",
                            "uid": "m3oqeocy",
                            "size": 58057,
                            "downloadURL": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2F0c57cfb3-63af-4844-84b4-d95541df76c0%2F0S8P41N4P688D4MAK3B4FS4L3HYFQWSZ.png"
                          },
                          "title": "Title_2",
                          "description": "Description_2",
                          "buttons": [
                            {
                              "uid": "d0c0f47187534cf3a78b76681859bce7",
                              "type": "action",
                              "value": "Button1",
                              "link": "",
                              "target": "blank",
                              "action": "#4d3e6ad8-eca5-4a5c-aa2d-77bfb87c69d2",
                              "attributes": "",
                              "show_echo": true,
                              "alias": ""
                            },
                            {
                              "uid": "40f4322a6d114266b2f270364063e722",
                              "type": "action",
                              "value": "Button2",
                              "link": "",
                              "target": "blank",
                              "action": "#4d3e6ad8-eca5-4a5c-aa2d-77bfb87c69d2",
                              "attributes": "",
                              "show_echo": true,
                              "alias": ""
                            },
                            {
                              "uid": "a0535085093240dd85e3ca6282ba9d66",
                              "type": "action",
                              "value": "Button3",
                              "link": "",
                              "target": "blank",
                              "action": "#4d3e6ad8-eca5-4a5c-aa2d-77bfb87c69d2",
                              "attributes": "",
                              "show_echo": true,
                              "alias": ""
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              }
            ]
          },
          "noInputTimeout": 10000
        }
      ],
      "intent_display_name": "gallery",
      "intent_id": "326efb53-e5a7-48ae-b62b-c5aecc7c7fa5",
      "language": "en",
      "attributes": {
        "position": {
          "x": 1174,
          "y": 652
        },
        "nextBlockAction": {
          "_tdActionId": "ad9c0e6b-490c-4a2e-bf51-7af265b914de",
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
          "_tdActionId": "39e612cc-0c99-491f-8346-6b2757f35871",
          "_tdActionType": "replyv2",
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
                  "type": "frame",
                  "text": "frame_type",
                  "metadata": {
                    "src": "https://www.youtube.com/embed/CzwQCmZ8FZQ",
                    "downloadURL": "",
                    "width": "100%",
                    "type": "frame"
                  }
                }
              }
            ]
          },
          "noInputTimeout": 10000
        }
      ],
      "intent_display_name": "frame",
      "intent_id": "4c617f40-63d2-4074-b178-095f1b60ee2e",
      "language": "en",
      "attributes": {
        "position": {
          "x": 1170,
          "y": 273
        },
        "nextBlockAction": {
          "_tdActionId": "b8bf20c6-dfce-4e60-80c8-7391f4576033",
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
          "_tdActionId": "cf154af8-6d1d-4de8-89a2-b02896dfe02f",
          "_tdActionType": "replyv2",
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
                  "type": "image",
                  "text": "image_type",
                  "metadata": {
                    "name": "pngtree-3d-cartoon-businessman-wearing-headset-clipart-illustration-png-image_13710409.png",
                    "src": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2F63e75b84-1b38-4a52-957a-108561eb5f23%2Fpngtree-3d-cartoon-businessman-wearing-headset-clipart-illustration-png-image_13710409.png",
                    "width": 360,
                    "height": 360,
                    "type": "image/png",
                    "uid": "m3oqb11w",
                    "size": 115856,
                    "downloadURL": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2F63e75b84-1b38-4a52-957a-108561eb5f23%2Fpngtree-3d-cartoon-businessman-wearing-headset-clipart-illustration-png-image_13710409.png"
                  },
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
          "noInputTimeout": 10000
        }
      ],
      "intent_display_name": "image",
      "intent_id": "9b9ec488-c6e6-4db2-b903-552e84eee1e8",
      "language": "en",
      "attributes": {
        "position": {
          "x": 1167,
          "y": -212
        },
        "nextBlockAction": {
          "_tdActionId": "9c533150-7647-498a-85e8-f7a51576e1b9",
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
          "_tdActionId": "440ac65e-7306-40ef-a07e-1ef3821f2a63",
          "_tdActionType": "replyv2",
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
                  "text": "text with buttons",
                  "attributes": {
                    "attachment": {
                      "type": "template",
                      "buttons": [
                        {
                          "uid": "6d9e863cb757493bb9ea1b8ede1c91ec",
                          "type": "text",
                          "value": "button_text",
                          "link": "",
                          "target": "blank",
                          "action": "",
                          "attributes": "",
                          "show_echo": true,
                          "alias": ""
                        },
                        {
                          "uid": "961ce1bf6d324c50a175b4a9d5a48cbc",
                          "type": "action",
                          "value": "button_action",
                          "link": "",
                          "target": "blank",
                          "action": "#4d3e6ad8-eca5-4a5c-aa2d-77bfb87c69d2{\"user_city\":\"italy\"}",
                          "show_echo": true,
                          "alias": ""
                        },
                        {
                          "uid": "f472921f76414f7d929c8d7d283e6b0a",
                          "type": "url",
                          "value": "button_url",
                          "link": "www.tiledesk.com",
                          "target": "blank",
                          "action": "",
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
          "noInputTimeout": 10000
        }
      ],
      "intent_display_name": "text_with_buttons",
      "intent_id": "292ba576-b97f-4a4e-b2bc-4e6954ca0a63",
      "language": "en",
      "attributes": {
        "position": {
          "x": 1180,
          "y": 1356
        },
        "nextBlockAction": {
          "_tdActionId": "4144f035-35ff-447a-8f2e-82c1110dee2a",
          "_tdActionType": "intent",
          "intentName": ""
        }
      }
    }
  ]
}

module.exports = { bot: bot }