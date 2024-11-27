let bot = {
    "webhook_enabled":false,
    "language":"en",
    "name":"Reply with buttons Chatbot",
    "type":"tilebot",
    "intents":[
       {
          "webhook_enabled":false,
          "enabled":true,
          "actions":[
             {
                "_tdActionType":"reply",
                "attributes":{
                   "disableInputMessage":false,
                   "commands":[
                      {
                         "type":"wait",
                         "time":500
                      },
                      {
                         "type":"message",
                         "message":{
                            "type":"text",
                            "text":"Test advanced reply use cases",
                            "attributes":{
                               "attachment":{
                                  "type":"template",
                                  "buttons":[
                                     {
                                        "uid":"ee056b28589c49bea6bb50dc720f9d8e",
                                        "type":"action",
                                        "value":"usecase1",
                                        "link":"",
                                        "target":"blank",
                                        "action":"#319ea31d-fcf9-47f0-90e8-e039e0ef7dd0",
                                        "attributes":"",
                                        "show_echo":true,
                                        "alias":""
                                     },
                                     {
                                        "uid":"13351b2402cc480ab6813872a5efffe0",
                                        "type":"action",
                                        "value":"usecase2",
                                        "link":"",
                                        "target":"blank",
                                        "action":"#6a66fa70-ebc6-4ca8-ab7d-afa4f32d6b88",
                                        "attributes":"",
                                        "show_echo":true,
                                        "alias":""
                                     }
                                  ]
                               }
                            }
                         }
                      }
                   ]
                },
                "text":"Hi, how can I help you?\r\n",
                "_tdActionId":"c185435d748640afa3edf811eb4ad0c7"
             }
          ],
          "intent_id":"ddbe5f26-5f74-4876-8cd5-1b53a9e6786a",
          "intent_display_name":"welcome",
          "language":"en",
          "attributes":{
             "position":{
                "x":491,
                "y":191
             },
             "nextBlockAction":{
                "_tdActionTitle":"",
                "_tdActionId":"6863e831-c540-465d-b412-1abe96d2a4d3",
                "_tdActionType":"intent"
             }
          }
       },
       {
          "webhook_enabled":false,
          "enabled":true,
          "actions":[
             {
                "_tdActionType":"intent",
                "intentName":"#ddbe5f26-5f74-4876-8cd5-1b53a9e6786a",
                "_tdActionId":"85b265b022ce4285a387b8a2571e36bd"
             }
          ],
          "intent_id":"34d32f4e-0f3c-4461-bac4-70f417b3f7f3",
          "question":"\\start",
          "intent_display_name":"start",
          "language":"en",
          "attributes":{
             "position":{
                "x":172,
                "y":384
             },
             "nextBlockAction":{
                "_tdActionTitle":"",
                "_tdActionId":"92aef584-59e5-47f5-b9a2-e368af3c24ce",
                "_tdActionType":"intent"
             }
          }
       },
       {
          "webhook_enabled":false,
          "enabled":true,
          "actions":[
             {
                "_tdActionType":"reply",
                "text":"I didn't understand. Can you rephrase your question?",
                "attributes":{
                   "commands":[
                      {
                         "type":"wait",
                         "time":500
                      },
                      {
                         "type":"message",
                         "message":{
                            "type":"text",
                            "text":"I didn't understand. Can you rephrase your question?",
                            "attributes":{
                               "attachment":{
                                  "type":"template",
                                  "buttons":[
                                     
                                  ]
                               }
                            }
                         }
                      }
                   ]
                },
                "_tdActionId":"5f354e89ca6c46ba8ceb001fd0857743"
             }
          ],
          "intent_id":"134cc43a-5517-40ac-ad6b-b5f6b0a15bd6",
          "intent_display_name":"defaultFallback",
          "language":"en",
          "attributes":{
             "position":{
                "x":800,
                "y":859
             },
             "nextBlockAction":{
                "_tdActionTitle":"",
                "_tdActionId":"e5f1f6fc-126d-4fe2-89fa-24a00c7802cb",
                "_tdActionType":"intent"
             }
          }
       },
       {
          "webhook_enabled":false,
          "enabled":true,
          "actions":[
             {
                "_tdActionTitle":"",
                "_tdActionId":"d9cea28e-700b-43ba-bbc4-e0c144915fcf",
                "_tdActionType":"replyv2",
                "attributes":{
                   "disableInputMessage":false,
                   "commands":[
                      {
                         "type":"wait",
                         "time":500
                      },
                      {
                         "type":"message",
                         "message":{
                            "type":"text",
                            "text":"usecase1: This reply contains two buttons",
                            "attributes":{
                               "attachment":{
                                  "type":"template",
                                  "buttons":[
                                     {
                                        "uid":"14d9a8e8700d4e05ad2f660417dd5ff1",
                                        "type":"action",
                                        "value":"btn1",
                                        "link":"",
                                        "target":"blank",
                                        "action":"#831ee6ac-8d96-46cb-8ba3-6a96fed4b628",
                                        "attributes":"",
                                        "show_echo":true,
                                        "alias":"button1, button_1"
                                     },
                                     {
                                        "uid":"ea22dbb9f84748699dc891db82c80bd9",
                                        "type":"action",
                                        "value":"btn2",
                                        "link":"",
                                        "target":"blank",
                                        "action":"#41cd1e8f-abe5-407b-abeb-48e1ae3aa965",
                                        "attributes":"",
                                        "show_echo":true,
                                        "alias":"button2, button_2"
                                     }
                                  ]
                               }
                            }
                         }
                      }
                   ]
                },
                "noInputTimeout":10000
             }
          ],
          "language":"en",
          "intent_display_name":"usecase_1",
          "intent_id":"319ea31d-fcf9-47f0-90e8-e039e0ef7dd0",
          "attributes":{
             "position":{
                "x":918,
                "y":-16
             },
             "nextBlockAction":{
                "_tdActionId":"316227ee-c3fa-4d84-b032-02e3c8a98ca2",
                "_tdActionType":"intent",
                "intentName":""
             },
             "connectors":{
                
             }
          }
       },
       {
          "webhook_enabled":false,
          "enabled":true,
          "actions":[
             {
                "_tdActionTitle":"",
                "_tdActionId":"ffd7f849-2b4d-4644-b0a9-e06e5791c748",
                "_tdActionType":"replyv2",
                "attributes":{
                   "disableInputMessage":false,
                   "commands":[
                      {
                         "type":"wait",
                         "time":500
                      },
                      {
                         "type":"message",
                         "message":{
                            "type":"text",
                            "text":"usecase2: This reply contains two buttons",
                            "attributes":{
                               "attachment":{
                                  "type":"template",
                                  "buttons":[
                                     {
                                        "uid":"14d9a8e8700d4e05ad2f660417dd5ff1",
                                        "type":"action",
                                        "value":"btn1",
                                        "link":"",
                                        "target":"blank",
                                        "action":"#831ee6ac-8d96-46cb-8ba3-6a96fed4b628",
                                        "attributes":"",
                                        "show_echo":true,
                                        "alias":"button1, button_1"
                                     },
                                     {
                                        "uid":"ea22dbb9f84748699dc891db82c80bd9",
                                        "type":"action",
                                        "value":"btn2",
                                        "link":"",
                                        "target":"blank",
                                        "action":"#41cd1e8f-abe5-407b-abeb-48e1ae3aa965",
                                        "attributes":"",
                                        "show_echo":true,
                                        "alias":"button2, button_2"
                                     }
                                  ]
                               }
                            }
                         }
                      }
                   ]
                },
                "noInputTimeout":10000,
                "noMatchIntent":"#042f2c72-0100-4b98-9ef1-27c249a7b314",
                "noInputIntent": "#300cbfbd-fedd-4db2-8d50-4714e8e1a425"
             }
          ],
          "language":"en",
          "intent_display_name":"usecase_2",
          "intent_id":"6a66fa70-ebc6-4ca8-ab7d-afa4f32d6b88",
          "attributes":{
             "position":{
                "x":891,
                "y":385
             },
             "nextBlockAction":{
                "_tdActionId":"bed921cc-9226-4bb7-938c-3edb7cd02509",
                "_tdActionType":"intent",
                "intentName":""
             },
             "connectors":{
                
             }
          }
       },
       {
          "webhook_enabled":false,
          "enabled":true,
          "actions":[
             {
                "_tdActionTitle":"",
                "_tdActionId":"14d3e1c6-9b16-4c3b-a939-9778b2f1f569",
                "_tdActionType":"reply",
                "attributes":{
                   "disableInputMessage":false,
                   "commands":[
                      {
                         "type":"wait",
                         "time":500
                      },
                      {
                         "type":"message",
                         "message":{
                            "type":"text",
                            "text":"btn1",
                            "attributes":{
                               "attachment":{
                                  "type":"template",
                                  "buttons":[
                                     
                                  ]
                               }
                            }
                         }
                      }
                   ]
                }
             }
          ],
          "language":"en",
          "intent_display_name":"btn1_intent",
          "intent_id":"831ee6ac-8d96-46cb-8ba3-6a96fed4b628",
          "attributes":{
             "position":{
                "x":1385,
                "y":51
             },
             "nextBlockAction":{
                "_tdActionId":"2edfd877-8092-491d-bbdb-a3b50d9b59a3",
                "_tdActionType":"intent",
                "intentName":""
             },
             "connectors":{
                
             }
          }
       },
       {
          "webhook_enabled":false,
          "enabled":true,
          "actions":[
             {
                "_tdActionTitle":"",
                "_tdActionId":"f5d1ef6c-04d9-447c-be36-7335a0f2d27f",
                "_tdActionType":"reply",
                "attributes":{
                   "disableInputMessage":false,
                   "commands":[
                      {
                         "type":"wait",
                         "time":500
                      },
                      {
                         "type":"message",
                         "message":{
                            "type":"text",
                            "text":"btn2",
                            "attributes":{
                               "attachment":{
                                  "type":"template",
                                  "buttons":[
                                     
                                  ]
                               }
                            }
                         }
                      }
                   ]
                }
             }
          ],
          "language":"en",
          "intent_display_name":"btn2_intent",
          "intent_id":"41cd1e8f-abe5-407b-abeb-48e1ae3aa965",
          "attributes":{
             "position":{
                "x":1393,
                "y":246
             },
             "nextBlockAction":{
                "_tdActionId":"2d6f1547-fc2e-4024-8c5e-08a7c13dd90f",
                "_tdActionType":"intent",
                "intentName":""
             },
             "connectors":{
                
             }
          }
       },
       {
          "webhook_enabled":false,
          "enabled":true,
          "actions":[
             {
                "_tdActionTitle":"",
                "_tdActionId":"1ff8f473-6c47-4319-ae57-15c0be33c188",
                "_tdActionType":"reply",
                "attributes":{
                   "disableInputMessage":false,
                   "commands":[
                      {
                         "type":"wait",
                         "time":500
                      },
                      {
                         "type":"message",
                         "message":{
                            "type":"text",
                            "text":"no_match",
                            "attributes":{
                               "attachment":{
                                  "type":"template",
                                  "buttons":[
                                     
                                  ]
                               }
                            }
                         }
                      }
                   ]
                }
             }
          ],
          "language":"en",
          "intent_display_name":"no_match_intent",
          "intent_id":"042f2c72-0100-4b98-9ef1-27c249a7b314",
          "attributes":{
             "position":{
                "x":1386,
                "y":452
             },
             "nextBlockAction":{
                "_tdActionId":"c3a34b6f-d1d7-4052-b223-a9bc09e55d29",
                "_tdActionType":"intent",
                "intentName":""
             },
             "connectors":{
                
             }
          }
       },
       {
        "webhook_enabled": false,
        "enabled": true,
        "actions": [
            {
                "_tdActionTitle": "",
                "_tdActionId": "a210926d-acf3-46db-ad5f-e5fb94d42f89",
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
                                "text": "no_input",
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
        "intent_display_name": "no_input_intent",
        "intent_id": "300cbfbd-fedd-4db2-8d50-4714e8e1a425",
        "attributes": {
            "position": {
                "x": 1392,
                "y": 676
            },
            "nextBlockAction": {
                "_tdActionId": "0df5c56f-a566-477a-b0b5-53e0d1fd7ae1",
                "_tdActionType": "intent",
                "intentName": ""
            },
            "connectors": {}
        }
    }]
}

module.exports = { bot: bot };
