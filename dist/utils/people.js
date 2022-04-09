"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessageContentDirectly = exports.handlePersonMessage = exports.validPeople = void 0;
const discord_utils_1 = require("./discord_utils");
exports.validPeople = [
    "mike",
    "tony",
    "josh",
];
const imageUrlsByPeople = {
    "mike": "https://i.imgur.com/5Q65BAF.png",
};
const emojiNamesByPeople = {
    "mike": ["mikeflex", "lysol", "Jeez", "300lbs", "MikeHappy"],
    "tony": ["tonyfinger"],
    "josh": ["No_Josh", "dead_josh", "jkem", "chitoge"],
};
async function handlePersonMessage(name, message, client) {
    if (exports.validPeople.includes(name)) {
        const emojiNames = emojiNamesByPeople[name];
        const emojiStrings = emojiNames.map(emojiName => {
            const emojiString = (0, discord_utils_1.getEmojiStringByName)(emojiName, client);
            return emojiString ? emojiString : "842629230307442698";
        });
        let output = emojiStrings.join(" ");
        message.reply(output);
    }
}
exports.handlePersonMessage = handlePersonMessage;
const handleMessageContentDirectly = (message, client) => {
    return false;
};
exports.handleMessageContentDirectly = handleMessageContentDirectly;
