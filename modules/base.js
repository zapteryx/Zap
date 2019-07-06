var mArr = require("../bot.js").mArr;
var settings = require("../bot.js").settings;
var data = require("../bot.js").data;
var reload = require('require-reload')(require);

module.exports.commands = ["eval", "load", "reload"];
module.exports.help = [{cmd: "eval", desc: "Evaluates code."}, {cmd: "load", desc: "Load an unloaded module."}, {cmd: "reload", desc: "Reload a loaded module."}]
module.exports.events = [];
module.exports.actions = function (cmd, body, msg) {
  if (cmd == "eval") {
    try {evaled = eval(body).toString(); msg.channel.createMessage("**Success!** Output:\n```js\n" + evaled + "```");}
    catch (err) {msg.channel.createMessage("**Error!** Output:\n```js\n" + err.toString() + "```");}
  }
  else if (cmd == "load") {
    number = 0;
    loaded = false;
    while (number < mArr.length) {
      if (mArr[number].name == body) {
        msg.channel.createMessage("Module already loaded!");
        loaded = true;
        number = mArr.length;
      }
      else {number++;}
    }
    setTimeout(function () {
      if (loaded != true) {
        mArr.push(reload("./" + body + ".js"));
        console.log("[Modules] Module " + mArr[mArr.length - 1].name + " was loaded successfully.");
        msg.channel.createMessage("Module " + mArr[mArr.length - 1].name + " was loaded successfully.");
      }
    }, 20)
  }
  else if (cmd == "reload") {
    number = 0;
    exists = false;
    while (number < mArr.length) {
      if (mArr[number].name == body) {
        mArr[number] = reload("./" + mArr[number].name + ".js");
        console.log("[Modules] Module " + mArr[number].name + " was reloaded successfully.");
        msg.channel.createMessage("Module " + mArr[number].name + " was reloaded successfully.");
        exists = true;
        number = mArr.length;
      }
      else {number++;}
    }
    setTimeout(function () {
      if (exists != true) {
        msg.channel.createMessage("Module does not exist!");
      }
    }, 20)
  }
}
module.exports.managersOnly = true;
module.exports.name = "base";
