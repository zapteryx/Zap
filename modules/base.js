var mArr = require("../bot.js").mArr;
var settings = require("../bot.js").settings;
var data = require("../bot.js").data;
var reload = require('require-reload')(require);

base = setInterval(changeStatus, 15000);
statusIndex = 0;
function changeStatus() {
  if (settings.get("status").length > 0) {
    if (statusIndex >= settings.get("status").length) {statusIndex = 0;}
    bot.editStatus(null, {name: settings.get("status")[statusIndex].name, type: settings.get("status")[statusIndex].type, url: "https://twitch.tv/twitch/"})
    statusIndex++;
  }
  else {
    bot.editStatus(null, null);
  }
}
module.exports.commands = [{cmd: "presence", desc: "Change the bot's presence (online, idle, dnd, invisible).", perm: []}, {cmd: "status", desc: "Add or remove messages to the bot's playing status.", perm: []}, {cmd: "eval", desc: "Evaluates code.", perm: []}, {cmd: "load", desc: "Load an unloaded module.", perm: []}, {cmd: "reload", desc: "Reload a loaded module.", perm: []}, {cmd: "gprefix", desc: "Change the global default prefix.", perm: []}];
module.exports.events = [];
module.exports.actions = function (type, cmd, body, obj) {
  if (cmd == "eval") {
    try {evaled = eval(body).toString(); obj.channel.createMessage("**Success!** Output:\n```js\n" + evaled + "```");}
    catch (err) {obj.channel.createMessage("**Error!** Output:\n```js\n" + err.toString() + "```");}
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
    settings.set("prefix", body);
    obj.channel.createMessage("Changed the global default prefix to `" + body + "`.");
  }
}
module.exports.managersOnly = true;
module.exports.name = "base";
