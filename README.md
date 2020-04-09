# Zap

[![Travis](https://img.shields.io/travis/com/zapteryx/Zap.svg?style=for-the-badge)](https://travis-ci.com/zapteryx/Zap/)
[![Discord](https://img.shields.io/discord/334654301651730432.svg?color=7289DA&label=Discord&style=for-the-badge)](https://s.zptx.icu/zapdiscord)
[![GitHub](https://img.shields.io/github/license/zapteryx/Zap.svg?style=for-the-badge)](https://zap.zptx.icu)

A customizable modular all-in-one Discord bot.

## Getting Started
Zap is publicly available at https://s.zptx.icu/zap.

## Self-Hosting
Zap can be easily self-hosted for use by anyone.

All you have to do is:
1. [Download the ZIP](https://github.com/zapteryx/Zap/archive/master.zip)
2. Extract the ZIP file using any zip extraction tool to a folder of your choice.
3. Ensure you have NodeJS installed, which you can get [here](https://nodejs.org/en/). If you just installed it, give your computer a quick restart before proceeding.
4. Open a command prompt or terminal and navigate to the directory in which bot.js lives.
5. Run `npm install` in the command prompt or terminal.
6. Edit settings.example.json with a text editor or any editor of your choice and rename it to settings.json as soon as you're done.
7. Run `node bot.js` in the same command prompt or terminal.

See? Really easy! If you still need a video tutorial, [click here](https://www.youtube.com/watch?v=del4fuI_Hs0).

## Contributing
Zap is a modular bot written in JavaScript using the Eris library, which allows users to create their own modules easily for immediate use. Here's what you need to know.

```js
module.exports.commands = ["hello", "bye", "heee"];
module.exports.help = [{cmd: "hello", desc: "new phone who dis", perm: []}, {cmd: "bye", desc: "ok bye", perm: ["createInstantInvite"]}, {cmd: "heee", desc: "are you michael jackson?", perm: ["manageMessages", "attachFiles"]}];
module.exports.events = ["messageDelete"];
module.exports.actions = function (type, cmd, body, obj) {
  if (type == "command" && cmd == "hello") {obj.channel.createMessage("hello " + obj.author.mention)}
  else if (type == "command" && cmd == "bye") {obj.channel.createMessage("bye " + obj.author.mention)}
  else if (type == "command" && cmd == "heee") {obj.channel.createMessage("you're not michael jackson!")}
  else if (type == "messageDelete") {obj.channel.createMessage("someone just deleted a message in this channel, you think you're sneaky?")}
}
module.exports.managersOnly = false;
module.exports.name = "test";
```
commands - An array of strings (of your commands). If your module does not require commands and only uses events, replace it with `[]`. Do NOT use the same commands regardless in the same module or in separate modules.

help - An array of objects. The `cmd` must be in the same order as the commands above it. This is shown in the help menu. A list of permissions can be found [here](https://abal.moe/Eris/docs/reference).

events - An array of strings. Most events [here](https://abal.moe/Eris/docs/Client#event-channelCreate) should work perfectly fine. If unneeded, replace it with `[]`.

actions - A function. This is where most of the magic happens. `type` will either return the event name (only events you specified earlier will be possible) or simply return `command` if it was triggered by a command you specified earlier. Note that `type` can be `messageCreate` as well if you specify it in the events array earlier. `cmd` will return the command used (without the prefix). `body` will return the text after the command. Also note that `cmd` and `body` are only used when `type` is `command`. Otherwise, `cmd` and `body` are always `null`. `obj` is either a Object, or an Array of Objects. Depending on the event used, for the most part. For simple events like `messageDelete` or `channelDelete`, `obj` in these cases will be the `message` object and the `channel` object respectively. If using a more advanced event such as `messageReactionAdd`, you'll see that it has `message`, `emoji` and `userID`. All 3 of these will be put in order into an array. In this case, `obj[0]` would be the `message` object, `obj[1]` would be the `emoji` object and `obj[2]` would be the `userID` string.

managersOnly - A boolean. If true, only managers specified in settings.json can use the command.

name - A string. Very important. Do NOT use the same module name in two modules.

Put this into a file ending with .js, and put it in the modules folder. If the bot is already running, use `(prefix)load filenamewithoutjs` (without .js ending, so if the module was in ping.js, then name is ping). If the bot hasn't started, it will load the module on the next start up. If you'd like to make changes to the file, save the file and use `(prefix)reload modulename` (module name specified at the bottom of the module file).

## Important Note
For now, nothing too important, really. Just note that the project is licensed under [GPL-v3.0](https://github.com/zapteryx/Zap/blob/master/LICENSE), and also ensure you have base.js and help.js in your modules folder. The rest are optional.
