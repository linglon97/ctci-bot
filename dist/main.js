"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
const discord_js_1 = require("discord.js");
const music_1 = require("./utils/music");
const discord_utils_1 = require("./utils/discord_utils");
const people_1 = require("./utils/people");
dotenv.config({ path: __dirname + '/.env' });
const DISCORD_API_KEY = process.env.DISCORD_API_KEY;
function initClient() {
    const intents = new discord_js_1.Intents(discord_utils_1.ALL_INTENTS);
    const client = new discord_js_1.Client({ intents });
    client.login(DISCORD_API_KEY);
    client.once('ready', () => {
        client.user.setActivity('HBD Tony April 15', { type: 'PLAYING' });
    });
    client.on("messageCreate", async (message) => {
        if (!(0, discord_utils_1.isMessageMeantForBot)(message)) {
            return;
        }
        const commandBody = message.content.slice(4);
        const args = commandBody.split(' ');
        if (!args.length) {
            message.reply("Try !uwu play followed by a song name.");
            return;
        }
        const command = args[0].toLowerCase();
        if (command && people_1.validPeople.includes(command)) {
            (0, people_1.handlePersonMessage)(command, message, client);
            return;
        }
        const helpEmbed = new discord_js_1.MessageEmbed()
            .setTitle('UwU OwO Music Bot')
            .setDescription('`uwu play {song name}`: plays a song\n`uwu stop`: stops playing music\n`uwu chugjug`: try me out!')
            .setColor('#78A2CC');
        switch (command) {
            case "help":
                message.channel.send({ embeds: [helpEmbed] });
                return;
            case "play":
                if (!args) {
                    message.reply("Please specify a song to play.");
                }
                const songName = args.slice(1).join(" ");
                (0, music_1.playSongFromYouTube)(message, songName);
                return;
            case "stop":
                (0, music_1.stopPlayingMusic)();
                return;
            case "chugjug":
                (0, music_1.playSongFromLocalMusic)(message, "chugjug");
                return;
            default:
                message.channel.send("Invalid command!");
                message.channel.send({ embeds: [helpEmbed] });
                break;
        }
        return;
    });
}
initClient();
