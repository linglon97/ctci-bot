import { Message, Client } from "discord.js";

// https://discord.com/developers/docs/topics/gateway#list-of-intents
export const ALL_INTENTS = 
    (1 << 0) +  // GUILDS
    (1 << 1) +  // GUILD_MEMBERS
    (1 << 2) +  // GUILD_BANS
    (1 << 3) +  // GUILD_EMOJIS_AND_STICKERS
    (1 << 4) +  // GUILD_INTEGRATIONS
    (1 << 5) +  // GUILD_WEBHOOKS
    (1 << 6) +  // GUILD_INVITES
    (1 << 7) +  // GUILD_VOICE_STATES
    (1 << 8) +  // GUILD_PRESENCES
    (1 << 9) +  // GUILD_MESSAGES
    (1 << 10) + // GUILD_MESSAGE_REACTIONS
    (1 << 11) + // GUILD_MESSAGE_TYPING
    (1 << 12) + // DIRECT_MESSAGES
    (1 << 13) + // DIRECT_MESSAGE_REACTIONS
    (1 << 14);  // DIRECT_MESSAGE_TYPING

export const messagePrefixes = ["uwu", "owo"];

export const isMessageMeantForBot = (message: Message) =>  {
    if (message.author.bot) {
    }

    return messagePrefixes.some(prefix => message.content.startsWith(prefix.toLowerCase()))
}

export const getEmojiStringByName = (emojiName: string, client: Client) => {
    return client.emojis.cache.find((emoji: any) => emoji.name === emojiName);
}
