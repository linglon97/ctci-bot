import {getEmojiStringByName, joinChannelAndPlayMusic} from "./utils.js";

const validPeople = [
    "mike",
    "tony",
    "josh",
];

const imageUrlsByPeople = {
    "mike": "https://i.imgur.com/5Q65BAF.png",
}

const emojiNamesByPeople = {
    "mike": ["mikeflex", "lysol", "Jeez", "300lbs", "MikeHappy"],
    "tony": ["tonyfinger"],
    "josh": ["No_Josh", "dead_josh", "jkem", "chitoge"],
}


export async function handlePersonMessage(name, message, client) {
    if (!validPeople.includes(name)) {
        message.reply(`${name} is not a real person!`);
        return;
    }
    // if (![...Object.keys(imageUrlsByPeople)].includes(name)) {

    // }
}

export const handleMessageContentDirectly = (message, client) => {
    console.log(message.content);
    if (message.content === "chugjug") {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.reply("Please join a voice channel.");
            return true;
        }

        joinChannelAndPlayMusic(message);
        return true;
    }
    if (validPeople.includes(message.content)) {
        const emojiNames = emojiNamesByPeople[message];
        const emojiStrings = emojiNames.map(emojiName => {
            const emojiString = getEmojiStringByName(emojiName, client);
            // Send chitoge in case it doesn't work
            return emojiString ? emojiString : "842629230307442698";
        })

        message.reply(emojiStrings.join(" "));
        return true;
    }
    return false;
}