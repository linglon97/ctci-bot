"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmojiStringByName = exports.isMessageMeantForBot = exports.messagePrefixes = exports.ALL_INTENTS = void 0;
exports.ALL_INTENTS = (1 << 0) +
    (1 << 1) +
    (1 << 2) +
    (1 << 3) +
    (1 << 4) +
    (1 << 5) +
    (1 << 6) +
    (1 << 7) +
    (1 << 8) +
    (1 << 9) +
    (1 << 10) +
    (1 << 11) +
    (1 << 12) +
    (1 << 13) +
    (1 << 14);
exports.messagePrefixes = ["uwu", "owo"];
const isMessageMeantForBot = (message) => {
    if (message.author.bot) {
    }
    return exports.messagePrefixes.some(prefix => message.content.startsWith(prefix.toLowerCase()));
};
exports.isMessageMeantForBot = isMessageMeantForBot;
const getEmojiStringByName = (emojiName, client) => {
    return client.emojis.cache.find((emoji) => emoji.name === emojiName);
};
exports.getEmojiStringByName = getEmojiStringByName;
