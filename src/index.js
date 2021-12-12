const { Client, MessageEmbed, Intents } = require("discord.js");
const client = new Client({ intents: 8 });

require("dotenv").config();

client.on("ready", () => {
  console.log(`${client.user.tag} is online!`);
  client.user.setActivity("with the code", { type: "PLAYING" });
});

client.login(process.env.DISCORD_BOT_TOKEN);
