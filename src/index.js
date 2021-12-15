const {
  Client,
  MessageEmbed,
  Intents,
  Emoji,
  ReactionEmoji,
} = require("discord.js");
const { Pool } = require("pg/lib");
const { getAllPolls, Poll, embedAllPolls } = require("./poll/polls");
const botName = "Sparky";
const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

require("dotenv").config();

client.on("ready", () => {
  console.log(`${client.user.tag} is online!`);
  client.user.setActivity("with the code", { type: "PLAYING" });
});

//Listen for private messages and respond with a message

//Gets called at every message
client.on("messageCreate", async (message) => {
  if (message.content === "!help") {
    const embed = new MessageEmbed()
      .setTitle("Sparky Help")
      .setDescription(
        "Sparky is a bot that allows you to create polls.\n\n" +
          'To create a poll, type `!poll title="Your Titel" option="custom option" option="custom option 2" ` .\n\n' +
          "To vote, react to the poll with the emoji corresponding to the option you want to vote for.\n\n" +
          "To view a poll, type `!poll view ` and then the poll id\n\n" +
          "To delete a poll, type `!poll delete ` and then the poll id\n\n"
      )
      .setColor("#0099ff");
    await message.channel.send({ embeds: [embed] });
  }

  if (message.channel.type === "DM") {
    if (message.content.startsWith("!syncvideo")) {
      message.channel.send("https://sync-video.de/create");
    }
  }
  if (message.content.startsWith("!polls help")) {
    const embed = new MessageEmbed()
      .setTitle("Sparky Polls Help")
      .setDescription(
        "Sparky is a bot that allows you to create polls.\n\n" +
          'To create a poll, type `!poll title="Your Titel" option="custom option" option="custom option 2" ` .\n\n' +
          "To vote, react to the poll with the emoji corresponding to the option you want to vote for.\n\n" +
          "To view a poll, type `!poll view ` and then the poll id\n\n" +
          "To delete a poll, type `!poll delete ` and then the poll id\n\n"
      )
      .setColor("#0099ff");
    await message.channel.send({ embeds: [embed] });
    return;
  }

  //Check if the message is a poll
  if (message.content.startsWith("!polls")) {
    //Gets all the pools with a query -> select * from polls where guild_id = message.guild.id
    let embed = await embedAllPolls(message.guild.id);
    message.channel.send({ embeds: [embed] });
    return;
  }

  if (message.content.startsWith("!poll ")) {
    //!poll title="poll title" option1="option 1" option2="option 2" option3="option 3"
    //dont split on every space, only if the space is not in quotes
    const args = message.content
      .slice(6)
      .split(/\s(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    const title = args[0].split("=")[1].replace(/^"(.*)"$/, "$1");
    //remove the starting and ending quotes from the title

    const options = args.slice(1);

    const poll = new Poll(
      title,
      "This poll is a Hello world poll",
      message.author.username,
      message.guild.id
    );
    options.forEach((option) => {
      poll.addOption(option.split("=")[1].replace(/^"(.*)"$/, "$1"));
    });

    await poll.commitPoll();

    const embed = new MessageEmbed()
      .setTitle(poll.title)
      .setDescription(poll.description)
      .setColor("#0099ff")
      .setFooter(poll.created_by, message.author.avatarURL());

    console.log(options);

    poll.options.forEach((option) => {
      embed.addField(option[0], option[1].toString());
    });

    message.channel.send({ embeds: [embed] });
  }
});

client.on("messageCreate", async (message) => {
  if (message.channel.type === "dm") {
    if (message.content.startsWith("!syncvideo")) {
      message.channel.send("https://sync-video.de/create");
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN.toString());
