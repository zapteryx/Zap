var mArr = require("../bot.js").mArr;

module.exports.commands = ["help"];
module.exports.help = [{cmd: "help", desc: "Do you expect anything?"}]
module.exports.events = [];
module.exports.actions = function (cmd, body, msg) {
  if (cmd == "help") {
    help = [];
    number = 0;
    error = false;
    while (number < mArr.length) {
      help.push("[" + mArr[number].name + "]");
      otherNumber = 0;
      while (otherNumber < mArr[number].commands.length) {
        if (mArr[number].commands[otherNumber] == mArr[number].help[otherNumber].cmd) {
          help.push(mArr[number].commands[otherNumber] + ": " + mArr[number].help[otherNumber].desc);
          otherNumber++;
        }
        else {
          msg.channel.createMessage("Critical error displaying help: Module `" + mArr[number].name + "` has a missing command description.");
          error = true;
          number = mArr.length;
          return;
        }
      }
      number++;
    }
    setTimeout(function() {
      if (error != true) {
        msg.channel.createMessage("```\n" + help.join("\n") + "\n```")
      }
    }, 20)
  }
}
module.exports.managersOnly = false;
module.exports.name = "help";
