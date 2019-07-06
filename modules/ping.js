roundTo = require("../bot.js").roundTo;
msToTime = require("../bot.js").msToTime;

module.exports.commands = ["ping", "pong"];
module.exports.help = [{cmd: "ping", desc: "Pong!"}, {cmd: "pong", desc: "Ping?"}]
module.exports.events = [];
module.exports.actions = function (cmd, body, msg) {
  if (cmd == "ping" || cmd == "pong") {
    if (msg.member) {
      msg.channel.createMessage("Pinging...")
      .then(function(res) {
        ram = process.memoryUsage().heapUsed / 1024 / 1024;
        roundedRam = roundTo(ram, 2);
        botPing = new Date() - msg.createdAt;
        roundedBotPing = roundTo(botPing, 2);
        msg.channel.editMessage(res.id, {
          content: "Pong!",
          embed: {
            color: 0x00FF00,
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "API Latency",
                value: msg.member.guild.shard.latency.toString() + "ms",
                inline: true
              },
              {
                name: "Message Round Trip",
                value: roundedBotPing.toString() + "ms",
                inline: true
              },
              {
                name: "RAM Usage",
                value: roundedRam.toString() + " MB"
              },
              {
                name: "Uptime",
                value: msToTime(process.uptime() * 1000)
              }
            ]
          }
        })
      })
    }
    else {
      msg.channel.createMessage("Pinging...")
      .then(function(res) {
        ram = process.memoryUsage().heapUsed / 1024 / 1024;
        roundedRam = roundTo(ram, 2);
        botPing = new Date() - msg.createdAt;
        roundedBotPing = roundTo(botPing, 2);
        msg.channel.editMessage(res.id, {
          content: "Pong!",
          embed: {
            color: 0x00FF00,
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "Message Round Trip",
                value: roundedBotPing.toString() + "ms",
                inline: true
              },
              {
                name: "RAM Usage",
                value: roundedRam.toString() + " MB"
              },
              {
                name: "Uptime",
                value: msToTime(process.uptime() * 1000)
              }
            ]
          }
        })
      })
    }
  }
}
module.exports.managersOnly = false;
module.exports.name = "ping";
