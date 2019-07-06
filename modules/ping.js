roundTo = require("../bot.js").roundTo;
msToTime = require("../bot.js").msToTime;

module.exports.commands = ["ping", "pong"];
module.exports.help = [{cmd: "ping", desc: "Pong!"}, {cmd: "pong", desc: "Ping?"}]
module.exports.events = [];
module.exports.actions = function (event, cmd, body, obj) {
  if (cmd == "ping" || cmd == "pong") {
    if (obj.member) {
      obj.channel.createMessage("Pinging...")
      .then(function(res) {
        ram = process.memoryUsage().heapUsed / 1024 / 1024;
        roundedRam = roundTo(ram, 2);
        botPing = new Date() - obj.createdAt;
        roundedBotPing = roundTo(botPing, 2);
        obj.channel.editMessage(res.id, {
          content: "Pong!",
          embed: {
            color: 0x00FF00,
            timestamp: new Date().toISOString(),
            fields: [
              {
                name: "API Latency",
                value: obj.member.guild.shard.latency.toString() + "ms",
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
      obj.channel.createMessage("Pinging...")
      .then(function(res) {
        ram = process.memoryUsage().heapUsed / 1024 / 1024;
        roundedRam = roundTo(ram, 2);
        botPing = new Date() - obj.createdAt;
        roundedBotPing = roundTo(botPing, 2);
        obj.channel.editMessage(res.id, {
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
