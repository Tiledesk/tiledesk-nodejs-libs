/* 
    ver 0.8.21
    Andrea Sponziello - (c) Tiledesk.com
*/

const url = require('url');

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

  /**
 * it checks if the message text contains the \agent command
 * @param {*} msg The message
 */
static is_agent_handoff_command(msg) {
  console.log("msg:", msg);
  if (!msg || !msg.text) {
    return {
      'agent_handoff': null,
      'text': null
    }
  }
  const text = msg.text;
  // console.log("msg.text:", msg.text);
  // console.log("TiledeskChatbotUtil.AGENT_COMMAND:", TiledeskChatbotUtil.AGENT_COMMAND.replace(/\\\\/g, '\\'));
  const agent_pattern = new RegExp('^(' + TiledeskChatbotUtil.AGENT_COMMAND.replace(/\\/g, '\\\\') + ')$', 'm');
  // console.log("agent_pattern:", agent_pattern);
  const match_agent = text.match(agent_pattern);
  // console.log("match_agent: ", match_agent);
  const agent_handoff = null;
  if (match_agent && match_agent.length >=2) {
    // console.log("match!");
    let parts = text.split('\\agent');
    // console.log(parts)
    const new_msg_text = parts[0].trim()
    // console.log(new_msg_text)
    return {
      'agent_handoff': TiledeskChatbotUtil.AGENT_COMMAND,
      'text': new_msg_text
    }
  }
  return {
    'agent_handoff': null,
    'text': text
  }
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
  static SHOW_ECHO_KEY = 'show_echo';
  static SRC_KEY = 'src';
  static FRAME_TYPE_KEY = 'type';
  static WEBHOOK_KEY = 'webhook';
  // values
  static TYPE_IMAGE = 'image';
  static TYPE_FRAME = 'frame';
  static TYPE_TEXT = 'text';
  static TYPE_VIDEO = 'video';
  static TYPE_BUTTON_TEXT = 'text';
  static TYPE_BUTTON_URL = 'url';
  static TYPE_BUTTON_ACTION = 'action';
  static TARGET_BUTTON_LINK_BLANK = 'blank';
  static TARGET_BUTTON_LINK_PARENT = 'parent';
  static TARGET_BUTTON_LINK_SELF = 'self';
  // tags
  static BUTTON_TAG = '\\*\\s+'; // backup: '\\*\\s*'; NO spaces 
  static FRAME_TAG = 'tdFrame';
  static VIDEO_TAG = 'tdVideo';
  static IMAGE_TAG = 'tdImage';
  static ACTION_TAG = 'tdAction:';
  static INTENT_TAG = 'tdIntent:';
  
  static ACTION_SHOW_ECHO_TAG = 'tdActionShowEcho:';
  // other
  static AGENT_COMMAND = '\\agent';

  static parseReply(text) {
      let reply = {
          "message": {}
      }
      reply.message[TiledeskChatbotUtil.TEXT_KEY] = text
      reply.message[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_TEXT

      let parsed;
      parsed = TiledeskChatbotUtil.parse_legacy_image(text, reply);
      parsed = TiledeskChatbotUtil.parse_tdImage(parsed.text, parsed.reply);
      parsed = TiledeskChatbotUtil.parse_tdFrame(parsed.text, parsed.reply);
      parsed = TiledeskChatbotUtil.parse_tdVideo(parsed.text, parsed.reply);
      // parsed = TiledeskChatbotUtil.parse_bullet_buttons(parsed.text, parsed.reply);
      parsed = TiledeskChatbotUtil.parse_tdButtons(parsed.text, parsed.reply);
      parsed = TiledeskChatbotUtil.parse_webhook_with_url(parsed.text, parsed.reply);
      parsed = TiledeskChatbotUtil.parse_webhook_on_off(parsed.text, parsed.reply);

      text = parsed.text;
      reply = parsed.reply;

      return reply
  }

  static parse_button_from_string(button_string) {
    const tdlink_pattern = /\s{1}((http|https):\/\/\S*)/m
    //const tdlink_parent_pattern = /\s{2}((http|https):\/\/\S*)/m
    const tdlink_parent_pattern = /\s{1}<\s{1}((http|https):\/\/\S*)/m // '<' means parent
    const tdlink_self_pattern = /\s{1}>\s{1}((http|https):\/\/\S*)/m // '>' means self (the widget itself)

    const tdaction_tag = TiledeskChatbotUtil.ACTION_TAG; // 'tdAction:';
    const tdaction_pattern = new RegExp('(' + tdaction_tag + ')(\\S+)', 'm');
    
    const tdaction_show_echo_tag = TiledeskChatbotUtil.ACTION_SHOW_ECHO_TAG; // 'tdActionShowReply:';
    const tdaction_show_echo_pattern = new RegExp('(' + tdaction_show_echo_tag + ')(\\S+)', 'm');

    const tdintent_tag = TiledeskChatbotUtil.INTENT_TAG; // 'tdIntent:';
    const tdintent_pattern = new RegExp('(' + tdintent_tag + ')(\\S+)', 'm');

    const match_button_link = button_string.match(tdlink_pattern);
    const match_button_link_parent = button_string.match(tdlink_parent_pattern);
    const match_button_link_self = button_string.match(tdlink_self_pattern);
    const match_button_action = button_string.match(tdaction_pattern);
    const match_button_intent = button_string.match(tdintent_pattern);
    
    const match_button_action_show_echo = button_string.match(tdaction_show_echo_pattern);
    // console.log('match_button_link*********>>>', match_button_link)
    // console.log('match_button_link_parent', match_button_link_parent)
    if (match_button_action && match_button_action.length && match_button_action.length === 3) {
      const show_echo = false;
      const button =  TiledeskChatbotUtil.create_action_button_by_match(button_string, match_button_action, show_echo);
      return button;
    }
    else if (match_button_action_show_echo && match_button_action_show_echo.length && match_button_action_show_echo.length === 3) {
      const show_echo = true;
      const button =  TiledeskChatbotUtil.create_action_button_by_match(button_string, match_button_action_show_echo, show_echo);
      return button;
    }
    else if (match_button_intent && match_button_intent.length && match_button_intent.length === 3) {
      const show_echo = true;
      const button =  TiledeskChatbotUtil.create_action_button_by_match(button_string, match_button_intent, show_echo);
      return button;
    }
    else if (match_button_link_parent && match_button_link_parent.length && match_button_link_parent.length === 3) {
      const button =  TiledeskChatbotUtil.create_link_button_by_match(button_string, match_button_link_parent, TiledeskChatbotUtil.TARGET_BUTTON_LINK_PARENT);
      return button;
    }
    else if (match_button_link_self && match_button_link_self.length && match_button_link_self.length === 3) {
      const button =  TiledeskChatbotUtil.create_link_button_by_match(button_string, match_button_link_self, TiledeskChatbotUtil.TARGET_BUTTON_LINK_SELF);
      return button;
    }
    else if (match_button_link && match_button_link.length && match_button_link.length === 3) {
      const button =  TiledeskChatbotUtil.create_link_button_by_match(button_string, match_button_link, TiledeskChatbotUtil.TARGET_BUTTON_LINK_BLANK);
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
    // match:
    // [
    //   ' http://www.google.com',
    //   'http://www.google.com',
    //   'http',
    //   index: 11,
    //   input: 'Link button http://www.google.com',
    //   groups: undefined
    // ]
    let button = {};
    const command = match[0];
    const link = match[1];
    const button_label = button_string.replace(command,'').trim();
    // console.log("button_url_label", button_label)
    button[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_BUTTON_URL;
    button[TiledeskChatbotUtil.VALUE_KEY] = button_label;
    button[TiledeskChatbotUtil.LINK_KEY] = link;
    button[TiledeskChatbotUtil.TARGET_KEY] = target;
    return button;
  }

  static create_action_button_by_match(button_string, match, show_echo) {
    let button = {};
    const command = match[0];
    const action = match[2];
    const button_label = button_string.replace(command,'').trim();
    button[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_BUTTON_ACTION;
    button[TiledeskChatbotUtil.VALUE_KEY] = button_label;
    button[TiledeskChatbotUtil.ACTION_KEY] = action;
    button[TiledeskChatbotUtil.SHOW_ECHO_KEY] = show_echo;
    return button;
  }

  // looks for images
  // images are defined as a line starting with:
  // \image:IMAGE_URL
  // with optional size:
  // \image:WIDTH-HEIGHT:IMAGE_URL
  // ex.:
  // \image:100-100:http://image.com/image.gif
  static parse_legacy_image(text, reply) {
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
    return {
      text: text,
      reply: reply
    }
  }

  // tdImage:IMAGE_URL
  // with optional size:
  // tdImage,wWIDTH hHEIGHT:FRAME_URL
  // ex.:
  // tdImage:http://site.com/image.jpg
  // specify image size:
  // tdImage,w100 h100:http://site.com/image.jpg
  static parse_tdImage(text, reply) {
    const image_tag = TiledeskChatbotUtil.IMAGE_TAG; // 'tdImage';
    const tdImage_pattern = new RegExp('^(' + image_tag + '.*):(http(?:s)*.*)', 'm');
    // const tdImage_pattern = /^(tdImage.*):(http(?:s)*.*)/m;
    const tdimages_match = text.match(tdImage_pattern);
    // console.log("tdimages_match: ", tdimages_match)
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
      // console.log("image_size_match:", image_size_match);
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
    return {
      text: text,
      reply: reply
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
  static parse_tdFrame(text, reply) {
    const frame_tag = TiledeskChatbotUtil.FRAME_TAG; //'tdFrame';
    // const pattern = new RegExp('^(' + image_tag + '.*):(http(?:s)*.*)', 'm');
    // const tdFrame_pattern = /^(tdFrame.*):(http(?:s)*.*)/m;
    const tdFrame_pattern = new RegExp('^(' + frame_tag + '.*):(http(?:s)*.*)', 'm');
    const tdframes_match = text.match(tdFrame_pattern);
    // console.log("tdframes_match: ", tdframes_match)
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
      // parse size (optional) ex: \tdFrame,w100 h100:http://image.com/index.html
      let size_pattern = /^.*,\s*(w[0-9]+)*\s*(h[0-9]+)*/;
      let size_match = frame_tag.match(size_pattern)
      // console.log("frame_size_match:", size_match);
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
    return {
      text: text,
      reply: reply
    }
  }

  // renders a video in as iframe in the widget.
  // It's just an alias for an iframe
  // tdVideo is defined as a line starting with:
  // tdVideo:VIDEO_URL
  // with optional size:
  // tdVideo,wWIDTH hHEIGHT:VIDEO_URL
  // ex.:
  // tdVideo:http://video.com/video.mp4
  // with size:
  // tdVideo,w100 h100:http://video.com/video.mp4
  static parse_tdVideo(text, reply) {
    // const image_tag = 'tdImage';
    // const tdImage_pattern = new RegExp('^(' + image_tag + '.*):(http(?:s)*.*)', 'm');
    const tdvideo_tag = TiledeskChatbotUtil.VIDEO_TAG; // 'tdVideo';
    // const tdVideo_pattern = /^(tdVideo.*):(http(?:s)*.*)/m;
    const tdVideo_pattern = new RegExp('^(' + tdvideo_tag + '.*):(http(?:s)*.*)', 'm');
    const tdvideos_match = text.match(tdVideo_pattern);
    // console.log("tdvideos_match: ", tdvideos_match)
    // tdvideos:  [
    //   'tdVideo...:VIDEO_URL', // [0]
    //   'tdVideo...', // [1]
    //   'URL',  // [2]
    //   index: 11,
    //   input: 'Intro text\ntdVideo...:URL',
    //   groups: undefined
    // ]
    if (tdvideos_match && tdvideos_match.length === 3) {
      const video_text = tdvideos_match[0]; // 'tdVideo...:IMAGE_URL'
      const video_tag = tdvideos_match[1]; // 'tdVideo...'
      let video_url = tdvideos_match[2]; // 'URL'
      video_url = TiledeskChatbotUtil.check_is_youtube_video_url(video_url);
      text = text.replace(video_text,"").trim() // clean message from this tag suddenly after parsing
      let width = null
      let height = null
      // parse size (optional) ex: \tdVideo,w100 h100:http://image.com/video.mp4
      let size_pattern = /^.*,\s*(w[0-9]+)*\s*(h[0-9]+)*/;
      let size_match = video_tag.match(size_pattern)
      // console.log("video_size_match:", size_match);
      // size_match: [
      //   'tdVideo, w200',
      //   'w200',
      //   undefined,
      //   index: 0,
      //   input: 'tdVideo, w200',
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
        src: video_url
      }
      reply.message[TiledeskChatbotUtil.METADATA_KEY][TiledeskChatbotUtil.FRAME_TYPE_KEY] = TiledeskChatbotUtil.TYPE_VIDEO;
      if (width) {
        reply.message[TiledeskChatbotUtil.METADATA_KEY].width = width;
      }
      if (height) {
        reply.message[TiledeskChatbotUtil.METADATA_KEY].height = height;
      }
    }
    return {
      text: text,
      reply: reply
    }
  }

  static check_is_youtube_video_url(video_url) {
    if (video_url.startsWith('https://www.youtube.com/watch?v=')) {
      const queryObject = url.parse(video_url,true).query;
      // console.log("video_url v", queryObject['v']);
      const video_id = queryObject['v'];
      if (video_id) {
        const youtube_embed_video_url = 'https://www.youtube.com/embed/' + video_id;
        return youtube_embed_video_url;
      }
    }
    else {
      return video_url;
    }
  }

  // // looks for bullet buttons
  // // button pattern is a line that starts with *TEXT_OF_BUTTON (every button on a line)
  // static parse_bullet_buttons(text, reply) {
  //   const button_pattern = /^\*\S+.*/mg;
  //   const text_buttons = text.match(button_pattern);
  //   if (text_buttons) {
  //     // ricava il testo rimuovendo i bottoni
  //     const text_with_removed_buttons = text.replace(button_pattern,"").trim()
  //     reply.message[TiledeskChatbotUtil.TEXT_KEY] = text_with_removed_buttons
  //     // estrae i bottoni
  //     let buttons = []
  //     text_buttons.forEach(element => {
  //       const remove_extra_from_button = /^\*/mg; // removes initial "*"
  //       let button_text = element.replace(remove_extra_from_button, "").trim();
  //       let button = TiledeskChatbotUtil.parse_button_from_string(button_text);
  //       // var button = {}
  //       // button[TYPE_KEY] = "text"
  //       // button["value"] = button_text
  //       buttons.push(button)
  //     });
  //     if (reply.message[TiledeskChatbotUtil.ATTRIBUTES_KEY] == null) {
  //       reply.message[TiledeskChatbotUtil.ATTRIBUTES_KEY] = {}
  //     }
  //     reply.message[TiledeskChatbotUtil.ATTRIBUTES_KEY]["attachment"] = {
  //       type:"template",
  //       buttons: buttons
  //     }
  //     text = text_with_removed_buttons
  //   }
  //   else {
  //     // console.log("no text buttons")
  //   }
  //   return {
  //     text: text,
  //     reply: reply
  //   }
  // }

  // looks for tdButtons
  // button pattern is a line that starts with tdButton: TEXT_OF_BUTTON (every button on a line)
  static parse_tdButtons(text, reply) {
    const tdbutton_tag = TiledeskChatbotUtil.BUTTON_TAG;// 'tdButton:';
    const tdbutton_pattern = new RegExp('^' + tdbutton_tag + '.*', 'mg');
    const tdbuttons_match = text.match(tdbutton_pattern);
    // console.log("tdbutton matches:", tdbuttons_match)
    if (tdbuttons_match) {
      const text_with_removed_buttons = text.replace(tdbutton_pattern,"").trim()
      reply.message[TiledeskChatbotUtil.TEXT_KEY] = text_with_removed_buttons
      // extracts buttons
      let buttons = []
      tdbuttons_match.forEach(element => {
        const remove_extra_from_button = new RegExp('^' + tdbutton_tag, ''); // /^tdButton:/; // removes the initial 'tdButton:'
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
    return {
      text: text,
      reply: reply
    }
  }

  // looks for a webhook url
  // webhooks are defined as a line starting with \webhook:URL
  static parse_webhook_with_url(text, reply) {
    var webhook_pattern = /^\\webhook:.*/mg;
    var webhooks = text.match(webhook_pattern);
    if (webhooks && webhooks.length > 0) {
      const webhook_text = webhooks[0]
      text = text.replace(webhook_text,"").trim()
      const webhook_url = webhook_text.replace("\\webhook:", "")
      // reply.message[TiledeskChatbotUtil.WEBHOOK_KEY] = webhook_url;
      reply.message[TiledeskChatbotUtil.TEXT_KEY] = text;
      reply.webhook = webhook_url
    }
    return {
      text: text,
      reply: reply
    }
  }

  // looks for a webhook url
  // webhooks are defined as a line starting with \webhook:URL
  static parse_webhook_on_off(text, reply) {
    var webhook_pattern = /^\\webhook/mg;
    var webhooks = text.match(webhook_pattern);
    // console.log("webhooks pattern:", webhooks);
    // webhooks pattern: [ '\\webhook' ]
    if (webhooks && webhooks.length > 0) {
      const webhook_text = webhooks[0]
      text = text.replace(webhook_text,"").trim()
      reply.message[TiledeskChatbotUtil.TEXT_KEY] = text;
      reply.webhook = true;
    }
    return {
      text: text,
      reply: reply
    }
  }

}



module.exports = { TiledeskChatbotUtil };