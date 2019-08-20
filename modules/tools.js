const translate = require("@vitalets/google-translate-api");
var settings = require("../bot.js").settings;

module.exports.commands = [{cmd: "translate", desc: "Translate text.", perm: []}, {cmd: "trans", desc: "Alias to `translate`", perm: []}];
module.exports.events = [];
module.exports.actions = function (type, cmd, body, obj) {
  if (cmd == "translate" || cmd == "trans") {
    split = body.split(" ");
    if (!split[0]) {
      obj.channel.createMessage("Please specify the language to translate to.")
    }
    else if (!split[1]) {
      obj.channel.createMessage("Please specify the content to translate.")
    }
    else {
      if (split[0].includes(">")) {
        a = split[0].split(">");
        from = a[0];
        to = a[1];
      }
      else {from = "auto"; to = split[0];}
      content = body.substring(split[0].length + 1);
      translate(content, {from: from, to: to})
      .then(function(res) {
        if (res.from.text.autoCorrected) {
          obj.channel.createMessage({
            embed: {
              title: "Translation",
              timestamp: new Date().toISOString(),
              fields: [
                {
                  name: "Original [" + res.from.language.iso + "] [auto-corrected]",
                  value: res.from.text.value
                },
                {
                  name: "Translated",
                  value: res.text
                }
              ]
            }
          })
        }
        else if (res.from.text.didYouMean) {
          obj.channel.createMessage({
            embed: {
              title: "Translation",
              timestamp: new Date().toISOString(),
              fields: [
                {
                  name: "Original [" + res.from.language.iso + "]",
                  value: content
                },
                {
                  name: "Did you mean...",
                  value: res.from.text.value
                },
                {
                  name: "Translated",
                  value: res.text
                }
              ]
            }
          })
        }
        else {
          obj.channel.createMessage({
            embed: {
              title: "Translation",
              timestamp: new Date().toISOString(),
              fields: [
                {
                  name: "Original [" + res.from.language.iso + "]",
                  value: content
                },
                {
                  name: "Translated",
                  value: res.text
                }
              ]
            }
          })
        }
      })
      .catch(function(res) {
        obj.channel.createMessage("Encountered an error whilst translating:\n```" + res + "```")
      })
    }
  }
}
module.exports.managersOnly = false;
module.exports.name = "tools";
