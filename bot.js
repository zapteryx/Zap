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
function tag(user) {
  return user.username + "#" + user.discriminator;
}
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function getPrefix(channel) {
  if (channel.type == 0) {
    if (typeof data.get("guilds." + channel.guild.id + ".prefix") != "string") {return settings.get("prefix");}
    else {return data.get("guilds." + channel.guild.id + ".prefix");}
  }
  else if (channel.type == 1) {return settings.get("prefix");}
  else {return null;}
}
var mArr = [];
module.exports.mArr = mArr;
module.exports.settings = settings;
module.exports.data = data;
module.exports.roundTo = roundTo;
module.exports.msToTime = msToTime;
module.exports.getRndInteger = getRndInteger;
module.exports.tag = tag;
module.exports.isNumeric = isNumeric;
module.exports.getPrefix = getPrefix;
module.exports.bot = bot;
fs.readdir("modules", (err, files) => {
  number = 0;
  while (number < files.length) {
    mArr.push(reload("./modules/" + files[number]));
    console.log("[Modules] Module " + mArr[number].name + " was loaded successfully.");
    number++;
  }
  if (files.includes("base.js") == false) {
    console.log("[Modules] Module base was not found. This can limit your module management abilities, which is the opposite of what the bot was made for. You can download the base module from GitHub at https://s.zptx.icu/zap.")
  }
})

bot.on("connect", (id) => {console.log("[Shards] Shard #" + id + " has initiated a connection.")})

bot.on("hello", (trace, id) => {console.log("[Shards] Shard #" + id + " has received Hello from gateway.");})

bot.on("ready", () => {console.log("[Shards] All shards are ready."); bot.editStatus(settings.get("presence")); bot.options.defaultImageFormat = "png";})

bot.on("shardDisconnect", (error, id) => {console.log("[Shards] Shard #" + id + " has disconnected.")})

bot.on("shardPreReady", (id) => {console.log("[Shards] Shard #" + id + " is now in pre-ready."); bot.editStatus("idle", {name: "loading..."})})

bot.on("shardReady", (id) => {console.log("[Shards] Shard #" + id + " is now ready.")})

bot.on("shardResume", (id) => {console.log("[Shards] Shard #" + id + " has resumed.")})

// Received a new message
bot.on("messageCreate", (msg) => {
  text = msg.content.split(" ");
  // This function should basically replace the whole need for prefix checking
  prefix = getPrefix(msg.channel);
  // If message contains specified prefix and user is not a bot
  if (text[0].startsWith(prefix) && !msg.author.bot) {
    // Prepare command and body for passing to module
    cmd = text[0].substring(prefix.length);
    // If "body" is empty, just pass an empty string to module (if I leave this out, it'll pass a random value to the modules)
    if (!text[1]) {body = "";}
    else {body = msg.content.substring(text[0].length + 1);}
    // Loop to check which module to pass to
    exists = false;
    mArr.forEach(function(e){if (e.commands.some(a => a.cmd === cmd)) {exists = true; module = e;}})
    // If the module exists and the user did not just type a non-existent command
    if (exists) {
      // Log
      if (!msg.member) {console.log("[Modules] " + tag(msg.author) + " (" + msg.author.id + ") triggered the " + module.name + " module by command " + cmd + ".")}
      else {console.log("[Modules] " + tag(msg.author) + " (" + msg.author.id + ") triggered the " + module.name + " module by command " + cmd + " in guild " + msg.member.guild.name + " (" + msg.member.guild.id + ").")}
      // Respect DM only first
      if (module.commands.find(function (cmds) {return cmds.cmd == cmd;}).perm.includes("dmOnly")) {
        // No other permissions matter because DMs don't have permissions
        permsNeeded = ["dmOnly"];
      }
      // Has permissions but no DM only, which means that it's guild only
      else if (module.commands.find(function (cmds) {return cmds.cmd == cmd;}).perm.length > 0) {
        permsNeeded = module.commands.find(function (cmds) {return cmds.cmd == cmd;}).perm;
      }
      // Allow both DM and guild (no permissions)
      else {
        permsNeeded = [];
      }
      // Initialize perms missing array
      permsMissing = [];
      // Failed DM only requirement
      if (permsNeeded.includes("dmOnly") && msg.member) {permsMissing.push("`dmOnly`");}
      // Failed guild only requirement (either through manually specifying guildOnly or through specifying other permissions)
      else if (permsNeeded.length > 0 && !msg.member) {permsMissing.push("`guildOnly`");}
      // Not a DM and is a guild
      else if (permsNeeded.length > 0 && msg.member) {
        number = 0;
        // While loop to check if user has all required permissions
        while (number < permsNeeded.length) {
          if (permsNeeded[number] != "guildOnly" && !msg.member.permission.has(permsNeeded[number])) {permsMissing.push("`" + permsNeeded[number] + "`");}
          number++;
        }
      }
      // No permissions specified, no need to do anything as permsMissing is still an empty array and nothing was changed
      // Make the response seem less robotic by adding an s if it's more than 1 and what not
      if (permsMissing.length == 1) {str = "permission";}
      else {str = "permissions";}
      // If module is manager only and the user is not a manager
      if (module.managersOnly && !settings.get("managers").includes(msg.author.id)) {
        msg.channel.createMessage({
          embed: {
            title: "No permission",
            description: "This command is restricted to bot managers only.",
            color: 0xFF0000
          }
        })
      }
      // If a permission is missing
      else if (permsMissing.length > 0 && !settings.get("managers").includes(msg.author.id)) {
        msg.channel.createMessage({
          embed: {
            title: "No permission",
            description: "You are missing the " + permsMissing.join(", ") + " " + str + ".",
            color: 0xFF0000
          }
        })
      }
      // If everything was a-ok
      else {
        if (permsMissing.length > 0 && settings.get("managers").includes(msg.author.id)) {msg.channel.createMessage({
          embed: {
            title: "Bypassed permission check",
            description: "Missing " + str + ": " + permsMissing.join(", "),
            footer: {
              text: tag(msg.author) + " | Manager bypass",
              icon_url: msg.author.avatarURL
            },
            color: 0x00FF00
          }
        });}
        module.actions("command", cmd.toLowerCase(), body, msg);
      }
    }
  }
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("messageCreate") == true) {mArr[number].actions("messageCreate", null, null, msg);}
    number++;
  }
})

