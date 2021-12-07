import { Client } from "discord.js"
import { CommandInterface } from "../interfaces/CommandInterface"

const ping: CommandInterface = {
  name: "ping",
  description: "Replies with pong!",
  // usage: "",
  aliases: [],
  enabled: true,
  guildOnly: false,
  ownerOnly: false,
  permissions: [],
  // args: [],
  run: async (message, interaction) => {
    if (interaction) {
      let client: Client
      client = interaction.client
      let ms = client.ws.ping
      return "Pong! " + Math.round(ms) + "ms"
    }
    if (message) {
      let client: Client
      client = message.client
      let ms = client.ws.ping
      return "Pong! " + Math.round(ms) + "ms"
    }
    return "Some error occured."
  },
}

export default ping
