import * as dotenv from "dotenv";
import {Client, Intents, MessageEmbed} from "discord.js";
import {songQueueHasMusic, getYouTubeVideoData, queueSong, showSongQueue, pauseSong,skipCurrentSong, unPauseSong, getIsSongPaused, playSongFromLocalMusic, playSongFromYouTube, stopPlayingMusic} from "./utils/music";
import {isMessageMeantForBot, ALL_INTENTS} from "./utils/discord_utils";
import {handlePersonMessage, validPeople, } from "./utils/people";

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
            .setDescription('`uwu play {song name}`: the bot will join your channel and play the song specified\n`uwu q {song name}`: adds a song to the queue\n `uwu stop`: stops playing music\n`uwu chugjug`: try me out!\n`uwu skip`: skips the current song and plays the next one in the queue\n `uwu play`: plays the first song in queue\n`uwu pause`: pauses the current song if one is playing\n`uwu q`: displays the current song q\n`uwu mike`: mike')
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
            default:
                message.channel.send("Invalid command!");
                message.channel.send({embeds: [helpEmbed]});
                break;
        }
        return;
    });
}

initClient();