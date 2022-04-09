import { Message, Client } from "discord.js";
import {getEmojiStringByName} from "./discord_utils";

export const validPeople = [
    "mike",
    "tony",
    "josh",
];

const imageUrlsByPeople = {
    "mike": "https://i.imgur.com/5Q65BAF.png",
}

const emojiNamesByPeople : {[key: string]: Array<string>} = {
    "mike": ["mikeflex", "lysol", "Jeez", "300lbs", "MikeHappy"],
    "tony": ["tonyfinger"],
    "josh": ["No_Josh", "dead_josh", "jkem", "chitoge"],
}

export async function handlePersonMessage(name: string, message: Message, client: Client) {
    if (validPeople.includes(name)) {
        const emojiNames = emojiNamesByPeople[name];
        const emojiStrings = emojiNames.map(emojiName => {
            const emojiString = getEmojiStringByName(emojiName, client);
            // Send chitoge in case it doesn't work
            return emojiString ? emojiString : "842629230307442698";
        })
        let output = emojiStrings.join(" ");
        message.reply(output);
    }
}

export const handleMessageContentDirectly = (message: Message, client: Client) => {
    // if (message.content === "chugjug") {
    //     const voiceChannel = message.member?.voice.channel;
    //     if (!voiceChannel) {
    //         message.reply("Please join a voice channel.");
    //         return true;
    //     }

    //     // joinChannelAndPlayMusic(message);
    //     return true;
    // }

    return false;
}