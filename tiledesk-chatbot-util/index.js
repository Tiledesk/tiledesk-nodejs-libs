/* 
    ver 0.8.11
    Andrea Sponziello - (c) Tiledesk.com
*/

class TiledeskChatbotUtil {    

  static fullname_email_in(command) {
    if (command.payload &&
        command.payload.fields &&
        command.payload.fields.email &&
        command.payload.fields.fullname) {
      return {
        email: command.payload.fields.email.stringValue,
        fullname: command.payload.fields.fullname.stringValue
      }
    }
    return null
  }

  static dep_in(command) {
    if (command.payload &&
        command.payload.fields &&
        command.payload.fields.dep_id) {
      return command.payload.fields.dep_id.stringValue
    }
    return null
  }

  /* Splits a message in multiple commands using the microlanguage
  \split:TIME
  command \split:TIME must stand on a line of his own as in the following example
  Ex.

  Hi!
  \split:1000
  Please tell me your email

  Sends two messages delayed by 1 second
  */
  static findSplits(text) {
      var commands = []
      const split_pattern = /^(\\split[:0-9]*)/mg //ex. \split:500
      var parts = text.split(split_pattern)
      for (var i=0; i < parts.length; i++) {
          let p = parts[i]
          // console.log("part: " + p)
          if (i % 2 != 0) {
          // split command
          // console.log("split command: " + p)
          var split_parts = p.split(":")
          var wait_time = 1000
          if (split_parts.length == 2) {
              wait_time = split_parts[1]
          }
          // console.log("wait time: " + wait_time)
          var command = {}
          command.type = "wait"
          command.time = parseInt(wait_time, 10)
          commands.push(command)
          }
          else {
          // message command
          var command = {}
          command.type = "message"
          command.text = p.trim()
          commands.push(command)
          // if ( i == parts.length -1 &&
          //     result['fulfillmentMessages'] &&
          //     result['fulfillmentMessages'][1] &&
          //     result['fulfillmentMessages'][1].payload) {
          //     command.payload = result['fulfillmentMessages'][1].payload
          // }
          }
      }
      return commands
  }

  static TEXT_KEY = 'text';
  static TYPE_KEY = 'type';
  static VALUE_KEY = 'value';
  static ATTRIBUTES_KEY = 'attributes';
  static METADATA_KEY = 'metadata';
  static LINK_KEY = 'link';
  static TARGET_KEY = 'target';
  static ACTION_KEY = 'action';
  static SHOW_REPLY_KEY = 'show_reply';
  static SRC_KEY = 'src';
  // values
  static TYPE_IMAGE = 'image';
  static TYPE_FRAME = 'frame';
  static TYPE_TEXT = 'text';
  static TYPE_BUTTON_TEXT = 'text';
  static TYPE_BUTTON_URL = 'url';
  static TYPE_BUTTON_ACTION = 'action';
  static TARGET_BUTTON_LINK_BLANK = 'blank';
  static TARGET_BUTTON_LINK_PARENT = 'parent';

