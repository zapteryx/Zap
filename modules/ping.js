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

module.exports.commands = ["ping", "pong"];
module.exports.events = [];
module.exports.actions = function (cmd, body, msg) {
  if (cmd == "ping" || cmd == "pong") {
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
}
module.exports.managersOnly = false;
module.exports.name = "ping";
