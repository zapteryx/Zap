var mArr = require("../bot.js").mArr;
var settings = require("../bot.js").settings;
var data = require("../bot.js").data;
var reload = require('require-reload')(require);
var bot = require("../bot.js").bot;

base = setInterval(changeStatus, 15000);
statusIndex = 0;
function changeStatus() {
  if (settings.get("status").length > 0) {
    if (statusIndex >= settings.get("status").length) {statusIndex = 0;}
    if (settings.get("status")[statusIndex].name.includes("{")) {
      string = settings.get("status")[statusIndex].name;
      split = string.split("{");
      total = 0;
      bot.guilds.map(g => g.memberCount).forEach(a => total = total + a);
      split.forEach((a, i) => {
        if (a.includes("usercount}")) {string = string.replace("{usercount}", total);}
        else if (a.includes("guildcount}")) {string = string.replace("{guildcount}", bot.guilds.size);}
      });
    }
    else {string = settings.get("status")[statusIndex].name;}
    if (!settings.get("presence")) {bot.editStatus("online", {name: string, type: settings.get("status")[statusIndex].type, url: "https://twitch.tv/twitch/"})}
    else {bot.editStatus(settings.get("presence"), {name: string, type: settings.get("status")[statusIndex].type, url: "https://twitch.tv/twitch/"})}
    statusIndex++;
  }
  else {
    if (settings.get("presence")) {bot.editStatus(settings.get("presence"), null);}
  }
}