  static parseReply(text) {
      let reply = {
          "message": {}
      }
      reply.message[TiledeskChatbotUtil.TEXT_KEY] = text
      reply.message[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_TEXT
      // looks for images
      // images are defined as a line starting with:
      // \image:IMAGE_URL
      // with optional size:
      // \image:WIDTH-HEIGHT:IMAGE_URL
      // ex.:
      // \image:100-100:http://image.com/image.gif
      const image_pattern = /^\\image:.*/mg;
      let images = text.match(image_pattern);
      // console.log("images: ", images)
      if (images && images.length > 0) {
        const image_text = images[0]
        text = text.replace(image_text,"").trim()
        var image_url = image_text.replace("\\image:", "")

        var width = 200
        var height = 200
        // parse image size (optional) ex: \image:100-100:http://image.com/image.gif
        let image_size_pattern = /^([0-9]*-[0-9]*):(.*)/;
        let image_size_text = image_url.match(image_size_pattern)
        if (image_size_text && image_size_text.length == 3) {
          image_url = image_size_text[2]
          let image_size = image_size_text[1]
          // console.log("size: " + image_size)
          // console.log("imageì url: " + image_url)
          let split_pattern = /-/
          let size_splits = image_size.split(split_pattern)
          if (size_splits.length == 2) {
            width = size_splits[0]
            height = size_splits[1]
          }
        }
        reply.message[TiledeskChatbotUtil.TEXT_KEY] = text
        reply.message[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_IMAGE
        reply.message[TiledeskChatbotUtil.METADATA_KEY] = {
          src: image_url,
          width: width,
          height: height
        }
      }

      // looks for tdImages, new tag!
      // images are defined as a line starting with:
      // tdImage:IMAGE_URL
      // with optional size:
      // tdImage:WIDTH-HEIGHT:IMAGE_URL
      // ex.:
      // tdImage:100-100:http://image.com/image.gif
      const tdImage_pattern = /^(tdImage.*):(http(?:s)*.*)/m;
      const tdimages_match = text.match(tdImage_pattern);
      console.log("tdimages_match: ", tdimages_match)
      // tdimages:  [
      //   'tdImage...:IMAGE_URL', // [0]
      //   'tdImage...', // [1]
      //   'IMAGE_URL',  // [2]
      //   index: 11,
      //   input: 'Intro text\ntdImage...:IMAGE_URL',
      //   groups: undefined
      // ]
      if (tdimages_match && tdimages_match.length === 3) {
        const image_text = tdimages_match[0]; // 'tdImage...:IMAGE_URL'
        const image_tag = tdimages_match[1]; // 'tdImage...'
        const image_url = tdimages_match[2]; // 'IMAGE_URL'
        text = text.replace(image_text,"").trim() // clean message from this tag suddenly after parsing
        let width = null
        let height = null
        // parse image size (optional) ex: \tdImage,w100 h100:http://image.com/image.gif
        // let image_size_pattern = /^.*,(w[0-9]+)(h[0-9]+)/;
        let image_size_pattern = /^.*,\s*(w[0-9]+)*\s*(h[0-9]+)*/;
        let image_size_match = image_tag.match(image_size_pattern)
        console.log("image_size_match:", image_size_match);
        // image_size_match: [
        //   'tdImage, w200',
        //   'w200',
        //   undefined,
        //   index: 0,
        //   input: 'tdImage, w200',
        //   groups: undefined
        // ]
        if (image_size_match && image_size_match.length >= 2) {
          const first_capture = image_size_match[1];
          if (first_capture && first_capture.startsWith("w")) { // on one capture can be 'w' or 'h'
            width = parseInt(first_capture.substring(1));
          }
          else if (first_capture && first_capture.startsWith("h")) {
            height = parseInt(first_capture.substring(1));
          }
          if (image_size_match.length > 2) { // on the second should be 'h' ...
            const second_capture = image_size_match[2];
            if (second_capture && second_capture.startsWith('h')) { // ...but it's better to check
              height = parseInt(second_capture.substring(1));
            }
          }
        }
        reply.message[TiledeskChatbotUtil.TEXT_KEY] = text
        reply.message[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_IMAGE
        reply.message[TiledeskChatbotUtil.METADATA_KEY] = {
          src: image_url
        }
        if (width) {
          reply.message[TiledeskChatbotUtil.METADATA_KEY].width = width;
        }
        if (height) {
          reply.message[TiledeskChatbotUtil.METADATA_KEY].height = height;
        }
      }

      // renders an iframe in the widget
      // iframes are defined as a line starting with:
      // tdFrame::FRAME_URL
      // with optional size:
      // tdFrame,wWIDTH hHEIGHT:FRAME_URL
      // ex.:
      // tdFrame:http://iframe.com/index.html
      // with size:
      // tdFrame,w100 h100:http://iframe.com/index.html
      // WORK IN PROGRESS...
      const tdFrame_pattern = /^(tdFrame.*):(http(?:s)*.*)/m;
      const tdframes_match = text.match(tdFrame_pattern);
      console.log("tdframes_match: ", tdframes_match)
      // tdframes:  [
      //   'tdFrame...:IMAGE_URL', // [0]
      //   'tdFrame...', // [1]
      //   'URL',  // [2]
      //   index: 11,
      //   input: 'Intro text\ntdFrame...:URL',
      //   groups: undefined
      // ]
      if (tdframes_match && tdframes_match.length === 3) {
        const frame_text = tdframes_match[0]; // 'tdFrame...:IMAGE_URL'
        const frame_tag = tdframes_match[1]; // 'tdFrame...'
        const frame_url = tdframes_match[2]; // 'URL'
        text = text.replace(frame_text,"").trim() // clean message from this tag suddenly after parsing
        let width = null
        let height = null
        // parse size (optional) ex: \tdFrame,w100 h100:http://image.com/image.gif
        let size_pattern = /^.*,\s*(w[0-9]+)*\s*(h[0-9]+)*/;
        let size_match = frame_tag.match(size_pattern)
        console.log("image_size_match:", size_match);
        // size_match: [
        //   'tdFrame, w200',
        //   'w200',
        //   undefined,
        //   index: 0,
        //   input: 'tdFrame, w200',
        //   groups: undefined
        // ]
        if (size_match && size_match.length >= 2) {
          const first_capture = size_match[1];
          if (first_capture && first_capture.startsWith("w")) { // on one capture can be 'w' or 'h'
            width = parseInt(first_capture.substring(1));
          }
          else if (first_capture && first_capture.startsWith("h")) {
            height = parseInt(first_capture.substring(1));
          }
          if (size_match.length > 2) { // on the second should be 'h' ...
            const second_capture = size_match[2];
            if (second_capture && second_capture.startsWith('h')) { // ...but it's better to check
              height = parseInt(second_capture.substring(1));
            }
          }
        }
        reply.message[TiledeskChatbotUtil.TEXT_KEY] = text
        reply.message[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_FRAME
        reply.message[TiledeskChatbotUtil.METADATA_KEY] = {
          src: frame_url
        }
        if (width) {
          reply.message[TiledeskChatbotUtil.METADATA_KEY].width = width;
        }
        if (height) {
          reply.message[TiledeskChatbotUtil.METADATA_KEY].height = height;
        }
      }
    
      // looks for bullet buttons
      // button pattern is a line that starts with *TEXT_OF_BUTTON (every button on a line)
      const button_pattern = /^\*.*/mg;
      const text_buttons = text.match(button_pattern);
      if (text_buttons) {
        // ricava il testo rimuovendo i bottoni
        const text_with_removed_buttons = text.replace(button_pattern,"").trim()
        reply.message[TiledeskChatbotUtil.TEXT_KEY] = text_with_removed_buttons
        // estrae i bottoni
        let buttons = []
        text_buttons.forEach(element => {
          const remove_extra_from_button = /^\*/mg; // removes initial "*"
          let button_text = element.replace(remove_extra_from_button, "").trim();
          let button = TiledeskChatbotUtil.parse_button_from_string(button_text);
          // var button = {}
          // button[TYPE_KEY] = "text"
          // button["value"] = button_text
          buttons.push(button)
        });
        if (reply.message[TiledeskChatbotUtil.ATTRIBUTES_KEY] == null) {
          reply.message[TiledeskChatbotUtil.ATTRIBUTES_KEY] = {}
        }
        reply.message[TiledeskChatbotUtil.ATTRIBUTES_KEY]["attachment"] = {
          type:"template",
          buttons: buttons
        }
        text = text_with_removed_buttons
      }
      else {
        // console.log("no text buttons")
      }

      // looks for buttons
      // button pattern is a line that starts with tdButton: TEXT_OF_BUTTON (every button on a line)
      const tdbutton_pattern = /^tdButton:.*/mg;
      const tdbuttons_match = text.match(tdbutton_pattern);
      console.log("tdbutton matches:", tdbuttons_match)
      if (tdbuttons_match) {
        const text_with_removed_buttons = text.replace(tdbutton_pattern,"").trim()
        reply.message[TiledeskChatbotUtil.TEXT_KEY] = text_with_removed_buttons
        // extracts buttons
        let buttons = []
        tdbuttons_match.forEach(element => {
          const remove_extra_from_button = /^tdButton:/; // removes the initial 'tdButton:'
          let button_text = element.replace(remove_extra_from_button, "").trim();
          let button = TiledeskChatbotUtil.parse_button_from_string(button_text);
          // var button = {}
          // button[TYPE_KEY] = "text"
          // button["value"] = button_text
          buttons.push(button)
        });
        if (reply.message[TiledeskChatbotUtil.ATTRIBUTES_KEY] == null) {
          reply.message[TiledeskChatbotUtil.ATTRIBUTES_KEY] = {}
        }
        reply.message[TiledeskChatbotUtil.ATTRIBUTES_KEY]["attachment"] = {
          type:"template",
          buttons: buttons
        }
        text = text_with_removed_buttons
      }
      else {
        // console.log("no text buttons")
      }

      // looks for a webhook url
      // webhooks are defined as a line starting with \webhook:URL
      var webhook_pattern = /^\\webhook:.*/mg;
      var webhooks = text.match(webhook_pattern);
      if (webhooks && webhooks.length > 0) {
        const webhook_text = webhooks[0]
        // console.log("webhook_text: " + webhook_text)
        text = text.replace(webhook_text,"").trim()
        const webhook_url = webhook_text.replace("\\webhook:", "")
        // console.log("webhook_url " + webhook_url)
        reply.webhook = webhook_url
      }

      return reply
  }

  static parse_button_from_string(button_string) {
    const tdlink_pattern = /(tdLink:)(\S+)/m;
    const tdlink_blank_pattern = /(tdLinkBlank:)(\S+)/m;
    const tdlink_parent_pattern = /(tdLinkParent:)(\S+)/m;
    const tdaction_pattern = /(tdAction:)(\S+)/m;
    const tdaction_show_reply_pattern = /(tdActionShowReply:)(\S+)/m;
    const match_button_link = button_string.match(tdlink_pattern);
    const match_button_link_blank = button_string.match(tdlink_blank_pattern);
    const match_button_link_parent = button_string.match(tdlink_parent_pattern);
    const match_button_action = button_string.match(tdaction_pattern);
    const match_button_action_show_reply = button_string.match(tdaction_show_reply_pattern);
    // console.log('text_button_link', text_button_link)
    // console.log('text_button_link_blank', text_button_link_blank)
    // console.log('text_button_link_parent', text_button_link_parent)
    // console.log('text_button_action', text_button_action)
    if (match_button_link && match_button_link.length && match_button_link.length === 3) {
      const button =  TiledeskChatbotUtil.create_link_button_by_match(button_string, match_button_link, TiledeskChatbotUtil.TARGET_BUTTON_LINK_BLANK);
      return button;
    }
    else if (match_button_link_blank && match_button_link_blank.length && match_button_link_blank.length === 3) {
      const button =  TiledeskChatbotUtil.create_link_button_by_match(button_string, match_button_link_blank, TiledeskChatbotUtil.TARGET_BUTTON_LINK_BLANK);
      return button;
    }
    else if (match_button_link_parent && match_button_link_parent.length && match_button_link_parent.length === 3) {
      const button =  TiledeskChatbotUtil.create_link_button_by_match(button_string, match_button_link_parent, TiledeskChatbotUtil.TARGET_BUTTON_LINK_PARENT);
      return button;
    }
    else if (match_button_action && match_button_action.length && match_button_action.length === 3) {
      const show_reply = false;
      const button =  TiledeskChatbotUtil.create_action_button_by_match(button_string, match_button_action, show_reply);
      return button;
    }
    else if (match_button_action_show_reply && match_button_action_show_reply.length && match_button_action_show_reply.length === 3) {
      const show_reply = true;
      const button =  TiledeskChatbotUtil.create_action_button_by_match(button_string, match_button_action_show_reply, show_reply);
      return button;
    }
    else {
      // No subpatterns = text button
      let button = {};
      button[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_TEXT;
      button[TiledeskChatbotUtil.VALUE_KEY] = button_string;
      return button;
    }
    return button
  }

  static create_link_button_by_match(button_string, match, target) {
    let button = {};
    const command = match[0];
    const link = match[2];
    const button_label = button_string.replace(command,'').trim();
    // console.log("button_url_label", button_label)
    button[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_BUTTON_URL;
    button[TiledeskChatbotUtil.VALUE_KEY] = button_label;
    button[TiledeskChatbotUtil.LINK_KEY] = link;
    button[TiledeskChatbotUtil.TARGET_KEY] = target;
    return button;
  }

  static create_action_button_by_match(button_string, match, show_reply) {
    let button = {};
    const command = match[0];
    const action = match[2];
    const button_label = button_string.replace(command,'').trim();
    button[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_BUTTON_ACTION;
    button[TiledeskChatbotUtil.VALUE_KEY] = button_label;
    button[TiledeskChatbotUtil.ACTION_KEY] = action;
    button[TiledeskChatbotUtil.SHOW_REPLY_KEY] = show_reply;
    return button;
  }
}

// var tiledeskChatbotUtil = new TiledeskChatbotUtil();

module.exports = { TiledeskChatbotUtil };