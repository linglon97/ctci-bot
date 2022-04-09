"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
const discord_js_1 = require("discord.js");
const music_1 = require("./utils/music");
const discord_utils_1 = require("./utils/discord_utils");
const people_1 = require("./utils/people");
const help_message_1 = require("./utils/help_message");
dotenv.config({ path: __dirname + '/.env' });
const DISCORD_API_KEY = process.env.DISCORD_API_KEY;
function initClient() {
    const intents = new discord_js_1.Intents(discord_utils_1.ALL_INTENTS);
    const client = new discord_js_1.Client({ intents });
    client.login(DISCORD_API_KEY);
    client.once('ready', () => {
        client.user.setActivity('`uwu help` or `owo help`', { type: 'PLAYING' });
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
        const command = args.shift()?.toLowerCase();
        if (command && people_1.validPeople.includes(command)) {
            (0, people_1.handlePersonMessage)(command, message, client);
            return;
        }
        const helpEmbed = new discord_js_1.MessageEmbed()
            .setTitle('UwU OwO Music Bot')
            .setDescription(help_message_1.helpMessage)
            .setColor('#78A2CC');
        const songName = args.join(" ");
        switch (command) {
            case "help":
                message.channel.send({ embeds: [helpEmbed] });
                return;
            case "start":
                (0, music_1.unPauseSong)(message);
                return;
            case "skip":
                (0, music_1.skipCurrentSong)(message);
                return;
            case "play":
                if (!args.length) {
                    if ((0, music_1.getIsSongPaused)() || (0, music_1.songQueueHasMusic)()) {
                        (0, music_1.unPauseSong)(message);
                        return;
                    }
                    message.reply("Please specify a song to play.");
                    return;
                }
                const youTubeVideoData = await (0, music_1.getYouTubeVideoData)(songName);
                if (!youTubeVideoData) {
                    message.reply('Error finding that song!');
                    return;
                }
                (0, music_1.playSongFromYouTube)(message, youTubeVideoData, true);
                return;
            case "pause":
                (0, music_1.pauseSong)();
                return;
            case "stop":
            case "die":
            case "kill":
            case "quit":
                (0, music_1.stopPlayingMusic)();
                return;
            case "add":
            case "q":
            case "queue":
                if (!args.length) {
                    (0, music_1.showSongQueue)(message);
                    return;
                }
                (0, music_1.queueSong)(songName, message);
                return;
            case "chugjug":
                const chugjugVideoData = await (0, music_1.getYouTubeVideoData)("chugjug");
                if (!chugjugVideoData) {
                    message.reply('Error finding that song!');
                    return;
                }
                (0, music_1.playSongFromYouTube)(message, chugjugVideoData, true);
                return;
            case "loop":
                const isLooping = (0, music_1.loopSong)();
                if (isLooping) {
                    message.reply('Now looping current song');
                }
                else {
                    message.reply('Looping turned off');
                }
                return;
            case "lyrics":
                if (!songName) {
                    const firstSongName = await (0, music_1.getFirstSongInQueue)();
                    if (firstSongName) {
                        const lyrics = await (0, music_1.getLyricsForSongName)(firstSongName);
                        if (!lyrics || !lyrics.lyrics) {
                            message.reply('No lyrics found for current song.');
                            return;
                        }
                        const lyricsEmbed = new discord_js_1.MessageEmbed()
                            .setTitle(`Lyrics for current song: ${firstSongName}`)
                            .setAuthor({ name: lyrics.artist })
                            .setDescription(lyrics.lyrics)
                            .setColor('#78A2CC');
                        message.channel.send({ embeds: [lyricsEmbed] });
                        return;
                    }
                    message.reply('Specify a song you want the lyrics for.');
                    return;
                }
                const lyrics = await (0, music_1.getLyricsForSongName)(songName);
                if (!lyrics || !lyrics.lyrics) {
                    message.reply('No lyrics found for that song.');
                    return;
                }
                const lyricsEmbed = new discord_js_1.MessageEmbed()
                    .setTitle(`Lyrics for ${songName}`)
                    .setAuthor({ name: lyrics.artist })
                    .setDescription(lyrics.lyrics)
                    .setColor('#78A2CC');
                message.channel.send({ embeds: [lyricsEmbed] });
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
