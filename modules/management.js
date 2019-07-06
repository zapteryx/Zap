var bot = require("../bot.js").bot;

module.exports.commands = ["mentionrole", "mrole"];
module.exports.help = [{cmd: "mentionrole", desc: "Mention a role, regardless mentionable or not."}, {cmd: "mrole", desc: "Alias to `mentionrole`"}];
module.exports.events = [];
module.exports.actions = function (type, cmd, body, obj) {
  if (type == "command" && cmd == "mentionrole" || type == "command" && cmd == "mrole") {
    if (obj.member.guild.roles.map((role) => role.name).includes(text[1]) != true) {
      obj.channel.createMessage("I couldn't find the role you were looking for. This is usually case-sensitive.");
    }
    else {
      obj.delete();
      o = obj.member.guild.roles.find(function(role){if (role.name == text[1]) {return role;}});
      text = body.split(" ");
      if (o.mentionable == false) {
        bot.editRole(obj.member.guild.id, o.id, {mentionable: true})
        .then(function () {
          if (!text[1]) {
            obj.channel.createMessage(o.mention).then(function () {
              try {bot.editRole(obj.member.guild.id, o.id, {mentionable: false});}
              catch (e) {obj.channel.createMessage("I don't have the correct permissions to perform this action.")}
            })
          }
          else {
            obj.channel.createMessage(o.mention + ": " + body.substring(body.indexOf(text[1]))).then(function () {
              try {bot.editRole(obj.member.guild.id, o.id, {mentionable: false});}
              catch (e) {obj.channel.createMessage("I don't have the correct permissions to perform this action.")}
            })
          }
        })
        .catch((err) => {obj.channel.createMessage("I don't have the correct permissions to perform this action.")})
      }
      else {
        if (!text[1]) {
          obj.channel.createMessage(o.mention);
        }
        else {
          obj.channel.createMessage(o.mention + ": " + body.substring(body.indexOf(text[1])));
        }
      }
    }
  }
}
module.exports.managersOnly = true;
module.exports.name = "management";