// New channel was created
bot.on("channelCreate", (channel) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("channelCreate") == true) {mArr[number].actions("channelCreate", cmd, body, channel);}
    number++;
  }
})

// Channel was deleted
bot.on("channelDelete", (channel) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("channelDelete") == true) {mArr[number].actions("channelDelete", cmd, body, channel);}
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
    if (mArr[number].events.includes("channelUpdate") == true) {mArr[number].actions("channelUpdate", cmd, body, objArray);}
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
    if (mArr[number].events.includes("guildBanAdd") == true) {mArr[number].actions("guildBanAdd", cmd, body, objArray);}
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
    if (mArr[number].events.includes("guildBanRemove") == true) {mArr[number].actions("guildBanRemove", cmd, body, objArray);}
    number++;
  }
})

// Bot joined a new guild
bot.on("guildCreate", (guild) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildCreate") == true) {mArr[number].actions("guildCreate", cmd, body, guild);}
    number++;
  }
})

// Bot left a guild
bot.on("guildDelete", (guild) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildDelete") == true) {mArr[number].actions("guildDelete", cmd, body, guild);}
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
    if (mArr[number].events.includes("guildEmojisUpdate") == true) {mArr[number].actions("guildEmojisUpdate", cmd, body, objArray);}
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
    if (mArr[number].events.includes("guildMemberAdd") == true) {mArr[number].actions("guildMemberAdd", cmd, body, objArray);}
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
    if (mArr[number].events.includes("guildMemberRemove") == true) {mArr[number].actions("guildMemberRemove", cmd, body, objArray);}
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
    if (mArr[number].events.includes("guildMemberUpdate") == true) {mArr[number].actions("guildMemberUpdate", cmd, body, objArray);}
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
    if (mArr[number].events.includes("guildRoleCreate") == true) {mArr[number].actions("guildRoleCreate", cmd, body, objArray);}
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
    if (mArr[number].events.includes("guildRoleDelete") == true) {mArr[number].actions("guildRoleDelete", cmd, body, objArray);}
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
    if (mArr[number].events.includes("guildRoleUpdate") == true) {mArr[number].actions("guildRoleUpdate", cmd, body, objArray);}
    number++;
  }
})

// Guild unavailable
bot.on("guildUnavailable", (guild) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("guildUnavailable") == true) {mArr[number].actions("guildUnavailable", cmd, body, guild);}
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
    if (mArr[number].events.includes("guildUpdate") == true) {mArr[number].actions("guildUpdate", cmd, body, objArray);}
    number++;
  }
})

// Message deleted
bot.on("messageDelete", (msg) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("messageDelete") == true) {mArr[number].actions("messageDelete", cmd, body, msg);}
    number++;
  }
})

// Messages deleted in bulk
bot.on("messageDeleteBulk", (msgs) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("messageDeleteBulk") == true) {mArr[number].actions("messageDeleteBulk", cmd, body, msgs);}
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
    if (mArr[number].events.includes("messageReactionAdd") == true) {mArr[number].actions("messageReactionAdd", cmd, body, objArray);}
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
    if (mArr[number].events.includes("messageReactionRemove") == true) {mArr[number].actions("messageReactionRemove", cmd, body, objArray);}
    number++;
  }
})

// All reactions removed from a message
bot.on("messageReactionRemoveAll", (msg) => {
  cmd = null;
  body = null;
  number = 0;
  while (number < mArr.length) {
    if (mArr[number].events.includes("messageReactionRemoveAll") == true) {mArr[number].actions("messageReactionRemoveAll", cmd, body, msg);}
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
    if (mArr[number].events.includes("messageUpdate") == true) {mArr[number].actions("messageUpdate", cmd, body, objArray);}
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
    if (mArr[number].events.includes("presenceUpdate") == true) {mArr[number].actions("presenceUpdate", cmd, body, objArray);}
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
    if (mArr[number].events.includes("userUpdate") == true) {mArr[number].actions("userUpdate", cmd, body, objArray);}
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
    if (mArr[number].events.includes("voiceChannelJoin") == true) {mArr[number].actions("voiceChannelJoin", cmd, body, objArray);}
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
    if (mArr[number].events.includes("voiceChannelLeave") == true) {mArr[number].actions("voiceChannelLeave", cmd, body, objArray);}
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
    if (mArr[number].events.includes("voiceChannelSwitch") == true) {mArr[number].actions("voiceChannelSwitch", cmd, body, objArray);}
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
    if (mArr[number].events.includes("voiceStateUpdate") == true) {mArr[number].actions("voiceStateUpdate", cmd, body, objArray);}
    number++;
  }
})

bot.connect()
