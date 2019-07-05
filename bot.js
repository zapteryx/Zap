const Eris = require('eris');
const Store = require('data-store');
const settings = new Store({ path: 'settings.json' });
const data = new Store({ path: 'data.json' });
var bot = new Eris(settings.get("token"));

function roundTo(n, digits) {
    var negative = false;
    if (digits === undefined) {digits = 0;}
    if (n < 0) {negative = true; n = n * -1;}
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if (negative) {n = (n * -1).toFixed(2);}
    if (digits == 0) {n = parseInt(n, 10);}
    return n;
}
function msToTime(ms) {
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  preseconds = ms/1000;
  while (preseconds > 59) {minutes = minutes+1; preseconds = preseconds-60;}
  if (preseconds < 60) {
    while (minutes > 59) {hours = hours+1; minutes = minutes-60;}
    if (minutes < 60) {
      while (hours > 23) {days = days+1; hours = hours-24;}
      if (hours < 24) {
        seconds = roundTo(preseconds, 0);
        if (days == 1) {daysString = "day";}
        else {daysString = "days";}
        if (hours == 1) {hoursString = "hr";}
        else {hoursString = "hrs";}
        if (minutes == 1) {minutesString = "min";}
        else {minutesString = "mins";}
        if (seconds == 1) {secondsString = "sec";}
        else {secondsString = "secs";}
        array = [];
        if (days > 0) {array.push(days + " " + daysString + ",");}
        if (hours > 0) {array.push(hours + " " + hoursString + ",");}
        if (minutes > 0) {array.push(minutes + " " + minutesString + ",");}
        if (seconds > 0) {array.push(seconds + " " + secondsString + ",");}
        final = array.join(" ");
        if (final == "") {return "<1 sec"}
        return final.slice(0, -1);
      }
    }
  }
}
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getBar(progress) {
  if (progress < 10) {return "◼◼◼◼◼◼◼◼◼◼";}
  else if (progress < 20) {return "◻◼◼◼◼◼◼◼◼◼";}
  else if (progress < 30) {return "◻◻◼◼◼◼◼◼◼◼";}
  else if (progress < 40) {return "◻◻◻◼◼◼◼◼◼◼";}
  else if (progress < 50) {return "◻◻◻◻◼◼◼◼◼◼";}
  else if (progress < 60) {return "◻◻◻◻◻◼◼◼◼◼";}
  else if (progress < 70) {return "◻◻◻◻◻◻◼◼◼◼";}
  else if (progress < 80) {return "◻◻◻◻◻◻◻◼◼◼";}
  else if (progress < 90) {return "◻◻◻◻◻◻◻◻◼◼";}
  else if (progress < 100) {return "◻◻◻◻◻◻◻◻◻◼";}
  else {return "◻◻◻◻◻◻◻◻◻◻";}
}
function noCache(module) {require("fs").watchFile(require("path").resolve(module), () => {delete require.cache[require.resolve(module)]})}
var test = require('modules/test.js')

bot.on("connect", (id) => {
  bot.createMessage("587916017976475648", "Shard #" + id + " has started a connection.");
})

bot.on("hello", (trace, id) => {
  bot.createMessage("587916017976475648", "Shard #" + id + " has received Hello from gateway.");
})

bot.on("ready", () => {
  bot.createMessage("587916017976475648", "All shards ready.");
})

bot.on("shardDisconnect", (error, id) => {
  bot.createMessage("587916017976475648", "Shard #" + id + " has disconnected.")
})

bot.on("shardPreReady", (id) => {
  bot.createMessage("587916017976475648", "Shard #" + id + " is now in pre-ready.")
})

bot.on("shardReady", (id) => {
  bot.createMessage("587916017976475648", "Shard #" + id + " is now ready.")
})

bot.on("shardResume", (id) => {
  bot.createMessage("587916017976475648", "Shard #" + id + " has resumed.")
})

bot.on("messageCreate", (msg) => {
  text = msg.content.split(" ");
  if (msg.author.id == "191739936871809024" && text[1] == "/eval") {
    evalQuery = msg.content.split(text[0]);
    finalQuery = evalQuery.join(" ");
    try {evaled = eval(finalQuery).toString(); bot.createMessage(msg.channel.id, "**Success!** Output:\n```js\n" + evaled + "```");}
    catch (err) {bot.createMessage(msg.channel.id, "**Error!** Output:\n```js\n" + err.toString() + "```");}
  }
})

bot.connect()
