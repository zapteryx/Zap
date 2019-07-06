const Eris = require('eris');
const Store = require('data-store');
const settings = new Store({ path: 'settings.json' });
const data = new Store({ path: 'data.json' });
var reload = require('require-reload')(require);
var fs = require('fs');
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
var mArr = [];
module.exports.mArr = mArr;
module.exports.settings = settings;
module.exports.data = data;
module.exports.roundTo = roundTo;
module.exports.msToTime = msToTime;
module.exports.getRndInteger = getRndInteger;
module.exports.bot = bot;
fs.readdir("modules", (err, files) => {
  number = 0;
  while (number < files.length) {
    mArr.push(reload("./modules/" + files[number]));
    console.log("[Modules] Module " + mArr[number].name + " was loaded successfully.");
    number++;
  }
  if (files.includes("base.js") == false) {
    console.log("[Modules] Module base was not found. This can limit your module management abilities, which is the opposite of what the bot was made for. You can download the base module from GitHub at https://github.com/zapteryx/Zap/.")
  }
})

bot.on("connect", (id) => {console.log("[Shards] Shard #" + id + " has initiated a connection.")})

bot.on("hello", (trace, id) => {console.log("[Shards] Shard #" + id + " has received Hello from gateway.")})

bot.on("ready", () => {console.log("[Shards] All shards are ready.")})

bot.on("shardDisconnect", (error, id) => {console.log("[Shards] Shard #" + id + " has disconnected.")})

bot.on("shardPreReady", (id) => {console.log("[Shards] Shard #" + id + " is now in pre-ready.")})

bot.on("shardReady", (id) => {console.log("[Shards] Shard #" + id + " is now ready.")})

bot.on("shardResume", (id) => {console.log("[Shards] Shard #" + id + " has resumed.")})

// Received a new message
bot.on("messageCreate", (msg) => {
  text = msg.content.split(" ");
  if (text[0].startsWith(settings.get("prefix")) == true) {
    cmd = text[0].substr(settings.get("prefix").length);
    body = msg.content.substr(msg.content.indexOf(text[1]));
    number = 0;
    exists = false;
    while (number < mArr.length) {
      if (mArr[number].commands.includes(cmd) == true) {exists = true; module = mArr[number]; number = mArr.length;}
      else {number++;}
    }
    setTimeout(function() {
      if (exists == true && module.managersOnly != true) {
        console.log("[Modules] " + msg.author.username + "#" + msg.author.discriminator + " (" + msg.author.id + ") triggered the " + module.name + " module by command " + cmd + ".")
        module.actions("messageCreate", cmd, body, msg);
      }
      else if (exists == true && module.managersOnly == true) {
        console.log("[Modules] " + msg.author.username + "#" + msg.author.discriminator + " (" + msg.author.id + ") triggered the " + module.name + " module by command " + cmd + ".")
        if (settings.get("managers").includes(msg.author.id) == true) {
          module.actions("messageCreate", cmd, body, msg);
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

// New channel was created
bot.on("channelCreate", (channel) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("channelCreate") == true) {module.actions("channelCreate", cmd, body, channel);}
    number++;
  }
})

// Channel was deleted
bot.on("channelDelete", (channel) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("channelDelete") == true) {module.actions("channelDelete", cmd, body, channel);}
    number++;
  }
})

// Channel was updated
bot.on("channelUpdate", (channel, oldChannel) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(channel);
  objArray.push(oldChannel);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("channelUpdate") == true) {module.actions("channelUpdate", cmd, body, objArray);}
    number++;
  }
})

// User was banned from a guild
bot.on("guildBanAdd", (guild, user) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(guild);
  objArray.push(user);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildBanAdd") == true) {module.actions("guildBanAdd", cmd, body, objArray);}
    number++;
  }
})

// User ban was lifted
bot.on("guildBanRemove", (guild, user) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(guild);
  objArray.push(user);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildBanRemove") == true) {module.actions("guildBanRemove", cmd, body, objArray);}
    number++;
  }
})

// Bot joined a new guild
bot.on("guildCreate", (guild) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildCreate") == true) {module.actions("guildCreate", cmd, body, guild);}
    number++;
  }
})

// Bot left a guild
bot.on("guildDelete", (guild) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildDelete") == true) {module.actions("guildDelete", cmd, body, guild);}
    number++;
  }
})

// Guild emojis changed
bot.on("guildEmojisUpdate", (guild, emojis, oldEmojis) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(guild);
  objArray.push(emojis);
  objArray.push(oldEmojis);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildEmojisUpdate") == true) {module.actions("guildEmojisUpdate", cmd, body, objArray);}
    number++;
  }
})

// User joined a guild
bot.on("guildMemberAdd", (guild, member) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(guild);
  objArray.push(member);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildMemberAdd") == true) {module.actions("guildMemberAdd", cmd, body, objArray);}
    number++;
  }
})

