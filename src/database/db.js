const { Pool } = require("pg");
require("dotenv").config();

let poolConfig = {};

if (process.env.NODE_ENV === "production") {
  poolConfig = {
    connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DB}`,
    idleTimeoutMillis: 30000,
    max: 20,
  };
} else {
  //Print the environment variables

  poolConfig = {
    user: process.env.POSTGRES_USER,
    host: "localhost",
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: 5432,
  };
}
const pool = new Pool(poolConfig);

module.exports = {
  async query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("executed query", { text, duration, rows: res.rowCount });
    return res;
  },
  async getClient() {
    //Retry up to 5 times to connect with the pool
    let client;
    for (let i = 0; i < 5; i++) {
      try {
        client = await pool.connect();
        break;
      } catch (e) {
        console.log("Failed to connect to the database");
        console.log(e);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (client === undefined) {
      throw new Error("Failed to connect to the database");
    }
    const query = client.query;
    const release = client.release;
    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error("A client has been checked out for more than 5 seconds!");
      console.error(
        `The last executed query on this client was: ${client.lastQuery}`
      );
    }, 5000);
    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    client.release = () => {
      // clear our timeout
      clearTimeout(timeout);
      // set the methods back to their old un-monkey-patched version
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    return client;
  },
};
