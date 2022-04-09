import * as dotenv from "dotenv";
import {Client, Intents, MessageEmbed} from "discord.js";
import {getFirstSongInQueue, songQueueHasMusic, getLyricsForSongName, loopSong, getYouTubeVideoData, queueSong, showSongQueue, pauseSong,skipCurrentSong, unPauseSong, getIsSongPaused, playSongFromLocalMusic, playSongFromYouTube, stopPlayingMusic} from "./utils/music";
import {isMessageMeantForBot, ALL_INTENTS} from "./utils/discord_utils";
import {handlePersonMessage, validPeople} from "./utils/people";
import {helpMessage} from "./utils/help_message";

dotenv.config({ path: __dirname+'/.env' });
const DISCORD_API_KEY = process.env.DISCORD_API_KEY;

function initClient() {
    const intents = new Intents(ALL_INTENTS);
    const client = new Client({intents});
    client.login(DISCORD_API_KEY);

    client.once('ready', () => {
        client.user!.setActivity('`uwu help` or `owo help`', {type: 'PLAYING'});
    });

    client.on("messageCreate", async (message) => {
        if (!isMessageMeantForBot(message)){
            return;
        }

        // All prefixes have length 3 at the moment. 
        const commandBody = message.content.slice(4);
        const args = commandBody.split(' ');
        if (!args.length) {
            message.reply("Try !uwu play followed by a song name.");
            return;
        }
        const command = args.shift()?.toLowerCase();
        
        if (command && validPeople.includes(command)) {
            handlePersonMessage(command, message, client);
            return;
        }
        const helpEmbed = new MessageEmbed()
            .setTitle('UwU OwO Music Bot')
            .setDescription(helpMessage)
            .setColor('#78A2CC');
        const songName = args.join(" ");
        switch(command) {
            case "help":
                message.channel.send({embeds: [helpEmbed]});
                return;
            case "start":
                unPauseSong(message);
                return;
            case "skip":
                skipCurrentSong(message);
                return;
            // Plays a song right away, skipping queue
            // If a song is paused though, unpauses it. 
            case "play":
                if (!args.length) {
                    if (getIsSongPaused() || songQueueHasMusic()) {
                        unPauseSong(message);
                        return;
                    }

                    message.reply("Please specify a song to play.");
                    return;
                }
                const youTubeVideoData = await getYouTubeVideoData(songName);
                if (!youTubeVideoData) {
                    message.reply('Error finding that song!');
                    return;
                }
                playSongFromYouTube(message, youTubeVideoData, true);
                return;
            case "pause":
                pauseSong();
                return;
            case "stop":
            case "die":
            case "kill":
            case "quit":
                stopPlayingMusic();
                return;
            case "add":
            case "q":
            case "queue":
                if (!args.length) {
                    showSongQueue(message);
                    return;
                }
                queueSong(songName, message);
                return;
            case "chugjug":
                const chugjugVideoData = await getYouTubeVideoData("chugjug");
                if (!chugjugVideoData) {
                    message.reply('Error finding that song!');
                    return;
                }
                playSongFromYouTube(message, chugjugVideoData, true);
                return;
            case "loop":
                const isLooping = loopSong();
                if (isLooping) {
                    message.reply('Now looping current song');
                } else {
                    message.reply('Looping turned off');
                }
                return;
            case "lyrics":
                if (!songName) {
                    const firstSongName = await getFirstSongInQueue();
                    if (firstSongName) {
                        const lyrics = await getLyricsForSongName(firstSongName);
                        if (!lyrics || !lyrics.lyrics) {
                            message.reply('No lyrics found for current song.');
                            return;
                        }
                        const lyricsEmbed = new MessageEmbed()
                            .setTitle(`Lyrics for current song: ${firstSongName}`)
                            .setAuthor({name: lyrics.artist})
                            .setDescription(lyrics.lyrics)
                            .setColor('#78A2CC');
                        message.channel.send({embeds: [lyricsEmbed]});
                        return;
                    }
                    message.reply('Specify a song you want the lyrics for.');
                    return;
                }
                const lyrics = await getLyricsForSongName(songName);
                if (!lyrics || !lyrics.lyrics) {
                    message.reply('No lyrics found for that song.');
                    return;
                }
                const lyricsEmbed = new MessageEmbed()
                    .setTitle(`Lyrics for ${songName}`)
                    .setAuthor({name: lyrics.artist})
                    .setDescription(lyrics.lyrics)
                    .setColor('#78A2CC');
                message.channel.send({embeds: [lyricsEmbed]});
                return;
            default:
                message.channel.send("Invalid command!");
                message.channel.send({embeds: [helpEmbed]});
                break;
        }
        return;
    });
}

initClient();