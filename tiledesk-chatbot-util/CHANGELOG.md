# Library for Tiledesk External Chatbots, node.js

This library is on npm: https://www.npmjs.com/package/@tiledesk/tiledesk-chatbot-util

### 0.8.37
- removed "\" from directive name
- added directive-prefix. New template to have a directive parsed_ \_td{DIRECTIVE NAME}. This will reduce the necessity to escape the directive names because of their name uniqueness in the Tiledesk domain.
- "\agent" legacy directive is still supported

### 0.8.36
- splitPars() - bug fix

### 0.8.35
- introduced splitPars() - splits a message in multiple messages (commands) separated by paragraphs

### 0.8.34
- bug fixes

### 0.8.31
- added new splitMessage(text, splitw)

### 0.8.30
- added optional splitw (the split word) to findSplits(text, splitw)

### 0.8.29
- renamed *_COMMAND constants in *_DIRECTIVE

### 0.8.28
- renamed parse_directives() in parseDirectives()

### 0.8.27
- added findDirective() method to parse_directives() return object

### 0.8.26
- added parse_directives()

### 0.8.25
- added test for findSplits(): no splits will return "one" command with the message text content

### 0.8.24
- added test for findSplits()

### 0.8.23 - online
- introduced command tdIntentNoEcho

### 0.8.22 - online
- tdActionShowReply renamed tdActionShowEcho

### 0.8.20 - online
- added new synthax for 'parent' link buttons: '<'
- added new synthax for 'self' link buttons: '>'

### 0.8.19 (online)
- console.log removed

### 0.8.18 (online)
- Added test case for tdFrame: parseReply() of "tdFrame with localhost and port specified"
- webhook tag updated, get webhook from parsed_reply.webhook, possible values: webhook=true or webhook=HTTP://URL
- Button tag now requires a space after * (this avoids conflict with markdown synthax for bold and italic)

### 0.8.17 (online)
- bullet button TEMPORARY allows for no spaces between * and text. EX. *Button and * Button both supported
- button link simply expresses as a link after the button text as *Button text https://link.to
- button link blank simply expressed as a link single-spaced from text i.e. *Button text https://link.to
- button link parent simply expressed as a link double-spaced from text i.e. *Button text  https://link.to

### 0.8.16 (online)
- deployed new bullet button (now mandatory at least one space between * and the first button text)
- removed support for old bullet button

### 0.8.15 (online)
- added is_agent_handoff_command()

### 0.8.14
- youtube videos /embed/ url bug fix

### 0.8.13
- microlang automatically moves youtube videos to the /embed/ url to allow embedding in frames

### 0.8.12
- added: microlang tag tdVideo
- refactored parse() method

### 0.8.11
- added: microlang tag tdButton
- added: microlang tag tdFrame
- added: microlang test splitted in more files

### 0.8.8
- added: microlang tag tdAction
- added: microlang tag tdActionShowReply

### 0.8.6
- added: microlang tag tdLink
- added: microlang tag tdLinkBlank
- added: microlang tag tdLinkParent
