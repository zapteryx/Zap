const Eris = require('eris');
const Store = require('data-store');
const settings = new Store({ path: 'settings.json' });
const data = new Store({ path: 'data.json' });
var reload = require('require-reload')(require);
var fs = require('fs');
var bot = new Eris(settings.get("token"));

/*function roundTo(n, digits) {
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
}*/
var mArr = [];
module.exports.mArr = mArr;
fs.readdir("modules", (err, files) => {
  number = 0;
  while (number < files.length) {
    mArr.push(reload("./modules/" + files[number]));
    console.log("[Modules] Module " + mArr[number].name + " was loaded successfully.");
    number++;
  }
})

bot.on("connect", (id) => {console.log("[Shards] Shard #" + id + " has initiated a connection.")})

bot.on("hello", (trace, id) => {console.log("[Shards] Shard #" + id + " has received Hello from gateway.")})

bot.on("ready", () => {console.log("[Shards] All shards are ready.")})

bot.on("shardDisconnect", (error, id) => {console.log("[Shards] Shard #" + id + " has disconnected.")})

bot.on("shardPreReady", (id) => {console.log("[Shards] Shard #" + id + " is now in pre-ready.")})

bot.on("shardReady", (id) => {console.log("[Shards] Shard #" + id + " is now ready.")})

bot.on("shardResume", (id) => {console.log("[Shards] Shard #" + id + " has resumed.")})

bot.on("messageCreate", (msg) => {
  text = msg.content.split(" ");
  if (text[0].startsWith(settings.get("prefix")) == true) {
    cmd = text[0].substr(settings.get("prefix").length);
    body = msg.content.substr(msg.content.indexOf(text[1]));
    number = 0;
    while (number < mArr.length) {
      if (mArr[number].commands.includes(cmd) == true) {exists = true; module = mArr[number]; number = mArr.length;}
      else {number++;}
    }
    setTimeout(function() {
      if (exists == true && module.managersOnly != true) {
        console.log("[Modules] " + msg.author.tag + " (" + msg.author.id + ") triggered the " + module.name + " module by command " + cmd + ".")
        module.actions(cmd, body, msg);
      }
      else if (exists == true && module.managersOnly == true) {
        if (settings.get("managers").includes(msg.author.id) == true) {
          module.actions(cmd, body, msg);
        }
        else {
          msg.channel.createMessage({
            embed: {
              title: "No permission",
              description: "This command is restricted to bot managers only.",
              color: 0xFF0000
            }
          })
        }
      }
    }, 20)
  }
})

bot.connect()
