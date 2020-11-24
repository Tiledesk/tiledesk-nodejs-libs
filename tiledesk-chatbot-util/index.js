/* 
    ver 0.8.5
    Andrea Sponziello - (c) Tiledesk.com
*/

class TiledeskChatbotUtil {    

  fullname_email_in(command) {
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

  dep_in(command) {
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
   ex.

  Hi!
  \split:1000
  Please tell me your email

  Sends two messages delayed by 1 second
  */
  findSplits(text) {
      var commands = []
      const split_pattern = /^(\\split[:0-9]*)/mg //ex. \split:500
      var parts = text.split(split_pattern)
      for (var i=0; i < parts.length; i++) {
          let p = parts[i]
          console.log("part: " + p)
          if (i % 2 != 0) {
          // split command
          console.log("split command: " + p)
          var split_parts = p.split(":")
          var wait_time = 1000
          if (split_parts.length == 2) {
              wait_time = split_parts[1]
          }
          console.log("wait time: " + wait_time)
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
  // values
  static TYPE_IMAGE = 'image';
  static TYPE_FRAME = 'frame';
  static TYPE_TEXT = 'text';
  static TYPE_URL = 'url';
  static TARGET_BLANK = 'blank';
  static TARGET_PARENT = 'parent';

  static parseReply(text) {
      var reply = {
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
      var image_pattern = /^\\image:.*/mg;
      var images = text.match(image_pattern);
      // console.log("images: ", images)
      if (images && images.length > 0) {
        const image_text = images[0]
        var text = text.replace(image_text,"").trim()
        var image_url = image_text.replace("\\image:", "")

        var width = 200
        var height = 200
        // parse image size (optional) ex: \image:100-100:http://image.com/image.gif
        let image_size_pattern = /^([0-9]*-[0-9]*):(.*)/;
        let image_size_text = image_url.match(image_size_pattern)
        if (image_size_text && image_size_text.length == 3) {
          image_url = image_size_text[2]
          let image_size = image_size_text[1]
          console.log("size: " + image_size)
          console.log("imageì url: " + image_url)
          let split_pattern = /-/
          let size_splits = image_size.split(split_pattern)
          if (size_splits.length == 2) {
            width = size_splits[0]
            height = size_splits[1]
          }
        }
        reply.message[TiledeskChatbotUtil.TEXT_KEY] = text
        reply.message[TiledeskChatbotUtil.TYPE_KEY] = TYPE_IMAGE
        reply.message[TiledeskChatbotUtil.METADATA_KEY] = {
          src: image_url,
          width: width,
          height: height
        }
      }

      // looks for iframes
      // iframes are defined as a line starting with:
      // \frame:FRAME_URL
      // with optional size:
      // \frame:WIDTH-HEIGHT:FRAME_URL
      // ex.:
      // \frame:100-100:http://iframe.com/index.html
      var frame_pattern = /^\\frame:.*/mg;
      var frames = text.match(frame_pattern);
      if (frames && frames.length > 0) {
        const frame_text = frames[0]
        var text = text.replace(frame_text,"").trim()
        var frame_url = frame_text.replace("\\frame:", "")
        var width = 200
        var height = 200
        // parse frame size (optional) ex: \frame:100-100:http://frame.com/index.html
        let frame_size_pattern = /^([0-9]*-[0-9]*):(.*)/;
        let frame_size_text = frame_url.match(frame_size_pattern)
        if (frame_size_text && frame_size_text.length == 3) {
          frame_url = frame_size_text[2]
          let frame_size = frame_size_text[1]
          console.log("size: " + frame_size)
          console.log("frame url: " + frame_url)
          let split_pattern = /-/
          let size_splits = frame_size.split(split_pattern)
          if (size_splits.length == 2) {
            width = size_splits[0]
            height = size_splits[1]
          }
        }
        reply.message[TiledeskChatbotUtil.TEXT_KEY] = text
        reply.message[TiledeskChatbotUtil.TYPE_KEY] = TYPE_FRAME
        reply.message[TiledeskChatbotUtil.METADATA_KEY] = {
          src: frame_url,
          width: width,
          height: height
        }
      }
    
      // looks for bullet buttons
      // button pattern is a line that starts with *TEXT_OF_BUTTON (every button on a line)
      const button_pattern = /^\*.*/mg;
      const text_buttons = text.match(button_pattern);
      if (text_buttons) {
        console.log("text buttons")
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
          console.log("Added button: " + button_text)
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
        console.log("no text buttons")
      }

      // looks for a webhook url
      // webhooks are defined as a line starting with \webhook:URL
      var webhook_pattern = /^\\webhook:.*/mg;
      var webhooks = text.match(webhook_pattern);
      if (webhooks && webhooks.length > 0) {
        const webhook_text = webhooks[0]
        console.log("webhook_text: " + webhook_text)
        text = text.replace(webhook_text,"").trim()
        const webhook_url = webhook_text.replace("\\webhook:", "")
        console.log("webhook_url " + webhook_url)
        reply.webhook = webhook_url
      }

      return reply
  }

  static parse_button_from_string(button_string) {
    const tdlink_pattern = /(tdLink:)(\S+)/m;
    const tdlink_blank_pattern = /(tdLinkBlank:)(\S+)/m;
    const tdlink_parent_pattern = /(tdLinkParent:)(\S+)/m;
    const text_button_link = button_string.match(tdlink_pattern);
    const text_button_link_blank = button_string.match(tdlink_blank_pattern);
    const text_button_link_parent = button_string.match(tdlink_parent_pattern);
    console.log('text_button_link', text_button_link)
    console.log('text_button_link_blank', text_button_link_blank)
    console.log('text_button_link_parent', text_button_link_parent)
    if (text_button_link && text_button_link.length && text_button_link.length === 3) {
      const button =  TiledeskChatbotUtil.button_link_by_match(button_string, text_button_link, TiledeskChatbotUtil.TARGET_BLANK);
      return button;
    }
    if (text_button_link_blank && text_button_link_blank.length && text_button_link_blank.length === 3) {
      const button =  TiledeskChatbotUtil.button_link_by_match(button_string, text_button_link_blank, TiledeskChatbotUtil.TARGET_BLANK);
      return button;
    }
    if (text_button_link_parent && text_button_link_parent.length && text_button_link_parent.length === 3) {
      const button =  TiledeskChatbotUtil.button_link_by_match(button_string, text_button_link_parent, TiledeskChatbotUtil.TARGET_PARENT);
      return button;
    }
    else {
      // No subpatterns = text button
      let button = {};
      console.log("button_text label", button_string)
      button[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_TEXT;
      button[TiledeskChatbotUtil.VALUE_KEY] = button_string;
      console.log("button text:", JSON.stringify(button));
      return button;
    }
    
    

    // if (button_type === "text") {
    //   console.log("button_string", button_string)
    //   button[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_TEXT;
    //   button[TiledeskChatbotUtil.VALUE_KEY] = button_string;
    // }
    // else if (button_type === "url_blank") {
    
    // }
    
    
    return button
  }

  static button_link_by_match(button_string, match, target) {
    let button = {};
    const command = match[0];
    const link = match[2];
    const button_label = button_string.replace(command,'').trim();
    console.log("button_url_label", button_label)
    button[TiledeskChatbotUtil.TYPE_KEY] = TiledeskChatbotUtil.TYPE_URL;
    button[TiledeskChatbotUtil.VALUE_KEY] = button_label;
    button[TiledeskChatbotUtil.LINK_KEY] = link;
    button[TiledeskChatbotUtil.TARGET_KEY] = target;
    console.log("button link blank:", JSON.stringify(button));
    return button;
  }
}

// var tiledeskChatbotUtil = new TiledeskChatbotUtil();

module.exports = { TiledeskChatbotUtil };