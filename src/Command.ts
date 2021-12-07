import { CommandInterface } from "./interfaces/CommandInterface"
import { CacheType, Client, CommandInteraction, Message } from "discord.js"
import { config } from "./config"
import { SlashCommandBuilder } from "@discordjs/builders"
import { readdir, statSync } from "fs"
import path from "path"
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")

export class Command {
  // #path: string = path.join(config.dir, "commands")
  #name: string
  #run: (
    message: Message | null,
    Interaction: CommandInteraction<CacheType> | null
  ) => Promise<any>
  #aliases: string[] | undefined
  #enabled: boolean
  #guildOnly: boolean
  #ownerOnly: boolean
  #desctription: string

  static commands: Command[] = []
  static slashCommands: SlashCommandBuilder[] = []

  private constructor(file: string, client: Client) {
    const command: CommandInterface = require(file).default

    this.#name = command.name
    this.#run = command.run
    this.#aliases = command.aliases
    this.#enabled = command.enabled
    this.#guildOnly = command.guildOnly
    this.#ownerOnly = command.ownerOnly
    this.#desctription = command.description

    Command.commands.push(this)

    Command.slashCommands.push(
      new SlashCommandBuilder().setName(this.#name).setDescription("test")
    )

    console.log(`[INFO] Loaded command: ${this.#name}`)
    Command.registerSlashCommand(
      client,
      new SlashCommandBuilder()
        .setName(this.#name)
        .setDescription(this.#desctription)
    )
  }

  static registerEventListeners(client: Client) {
    client.on("messageCreate", (message: Message) => {
      Command.commands.forEach((command) => {
        if (command.#guildOnly && !message.guild) return
        if (command.#ownerOnly && message.author.id !== config.ownerId) return
        if (
          message.content.startsWith(config.prefix + command.#name) &&
          command.#enabled
        ) {
          command.#run(message, null).then((result) => {
            if (result) message.channel.send(result)
          })
        }
        if (command.#aliases) {
          command.#aliases.forEach((alias) => {
            if (
              message.content.startsWith(config.prefix + alias) &&
              command.#enabled
            ) {
              command.#run(message, null).then((result) => {
                if (result) message.channel.send(result)
              })
            }
          })
        }
      })
    })

    client.on("interactionCreate", (interaction) => {
      Command.commands.forEach((command) => {
        if (command.#guildOnly && !interaction.guild) return
        if (command.#ownerOnly && interaction.user.id !== config.ownerId) return
        if (
          interaction.isCommand() &&
          interaction.commandName === command.#name &&
          command.#enabled
        ) {
          command.#run(null, interaction).then((result) => {
            if (result) interaction.reply(result)
          })
        }
        if (command.#aliases) {
          command.#aliases.forEach((alias) => {
            if (
              interaction.isCommand() &&
              interaction.commandName === alias &&
              command.#enabled
            ) {
              command.#run(null, interaction).then((result) => {
                if (result) interaction.reply(result)
              })
            }
          })
        }
      })
    })
  }

  static registerSlashCommand(
    client: Client,
    slashCommand: SlashCommandBuilder
  ) {
    const commandsData = [slashCommand].map((command) => command.toJSON())

    const rest = new REST({ version: "9" }).setToken(config.token)

    rest
      .put(Routes.applicationCommands(client.user?.id), {
        body: commandsData,
      })
      .then(() =>
        console.log("[REST] Registered slash command: " + slashCommand.name)
      )
      .catch(console.error)
  }

  static load(file: string, client: Client) {
    const command = new this(file, client)
    return command
  }

  private static readDir(dir: string, client: Client) {
    try {
      readdir(dir, (err, files) => {
        if (err) {
          console.error(err)
          return
        }

        files.forEach((file) => {
          const filePath = path.join(dir, file)
          const stat = statSync(filePath)

          if (stat.isDirectory()) {
            Command.readDir(filePath, client)
          } else if (stat.isFile() && file.endsWith(".js")) {
            Command.load(filePath, client)
          }
        })
      })
    } finally {
      Command.registerEventListeners(client)
      console.log("[INFO] All commands loaded.")

      // client.guilds.cache.forEach((guild) => {
      //   console.log(Command.slashCommands)

      //   Command.registerSlashCommand(client,)
      // })
    }
  }

  static loadAll(client: Client) {
    Command.readDir(path.join(config.dir, "commands"), client)
  }
}
