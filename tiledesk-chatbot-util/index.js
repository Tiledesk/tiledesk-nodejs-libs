/* 
    ver 0.8.1
    Andrea Sponziello - (c) Tiledesk.com
*/

class TiledeskUtil {    

    /* Splits a message in multiple commands using the microlanguage
    \split:TIME
    command \split:TIME must stand on a line of his own as in the following example
     ex.

    <<Hi!
    \split:1000
    Please tell me your email>>

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

    parseReply(text) {
        let TEXT_KEY = 'text'
        let TYPE_KEY = 'type'
        let ATTRIBUTES_KEY = 'attributes'
        let METADATA_KEY = "metadata"
        let TYPE_IMAGE = 'image'
        let TYPE_TEXT = 'text'
        

        var reply = {
            "message": {}
        }
        reply.message[TEXT_KEY] = text
        reply.message[TYPE_KEY] = TYPE_TEXT
      
        // looks for images
        var image_pattern = /^\\image:.*/mg; // images are defined as a line starting with \image:IMAGE_URL
        // console.log("Searching images with image_pattern: ", image_pattern)
        var images = text.match(image_pattern);
        // console.log("images: ", images)
        if (images && images.length > 0) {
          const image_text = images[0]
          var text = text.replace(image_text,"").trim()
          const image_url = image_text.replace("\\image:", "")
          reply.message[TEXT_KEY] = text
          reply.message[TYPE_KEY] = TYPE_IMAGE
          reply.message[METADATA_KEY] = {
            src: image_url,
            width: 200,
            height: 200
          }
        }
      
        // looks for bullet buttons
        var button_pattern = /^\*.*/mg; // button pattern is a line that starts with *TEXT_OF_BUTTON (every button on a line)
        var text_buttons = text.match(button_pattern);
        if (text_buttons) {
          // ricava il testo rimuovendo i bottoni
          var text_with_removed_buttons = text.replace(button_pattern,"").trim()
          reply.message[TEXT_KEY] = text_with_removed_buttons
          // estrae i bottoni
          var buttons = []
          text_buttons.forEach(element => {
            var remove_extra_from_button = /^\*/mg; // removes initial "*"
            var button_text = element.replace(remove_extra_from_button, "").trim()
            var button = {}
            button[TYPE_KEY] = "text"
            button["value"] = button_text
            buttons.push(button)
            console.log("Added button: " + button_text)
          });
          if (reply.message[ATTRIBUTES_KEY] == null) {
            reply.message[ATTRIBUTES_KEY] = {}
          }
          reply.message[ATTRIBUTES_KEY]["attachment"] = {
            type:"template",
            buttons: buttons
          }
          text = text_with_removed_buttons
        }

        // looks for a webhook url
        var webhook_pattern = /^\\webhook:.*/mg; // webhooks are defined as a line starting with \webhook:URL
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

}

 var tiledeskUtil = new TiledeskUtil();

 module.exports = tiledeskUtil;