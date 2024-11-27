const bot = {
  "webhook_enabled": false,
  "language": "en",
  "name": "Reply types Chatbot",
  "type": "tilebot",
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
      "intent_id": "b642b5e9-e7e6-446a-9ed3-18adf4fbbbe6",
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
          "intentName": "#ca4cb8a0-8041-4400-9244-2d9c91dff66c",
          "_tdActionId": "1caef45306e04256a72ebd757d490818"
        }
      ],
      "intent_id": "f551ce6a-de36-4223-9466-714cc6482ce3",
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
                  "text": "Test reply type",
                  "attributes": {
                    "attachment": {
                      "type": "template",
                      "buttons": [
                        {
                          "uid": "29fa9a2c2a12468392737a8502073347",
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
                          "uid": "d7cef3f67c7a4b8aaf0c6c7f0c7e17e0",
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
                          "uid": "a3aedc331b1d497986d5d5f3131ca195",
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
                          "uid": "23915b47c0874beb95e021eb53b39cae",
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
                          "uid": "e8995511a6bf449099ba92348071d09e",
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
                          "uid": "3f5201132ec345fdaa83c241ab8bfc9c",
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
          "text": "Hi, how can I help you?\r\n",
          "_tdActionId": "d38726cf9a6e4461821cbb9073bfed95"
        }
      ],
      "intent_id": "ca4cb8a0-8041-4400-9244-2d9c91dff66c",
      "intent_display_name": "welcome",
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
          "_tdActionTitle": "",
          "_tdActionId": "fa226978-8b7a-4954-a9a0-fe5e13f497b8",
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
          }
        }
      ],
      "language": "en",
      "intent_display_name": "text",
      "intent_id": "476d493c-bd72-4552-a322-c8e735f66966",
      "attributes": {
        "position": {
          "x": 1093,
          "y": -337
        },
        "nextBlockAction": {
          "_tdActionId": "d2575064-13b3-4ebf-a52f-be4ea09b9821",
          "_tdActionType": "intent",
          "intentName": ""
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
          "_tdActionId": "43db0d27-3bd5-456e-a548-15f39ecf7b96",
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
                  "type": "image",
                  "text": "image_type",
                  "metadata": {
                    "name": "pngtree_3d_cartoon_businessman_wearing_headset_clipart_illustration.png",
                    "src": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2F406fbdcf-643f-4b9a-81e5-3064d56aca34%2Fpngtree_3d_cartoon_businessman_wearing_headset_clipart_illustration.png",
                    "width": 360,
                    "height": 360,
                    "type": "image/png",
                    "uid": "m3lvcxip",
                    "size": 115856,
                    "downloadURL": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2F406fbdcf-643f-4b9a-81e5-3064d56aca34%2Fpngtree_3d_cartoon_businessman_wearing_headset_clipart_illustration.png"
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
          }
        }
      ],
      "language": "en",
      "intent_display_name": "image",
      "intent_id": "9b9ec488-c6e6-4db2-b903-552e84eee1e8",
      "attributes": {
        "position": {
          "x": 1167,
          "y": -136
        },
        "nextBlockAction": {
          "_tdActionId": "9c533150-7647-498a-85e8-f7a51576e1b9",
          "_tdActionType": "intent",
          "intentName": ""
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
          "_tdActionId": "0c4d26c9-1c71-4b58-8525-893e0d8b9e4f",
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
          }
        }
      ],
      "language": "en",
      "intent_display_name": "frame",
      "intent_id": "4c617f40-63d2-4074-b178-095f1b60ee2e",
      "attributes": {
        "position": {
          "x": 1171,
          "y": 310
        },
        "nextBlockAction": {
          "_tdActionId": "b8bf20c6-dfce-4e60-80c8-7391f4576033",
          "_tdActionType": "intent",
          "intentName": ""
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
          "_tdActionId": "542e1e08-970e-4137-b7f8-2d96673830fb",
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
                  "type": "gallery",
                  "text": "",
                  "attributes": {
                    "attachment": {
                      "type": "gallery",
                      "gallery": [
                        {
                          "preview": {
                            "name": "pngtree_3d_cartoon_businessman_wearing_headset_clipart_illustration.png",
                            "src": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2F01ec1557-7381-4bba-9faf-62eb5b018200%2Fpngtree_3d_cartoon_businessman_wearing_headset_clipart_illustration.png",
                            "width": 360,
                            "height": 360,
                            "type": "image/png",
                            "uid": "m3lvf0l7",
                            "size": 115856,
                            "downloadURL": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2F01ec1557-7381-4bba-9faf-62eb5b018200%2Fpngtree_3d_cartoon_businessman_wearing_headset_clipart_illustration.png"
                          },
                          "title": "Title_1",
                          "description": "Description_1",
                          "buttons": [
                            {
                              "uid": "e27275b9bf714f36ad7eacfcf91f6514",
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
                            "src": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2F8a4391af-f633-4819-b3d5-b8e31d53c3ea%2F0S8P41N4P688D4MAK3B4FS4L3HYFQWSZ.png",
                            "width": 420,
                            "height": 280,
                            "type": "image/png",
                            "uid": "m3lvfp01",
                            "size": 58057,
                            "downloadURL": "https://eu.rtmv3.tiledesk.com/api/images?path=uploads%2Fusers%2F63878b996b26bc0013305ad4%2Fimages%2F8a4391af-f633-4819-b3d5-b8e31d53c3ea%2F0S8P41N4P688D4MAK3B4FS4L3HYFQWSZ.png"
                          },
                          "title": "Tytle_2",
                          "description": "Description_1",
                          "buttons": [
                            {
                              "uid": "d615ad88c6404305925526063012fa35",
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
                              "uid": "9c2a5a9c921643438f94bd946bbeb797",
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
                              "uid": "d89d9346c9d747fba9aa98a37d8e1663",
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
          }
        }
      ],
      "language": "en",
      "intent_display_name": "gallery",
      "intent_id": "326efb53-e5a7-48ae-b62b-c5aecc7c7fa5",
      "attributes": {
        "position": {
          "x": 1171,
          "y": 636
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
          "_tdActionId": "be2068d7-f560-4d04-829d-e6ad03846e73",
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
          }
        }
      ],
      "language": "en",
      "intent_display_name": "redirect",
      "intent_id": "b9999ef3-13ac-4080-b55e-bf950eb82b5f",
      "attributes": {
        "position": {
          "x": 1177,
          "y": 1025
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
          "_tdActionId": "10541120-c646-4780-bc94-6b99090766ff",
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
          }
        }
      ],
      "language": "en",
      "intent_display_name": "buttons",
      "intent_id": "4d3e6ad8-eca5-4a5c-aa2d-77bfb87c69d2",
      "attributes": {
        "position": {
          "x": 1672,
          "y": 824
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
          "_tdActionId": "79246604-c88e-4cfb-b789-592622609081",
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
                  "text": "text with buttons",
                  "attributes": {
                    "attachment": {
                      "type": "template",
                      "buttons": [
                        {
                          "uid": "5bfbc3fe5acc4769b62fdea496c4c091",
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
                          "uid": "bd17cbb01486421195b38de5cbd0027f",
                          "type": "action",
                          "value": "button_action",
                          "link": "",
                          "target": "blank",
                          "action": "#4d3e6ad8-eca5-4a5c-aa2d-77bfb87c69d2{\"user_city\":\"italy\"}",
                          "show_echo": true,
                          "alias": ""
                        },
                        {
                          "uid": "008e889dd3df4e44969554e112d64f6c",
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
          }
        }
      ],
      "language": "en",
      "intent_display_name": "text_with_buttons",
      "intent_id": "292ba576-b97f-4a4e-b2bc-4e6954ca0a63",
      "attributes": {
        "position": {
          "x": 1177,
          "y": 1231
        },
        "nextBlockAction": {
          "_tdActionId": "4144f035-35ff-447a-8f2e-82c1110dee2a",
          "_tdActionType": "intent",
          "intentName": ""
        },
        "connectors": {}
      }
    }
  ]
}

module.exports = { bot: bot }