var bot = require("../bot.js").bot;
var settings = require("../bot.js").settings;
var data = require("../bot.js").data;

module.exports.commands = [{cmd: "prefix", desc: "Change the guild prefix.", perm: ["manageGuild"]}, {cmd: "mentionrole", desc: "Mention a role, regardless mentionable or not.", perm: ["mentionEveryone"]}, {cmd: "mrole", desc: "Alias to `mentionrole`", perm: ["mentionEveryone"]}];
module.exports.events = [];
module.exports.actions = function (type, cmd, body, obj) {
  text = body.split(" ");
  if (type == "command" && cmd == "mentionrole" || type == "command" && cmd == "mrole") {
    if (obj.member.guild.roles.map((role) => role.name).includes(text[0]) != true) {
      obj.channel.createMessage("I couldn't find the role you were looking for. This is usually case-sensitive.");
    }
    else {
      obj.delete();
      o = obj.member.guild.roles.find(function(role){if (role.name == text[0]) {return role;}});
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
            obj.channel.createMessage(o.mention + ": " + body.substring(text[0].length + 1)).then(function () {
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
          obj.channel.createMessage(o.mention + ": " + body.substring(text[0].length + 1));
        }
      }
    }
  }
  else if (type == "command" && cmd == "prefix") {
    split = body.split(" ");
    if (body != "" && body != settings.get("prefix")) {
      data.set("guilds." + obj.member.guild.id + ".prefix", split[0]);
      obj.channel.createMessage("Changed the prefix for this guild to `" + body + "`.");
    }
    else {
      data.del("guilds." + obj.member.guild.id + ".prefix");
      obj.channel.createMessage("Reset the prefix for this guild to the default global prefix `" + settings.get("prefix") + "`.")
    }
  }
}
module.exports.managersOnly = false;
module.exports.name = "management";