module.exports.commands = [{cmd: "presence", desc: "Change the bot's presence (online, idle, dnd, invisible).", perm: []}, {cmd: "status", desc: "Add or remove messages to the bot's playing status.", perm: []}, {cmd: "eval", desc: "Evaluates code.", perm: []}, {cmd: "load", desc: "Load an unloaded module.", perm: []}, {cmd: "reload", desc: "Reload a loaded module.", perm: []}, {cmd: "gprefix", desc: "Change the global default prefix.", perm: []}];
module.exports.events = ["guildCreate", "guildDelete", "messageCreate"];
module.exports.actions = function (type, cmd, body, obj) {
  if (cmd == "eval") {
    try {
      evaled = eval(body);
      if (typeof evaled !== "string") {evaled = require("util").inspect(evaled);}
      if (evaled.length < 1979) {obj.channel.createMessage("**Success!** Output:\n```js\n" + evaled + "```");}
      else {console.log(evaled); obj.channel.createMessage("**Success!** Output was logged to console as it exceeds Discord's character limit.");}
    }
    catch (err) {obj.channel.createMessage("**Error!** Output:\n```js\n" + err + "```");}
  }
  else if (cmd == "load") {
    number = 0;
    loaded = false;
    while (number < mArr.length) {
      if (mArr[number].name == body) {
        obj.channel.createMessage("Module already loaded!");
        loaded = true;
        number = mArr.length;
      }
      else {number++;}
    }
    setTimeout(function () {
      if (loaded != true) {
        mArr.push(reload("./" + body + ".js"));
        console.log("[Modules] Module " + mArr[mArr.length - 1].name + " was loaded successfully.");
        obj.channel.createMessage("Module `" + mArr[mArr.length - 1].name + "` was loaded successfully.");
      }
    }, 5)
  }
  else if (cmd == "reload") {
    number = 0;
    exists = false;
    while (number < mArr.length) {
      if (mArr[number].name == body) {
        if (body == "base") {
          clearInterval(base);
        }
        mArr[number] = reload("./" + mArr[number].name + ".js");
        console.log("[Modules] Module " + mArr[number].name + " was reloaded successfully.");
        obj.channel.createMessage("Module `" + mArr[number].name + "` was reloaded successfully.");
        exists = true;
        number = mArr.length;
      }
      else {number++;}
    }
    setTimeout(function () {
      if (exists != true) {
        obj.channel.createMessage("Module does not exist!");
      }
    }, 5)
  }
  else if (cmd == "gprefix") {
    split = body.split(" ");
    settings.set("prefix", split[0]);
    obj.channel.createMessage("Changed the global default prefix to `" + split[0] + "`.");
  }
  else if (cmd == "presence") {
    if (body.toLowerCase() != "online" && body.toLowerCase() != "idle" && body.toLowerCase() != "dnd" && body.toLowerCase() != "invisible") {
      settings.set("presence", "online");
      bot.editStatus("online");
      obj.channel.createMessage("Reset the presence to `online`.");
    }
    else {
      settings.set("presence", body.toLowerCase());
      bot.editStatus(body.toLowerCase());
      obj.channel.createMessage("Set the presence to `" + body.toLowerCase() + "`.");
    }
  }
  else if (cmd == "status") {
    split = body.split(" ");
    if (split[0].toLowerCase() != "add" && split[0].toLowerCase() != "remove" && split[0].toLowerCase() != "list") {obj.channel.createMessage("Try specifying the action first.\nValid actions are `add type name`, `remove index`, `list`")}
    else if (split[0].toLowerCase() == "add") {
      if (split[1].toLowerCase() == "playing") {status = 0;}
      else if (split[1].toLowerCase() == "streaming") {status = 1;}
      else if (split[1].toLowerCase() == "listening") {status = 2;}
      else if (split[1].toLowerCase() == "watching") {status = 3;}
      else {
        obj.channel.createMessage("You have specified an invalid type.\nValid types: `playing`, `streaming`, `listening`, `watching`");
        status = -1;
      }
      if (status >= 0) {
        if (split[2]) {
          arr = settings.get("status");
          arr.push({type: status, name: body.substring(split[0].length + split[1].length + 2)});
          settings.set("status", arr);
          obj.channel.createMessage("Added `" + split[1].toLowerCase() + " " + body.substring(split[0].length + split[1].length + 2) + "` to the rotation.");
        }
        else {
          obj.channel.createMessage("You didn't provide a game name.");
        }
      }
    }
    else if (split[0].toLowerCase() == "remove") {
      if (parseInt(split[1], 10) > settings.get("status").length || parseInt(split[1], 10) < 1 || parseInt(split[1], 10) != parseInt(split[1], 10)) {
        obj.channel.createMessage("Invalid index. Try using `status list` to find the status you want to remove.");
      }
      else {
        statusArr = settings.get("status");
        index = parseInt(split[1], 10) - 1;
        if (statusArr[index].type == 0) {type = "Playing";}
        else if (statusArr[index].type == 1) {type = "Streaming";}
        else if (statusArr[index].type == 2) {type = "Listening to";}
        else if (statusArr[index].type == 3) {type = "Watching";}
        obj.channel.createMessage("Removing `" + type + " " + statusArr[index].name + "`.");
        statusArr.splice(index, 1);
        settings.set("status", statusArr);
      }
    }
    else if (split[0].toLowerCase() == "list") {
      number = 0;
      arr = [];
      if (settings.get("status").length == 0) {
        obj.channel.createMessage("There were no statuses found.")
      }
      else {
        settings.get("status").forEach((a, i) => {
          if (a.type == 0) {type = "Playing";}
          else if (a.type == 1) {type = "Streaming";}
          else if (a.type == 2) {type = "Listening to";}
          else if (a.type == 3) {type = "Watching";}
          index = i+1;
          arr.push("`" + index + "` | " + type + " " + a.name);
        });
        obj.channel.createMessage("Cycling through " + settings.get("status").length + " statuses:\n" + arr.join("\n"));
      }
    }
  }
  else if (type == "guildCreate") {
    console.log("[Guilds] Joined guild " + obj.name + " (" + obj.id + ") with " + obj.memberCount + " members.")
  }
  else if (type == "guildDelete") {
    console.log("[Guilds] Left guild " + obj.name + " (" + obj.id + ") with " + obj.memberCount + " members.")
  }
  else if (type == "messageCreate") {
    if (obj.mentions.length > 0 && obj.mentions[0].id == bot.user.id) {obj.channel.createMessage("My prefix here is `" + require("../bot.js").getPrefix(obj.channel) + "`.");}
  }
}
module.exports.managersOnly = true;
module.exports.name = "base";