// User left a guild / kicked / banned
bot.on("guildMemberRemove", (guild, member) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(guild);
  objArray.push(member);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildMemberRemove") == true) {module.actions("guildMemberRemove", cmd, body, objArray);}
    number++;
  }
})

// User roles or nickname updated
bot.on("guildMemberUpdate", (guild, member, oldMember) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(guild);
  objArray.push(member);
  objArray.push(oldMember);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildMemberUpdate") == true) {module.actions("guildMemberUpdate", cmd, body, objArray);}
    number++;
  }
})

// New role created
bot.on("guildRoleCreate", (guild, role) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(guild);
  objArray.push(role);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildRoleCreate") == true) {module.actions("guildRoleCreate", cmd, body, objArray);}
    number++;
  }
})

// Role deleted
bot.on("guildRoleDelete", (guild, role) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(guild);
  objArray.push(role);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildRoleDelete") == true) {module.actions("guildRoleDelete", cmd, body, objArray);}
    number++;
  }
})

// Role updated
bot.on("guildRoleUpdate", (guild, role, oldRole) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(guild);
  objArray.push(role);
  objArray.push(oldRole);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildRoleUpdate") == true) {module.actions("guildRoleUpdate", cmd, body, objArray);}
    number++;
  }
})

// Guild unavailable
bot.on("guildUnavailable", (guild) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildUnavailable") == true) {module.actions("guildUnavailable", cmd, body, guild);}
    number++;
  }
})

// Guild updated
bot.on("guildUpdate", (guild, oldGuild) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(guild);
  objArray.push(oldGuild);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildUpdate") == true) {module.actions("guildUpdate", cmd, body, objArray);}
    number++;
  }
})

// Message deleted
bot.on("messageDelete", (msg) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("messageDelete") == true) {module.actions("messageDelete", cmd, body, msg);}
    number++;
  }
})

// Messages deleted in bulk
bot.on("messageDeleteBulk", (msgs) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("messageDeleteBulk") == true) {module.actions("messageDeleteBulk", cmd, body, msgs);}
    number++;
  }
})

// Message reaction added
bot.on("messageReactionAdd", (msg, emoji, userID) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(msg);
  objArray.push(emoji);
  objArray.push(userID);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("messageReactionAdd") == true) {module.actions("messageReactionAdd", cmd, body, objArray);}
    number++;
  }
})

// Message reaction removed
bot.on("messageReactionRemove", (msg, emoji, userID) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(msg);
  objArray.push(emoji);
  objArray.push(userID);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("messageReactionRemove") == true) {module.actions("messageReactionRemove", cmd, body, objArray);}
    number++;
  }
})

// All reactions removed from a message
bot.on("messageReactionRemoveAll", (msg) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("messageReactionRemoveAll") == true) {module.actions("messageReactionRemoveAll", cmd, body, msg);}
    number++;
  }
})

// Message updated
bot.on("messageUpdate", (msg, oldMsg) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(msg);
  objArray.push(oldMsg);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("messageUpdate") == true) {module.actions("messageUpdate", cmd, body, objArray);}
    number++;
  }
})

// User status updated
bot.on("presenceUpdate", (member, oldPresence) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(member);
  objArray.push(oldPresence);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("presenceUpdate") == true) {module.actions("presenceUpdate", cmd, body, objArray);}
    number++;
  }
})

// User updated
bot.on("userUpdate", (user, oldUser) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(user);
  objArray.push(oldUser);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("userUpdate") == true) {module.actions("userUpdate", cmd, body, objArray);}
    number++;
  }
})

// User joined voice channel
bot.on("voiceChannelJoin", (member, newChannel) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(member);
  objArray.push(newChannel);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("voiceChannelJoin") == true) {module.actions("voiceChannelJoin", cmd, body, objArray);}
    number++;
  }
})

// User left voice channel
bot.on("voiceChannelLeave", (member, oldChannel) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(member);
  objArray.push(oldChannel);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("voiceChannelLeave") == true) {module.actions("voiceChannelLeave", cmd, body, objArray);}
    number++;
  }
})

// User switched voice channel
bot.on("voiceChannelSwitch", (member, newChannel, oldChannel) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(member);
  objArray.push(newChannel);
  objArray.push(oldChannel);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("voiceChannelSwitch") == true) {module.actions("voiceChannelSwitch", cmd, body, objArray);}
    number++;
  }
})

// User voice state changed (muted, deafened, self-muted, self-deafened)
bot.on("voiceStateUpdate", (member, oldState) => {
  cmd = null;
  body = null;
  objArray = [];
  objArray.push(member);
  objArray.push(oldState);
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("voiceStateUpdate") == true) {module.actions("voiceStateUpdate", cmd, body, objArray);}
    number++;
  }
})

bot.connect()
