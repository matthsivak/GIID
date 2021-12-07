import { Client, Intents } from "discord.js"
import { config } from "./config.js"
import { Command } from "./Command.js"

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
})

client.on("ready", () => {
  console.log("[INFO] Ready!")

  client.user?.setActivity("with the bot", { type: "WATCHING" })

  Command.loadAll(client)
})

client.login(config.token)
