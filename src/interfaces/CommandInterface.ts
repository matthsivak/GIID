import { CacheType, CommandInteraction, Message } from "discord.js"

export interface CommandInterface {
  name: string
  description: string
  // usage: string
  aliases?: string[]
  enabled: boolean
  guildOnly: boolean
  ownerOnly: boolean
  permissions: string[]
  // args: {
  //     key: string;
  //     label: string;
  //     type: string;
  //     prompt: string;
  //     infinite: boolean;
  //     default: any;
  // }[];
  run: (
    message: Message | null,
    Interaction: CommandInteraction<CacheType> | null
  ) => Promise<string | null>
}
