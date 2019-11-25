var bot = require("../bot.js").bot;
var settings = require("../bot.js").settings;
var data = require("../bot.js").data;
var profiles = require("../bot.js").profiles;
isNumeric = require("../bot.js").isNumeric;

module.exports.commands = [{cmd: "prefix", desc: "Change the guild prefix.", perm: ["manageGuild"]}, {cmd: "mentionrole", desc: "Mention a role, regardless mentionable or not.", perm: ["mentionEveryone"]}, {cmd: "mrole", desc: "Alias to `mentionrole`", perm: ["mentionEveryone"]}, {cmd: "autorole", desc: "Manage autorole.", perm: ["manageGuild", "manageRoles"]}, {cmd: "selfrole", desc: "Manage selfrole.", perm: ["manageGuild", "manageRoles"]}, {cmd: "getrole", desc: "Get a selfrole.", perm: ["guildOnly"]}, {cmd: "kick", desc: "Kick a user.", perm: ["kickMembers"]}, {cmd: "ban", desc: "Ban a user.", perm: ["banMembers"]}];
module.exports.events = ["guildMemberAdd"];
module.exports.actions = function (type, cmd, body, obj) {
  if (type == "command") {
    text = body.split(" ");
    if (cmd == "mentionrole" || cmd == "mrole") {
      if (!obj.member.guild.roles.map((role) => role.name).includes(text[0])) {
        obj.channel.createMessage("I couldn't find the role you were looking for. This is usually case-sensitive.");
      }
      else {
        obj.delete();
        o = obj.member.guild.roles.find(function(role){if (role.name == text[0]) {return role;}});
        if (!o.mentionable) {
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
    else if (cmd == "prefix") {
      if (body != "" && body != settings.get("prefix")) {
        data.set("guilds." + obj.member.guild.id + ".prefix", text[0]);
        obj.channel.createMessage("Changed the prefix for this guild to `" + text[0] + "`.");
      }
      else {
        data.del("guilds." + obj.member.guild.id + ".prefix");
        obj.channel.createMessage("Reset the prefix for this guild to the default global prefix `" + settings.get("prefix") + "`.")
      }
    }
    else if (cmd == "autorole") {
      if (text[0].toLowerCase() == "add") {
        text[1] = body.slice(text[0].length + 1);
        if (!text[1]) {obj.channel.createMessage("Please specify the role to add.\nValid role formats: `602110731156062208`, `Member`");}
        else {
          roleId = "";
          if (!data.get("guilds." + obj.member.guild.id + ".autorole")) {autorole = []; data.set("guilds." + obj.member.guild.id + ".autorole", autorole);}
          if (!obj.member.guild.roles.map((role) => role.name).includes(text[1]) && !obj.member.guild.roles.map((role) => role.id).includes(text[1])) {obj.channel.createMessage("I couldn't find the role you were looking for. Names are usually case-sensitive.");}
          else if (obj.member.guild.roles.map((role) => role.id).includes(text[1])) {roleId = text[1];}
          else {
            o = obj.member.guild.roles.find(function(role) {if (role.name == text[1]) {return role;}})
            roleId = o.id;
          }
          if (roleId != "") {
            autorole = data.get("guilds." + obj.member.guild.id + ".autorole");
            if (autorole.find(function(a) {return a == roleId;}) == roleId) {obj.channel.createMessage("That role is already in use for autorole!");}
            else {
              autorole.push(roleId);
              data.set("guilds." + obj.member.guild.id + ".autorole", autorole);
              // won't even bother returning the name of role because I allow use of IDs, just going to complicate it further
              obj.channel.createMessage("Added the role to autorole.");
            }
          }
        }
      }
      else if (text[0].toLowerCase() == "remove") {
        if (!data.get("guilds." + obj.member.guild.id + ".autorole")) {autorole = []; data.set("guilds." + obj.member.guild.id + ".autorole", autorole);}
        if (parseInt(text[1], 10) > data.get("guilds." + obj.member.guild.id + ".autorole").length || parseInt(text[1], 10) < 1 || isNaN(parseInt(text[1], 10))) {
          obj.channel.createMessage("Invalid index. Try using `autorole list` to find the role you want to remove.");
        }
        else {
          autorole = data.get("guilds." + obj.member.guild.id + ".autorole");
          index = parseInt(text[1], 10) - 1;
          try {roleName = obj.member.guild.roles.get(autorole[index]).name;}
          catch (e) {roleName = "~~Missing Role~~";}
          obj.channel.createMessage("Removing " + roleName + " `" + autorole[index] + "`.");
          autorole.splice(index, 1);
          data.set("guilds." + obj.member.guild.id + ".autorole", autorole);
        }
      }
      else if (text[0].toLowerCase() == "list") {
        arr = [];
        if (!data.get("guilds." + obj.member.guild.id + ".autorole")) {autorole = []; data.set("guilds." + obj.member.guild.id + ".autorole", autorole);}
        if (data.get("guilds." + obj.member.guild.id + ".autorole").length == 0) {
          obj.channel.createMessage("There were no roles found in use for autorole.");
        }
        else {
          data.get("guilds." + obj.member.guild.id + ".autorole").forEach((a, i) => {
            index = i+1;
            try {roleName = obj.member.guild.roles.get(a).name;}
            catch (e) {roleName = "~~Missing Role~~";}
            roleId = data.get("guilds." + obj.member.guild.id + ".autorole")[i];
            arr.push("`" + index + "` | " + roleName + " `" + roleId + "`");
          });
          obj.channel.createMessage("Adding the following roles to new users:\n" + arr.join("\n"));
        }
      }
      else {obj.channel.createMessage("Please specify what action you would like to do.\nValid actions: `add`, `remove`, `list`");}
    }
    else if (cmd == "selfrole") {
      if (text[0].toLowerCase() == "add") {
        text[1] = body.slice(text[0].length + 1);
        if (!text[1]) {obj.channel.createMessage("Please specify the role to add.\nValid role formats: `602110731156062208`, `Member`");}
        else {
          roleId = "";
          if (!data.get("guilds." + obj.member.guild.id + ".selfrole")) {selfrole = []; data.set("guilds." + obj.member.guild.id + ".selfrole", selfrole);}
          if (!obj.member.guild.roles.map((role) => role.name).includes(text[1]) && !obj.member.guild.roles.map((role) => role.id).includes(text[1])) {obj.channel.createMessage("I couldn't find the role you were looking for. Names are usually case-sensitive.");}
          else if (obj.member.guild.roles.map((role) => role.id).includes(text[1])) {roleId = text[1];}
          else {
            o = obj.member.guild.roles.find(function(role) {if (role.name == text[1]) {return role;}})
            roleId = o.id;
          }
          if (roleId != "") {
            selfrole = data.get("guilds." + obj.member.guild.id + ".selfrole");
            if (selfrole.find(function(a) {return a == roleId;}) == roleId) {obj.channel.createMessage("That role is already in use for selfrole!");}
            else {
              selfrole.push(roleId);
              data.set("guilds." + obj.member.guild.id + ".selfrole", selfrole);
              // won't even bother returning the name of role because I allow use of IDs, just going to complicate it further
              obj.channel.createMessage("Added the role to selfrole.");
            }
          }
        }
      }
      else if (text[0].toLowerCase() == "remove") {
        if (!data.get("guilds." + obj.member.guild.id + ".selfrole")) {selfrole = []; data.set("guilds." + obj.member.guild.id + ".selfrole", selfrole);}
        if (parseInt(text[1], 10) > data.get("guilds." + obj.member.guild.id + ".selfrole").length || parseInt(text[1], 10) < 1 || isNaN(parseInt(text[1], 10))) {
          obj.channel.createMessage("Invalid index. Try using `selfrole list` to find the role you want to remove.");
        }
        else {
          selfrole = data.get("guilds." + obj.member.guild.id + ".selfrole");
          index = parseInt(text[1], 10) - 1;
          try {roleName = obj.member.guild.roles.get(selfrole[index]).name;}
          catch (e) {roleName = "~~Missing Role~~";}
          obj.channel.createMessage("Removing " + roleName + " `" + selfrole[index] + "`.");
          selfrole.splice(index, 1);
          data.set("guilds." + obj.member.guild.id + ".selfrole", selfrole);
        }
      }
      else if (text[0].toLowerCase() == "list") {
        arr = [];
        if (!data.get("guilds." + obj.member.guild.id + ".selfrole")) {selfrole = []; data.set("guilds." + obj.member.guild.id + ".selfrole", selfrole);}
        if (data.get("guilds." + obj.member.guild.id + ".selfrole").length == 0) {
          obj.channel.createMessage("There were no roles found in use for selfrole.");
        }
        else {
          data.get("guilds." + obj.member.guild.id + ".selfrole").forEach((a, i) => {
            index = i+1;
            try {roleName = obj.member.guild.roles.get(a).name;}
            catch (e) {roleName = "~~Missing Role~~";}
            roleId = data.get("guilds." + obj.member.guild.id + ".selfrole")[i];
            arr.push("`" + index + "` | " + roleName + " `" + roleId + "`");
          });
          obj.channel.createMessage("Allowing users to `" + require("../bot.js").getPrefix(obj.channel) + "getrole` the following roles:\n" + arr.join("\n"));
        }
      }
      else {obj.channel.createMessage("Please specify what action you would like to do.\nValid actions: `add`, `remove`, `list`");}
    }
    else if (cmd == "getrole") {
      if (!body) {
        arr = [];
        if (!data.get("guilds." + obj.member.guild.id + ".selfrole")) {selfrole = []; data.set("guilds." + obj.member.guild.id + ".selfrole", selfrole);}
        if (data.get("guilds." + obj.member.guild.id + ".selfrole").length == 0) {
          obj.channel.createMessage("No roles available for selfrole.");
        }
        else {
          data.get("guilds." + obj.member.guild.id + ".selfrole").forEach((a, i) => {
            index = i+1;
            try {roleName = obj.member.guild.roles.get(a).name;}
            catch (e) {roleName = "~~Missing Role~~";}
            roleId = data.get("guilds." + obj.member.guild.id + ".selfrole")[i];
            arr.push("`" + index + "` | " + roleName + " `" + roleId + "`");
          });
          obj.channel.createMessage("Available roles:\n" + arr.join("\n"));
        }
      }
      else {
        roleId = "";
        if (!data.get("guilds." + obj.member.guild.id + ".selfrole")) {obj.channel.createMessage("No roles are available for selfrole.");}
        if (!obj.member.guild.roles.map((role) => role.name).includes(body) && !obj.member.guild.roles.map((role) => role.id).includes(body)) {obj.channel.createMessage("I couldn't find the role you were looking for. Names are usually case-sensitive.");}
        else if (obj.member.guild.roles.map((role) => role.id).includes(body)) {roleId = body;}
        else {
          o = obj.member.guild.roles.find(function(role) {if (role.name == body) {return role;}})
          roleId = o.id;
        }
        if (roleId != "") {
          selfrole = data.get("guilds." + obj.member.guild.id + ".selfrole");
          if (selfrole.find(function(a) {return a == roleId;}) == roleId) {
            if (obj.member.roles.includes(roleId)) {
              obj.member.removeRole(roleId, "[Selfrole] Removed role");
              obj.channel.createMessage("Removed the role!");
            }
            else {
              obj.member.addRole(roleId, "[Selfrole] Added role");
              obj.channel.createMessage("Added the role!");
            }
          }
          else {obj.channel.createMessage("That role is not available for selfrole!");}
        }
      }
    }
    else if (cmd == "kick") {
      if (body == "") {obj.channel.createMessage("Please specify the user to kick.")}
      else {
        id = "";
        if (obj.mentions.length >= 1 && text[0] == obj.mentions[0].mention) {id = obj.mentions[0].id}
        else if (isNumeric(text[0])) {id = text[0]}
        if (id == "") {obj.channel.createMessage("Usernames are currently not supported. Please specify an ID or mention the user to kick.");}
        else if (!obj.member.guild.members.get(bot.user.id).permission.has("kickMembers")) {obj.channel.createMessage("I'm lacking permissions to kick members.")}
        else {
          text = body.split(" ");
          if (!text[1]) {reason = "No reason provided."}
          else {reason = body.substring(text[0].length + 1);}
          obj.member.guild.kickMember(id, "[" + require("../bot.js").tag(obj.author) + "] " + reason).then(() => obj.channel.createMessage("✅ <@" + id + "> has been kicked!")).catch(function(err) {
            obj.channel.createMessage("❌ Encountered an error while attempting to kick the user:\n```" + err + "```")
          })
        }
      }
    }
    else if (cmd == "ban") {
      if (body == "") {obj.channel.createMessage("Please specify the user to ban.")}
      else {
        id = "";
        if (obj.mentions.length >= 1 && text[0] == obj.mentions[0].mention) {id = obj.mentions[0].id}
        else if (isNumeric(text[0])) {id = text[0]}
        if (id == "") {obj.channel.createMessage("Usernames are currently not supported. Please specify an ID or mention the user to ban.");}
        else if (!obj.member.guild.members.get(bot.user.id).permission.has("banMembers")) {obj.channel.createMessage("I'm lacking permissions to ban members.")}
        else {
          text = body.split(" ");
          if (!text[1]) {reason = "No reason provided."}
          else {reason = body.substring(text[0].length + 1);}
          obj.member.guild.banMember(id, 1, "[" + require("../bot.js").tag(obj.author) + "] " + reason).then(() => obj.channel.createMessage("✅ <@" + id + "> has been banned!")).catch(function(err) {
            obj.channel.createMessage("❌ Encountered an error while attempting to ban the user:\n```" + err + "```")
          })
        }
      }
    }
  }
  else if (type == "guildMemberAdd") {
    if (data.get("guilds." + obj[0].id + ".autorole")) {
      data.get("guilds." + obj[0].id + ".autorole").forEach((a, i) => {
        obj[1].addRole(a, "[Autorole] Added role").catch((err) => {
          console.log("[Error] Encountered an error while attempting autorole in guild " + obj[0].id + ":\n" + err);
        });
      });
    }
  }
  else if (type == "guildDelete") {profiles.del(obj.id); data.del("guilds." + obj.id); data.del("music." + obj.id); data.del("counting." + obj.id);}
}
module.exports.managersOnly = false;
module.exports.name = "management";
