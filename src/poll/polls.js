const { getClient } = require("../database/db.js");
const {
  Client,
  MessageEmbed,
  Intents,
  Emoji,
  ReactionEmoji,
} = require("discord.js");

/*
create TABLE polls (
  polls_id serial PRIMARY KEY,
  guilde_id bigint NOT NULL,
  title TEXT not null,
  description TEXT,
  created_by text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp
);

create table options (
  options_id serial  primary key,
  pollID int references polls(polls_id),
  name varchar(255) not null,
  value int DEFAULT 0
);
*/

//Operations on polls
// 1. Save poll to database
// 2. Get poll from database
// 3. Update poll in database
// 4. Delete poll from database

class Poll {
  constructor(title, description = "", created_by = "", guilde_id) {
    this.polls_id = null;
    this.guilde_id = guilde_id;
    this.title = title;
    this.description = description;
    this.created_by = created_by;
    this.options = [];
  }

  addOption(option) {
    this.options.push([option, 0]);
  }

  addOptions(options) {
    options.forEach((option) => {
      this.options.push([option, 0]);
    });
  }

  //Save poll to database
  async commitPoll() {
    //Save the poll in the database
    let client = await getClient();

    //Insert the poll in the poll table

    let query = `INSERT INTO polls (guilde_id, title, description, created_by) VALUES ($1, $2, $3, $4) RETURNING polls_id`;
    let values = [
      this.guilde_id,
      this.title,
      this.description,
      this.created_by,
    ];
    //Query the database
    let result = await client.query(query, values);

    //Get the poll id
    let poll_id = result.rows[0].polls_id;
    this.polls_id = poll_id;

    //Insert the options in the options table
    for (let i = 0; i < this.options.length; i++) {
      let option = this.options[i];

      query = `INSERT INTO options (polls_id, name) VALUES ($1, $2)`;
      values = [poll_id, option[0]];
      //Insert in options with identifier polls id
      await client.query(query, values);
    }

    client.release();
  }

  //Get poll from database
  async getPoll(poll_id) {
    let client = await getClient();

    let query = `SELECT * FROM polls WHERE polls_id = $1`;
    let values = [poll_id];
    let result = await client.query(query, values);

    let poll = result.rows[0];
    let pollOptions = await this.getPollOptions(poll_id);
    this.polls_id = poll.polls_id;

    this.options = pollOptions;
  }

  //Get poll options from database
  async getPollOptions(poll_id) {
    let client = await getClient();

    let query = `SELECT * FROM options WHERE polls_id = $1`;
    let values = [poll_id];
    let result = await client.query(query, values);

    client.release();

    return result.rows;
  }

  //vote for an option
  async vote(option_id) {
    let client = await getClient();
    let query = `UPDATE options SET value = value + 1 WHERE options_id = $1`;
    let values = [option_id];
    await client.query(query, values);

    this.options[option_id][1]++;

    client.release();
  }

  //Delete poll from database
  async deletePoll() {
    let client = await getClient();

    //Delete the options of the poll
    let query = `DELETE FROM options WHERE polls_id = $1`;
    let values = [this.polls_id];
    await client.query(query, values);

    //Delete the poll
    query = `DELETE FROM polls WHERE polls_id = $1`;
    values = [this.polls_id];
    await client.query(query, values);

    client.release();
  }
}

async function getAllPolls(guild_id) {
  let client = await getClient();
  let result = await client.query("SELECT * FROM polls where guilde_id = $1", [
    guild_id,
  ]);
  return result.rows;
}
module.exports = {
  Poll,
  getAllPolls: getAllPolls(),
  getPoll: async function (pollId) {
    let client = await getClient();
    let result = await client.query("SELECT * FROM polls WHERE id = $1", [
      pollId,
    ]);
    return result.rows[0];
  },

  getPollAsEmbed: async function (id) {
    let poll = await this.getPoll(id);
    let embed = new MessageEmbed();
    embed.setTitle("Polls");
    embed.setColor("#0099ff");
    embed.setDescription(
      rows.map((row) => `${row.polls_id} - ${row.title}`).join("\n")
    );
    return embed;
  },

  getListOfAllPollsAsEmbed: async function () {
    let polls = await this.getAllPolls();
    let embed = new MessageEmbed();
    embed.setTitle("Polls");
    embed.setColor("#0099ff");
    embed.setDescription(
      polls.map((poll) => `${poll.polls_id} - ${poll.title}`).join("\n")
    );
    return embed;
  },
  embedAllPolls: async function (guild_id) {
    let polls = await getAllPolls(guild_id);
    let embed = new MessageEmbed();
    embed.setTitle("Polls");
    embed.setColor("#0099ff");
    embed.setDescription("Polls for the Guild: " + guild_id);
    polls.forEach((poll) => {
      embed.addField(poll.title, poll.description);
    });
    return embed;
  },
};
