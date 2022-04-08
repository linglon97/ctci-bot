import * as dotenv from "dotenv";
import {Client, Intents, MessageEmbed} from "discord.js";
import {playSongFromLocalMusic, playSongFromYouTube, stopPlayingMusic} from "./utils/music";
import {isMessageMeantForBot, ALL_INTENTS} from "./utils/discord_utils";
import {handlePersonMessage, validPeople, } from "./utils/people";

dotenv.config({ path: __dirname+'/.env' });
const DISCORD_API_KEY = process.env.DISCORD_API_KEY;

function initClient() {
    const intents = new Intents(ALL_INTENTS);
    const client = new Client({intents});
    client.login(DISCORD_API_KEY);

    client.once('ready', () => {
        client.user!.setActivity('HBD Tony April 15', {type: 'PLAYING'});
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
        const command = args[0].toLowerCase();
        
        if (command && validPeople.includes(command)) {
            handlePersonMessage(command, message, client);
            return;
        }
        const helpEmbed = new MessageEmbed()
            .setTitle('UwU OwO Music Bot')
            .setDescription('`uwu play {song name}`: plays a song\n`uwu stop`: stops playing music\n`uwu chugjug`: try me out!')
            .setColor('#78A2CC');
        switch(command) {
            // TODO: pause, skip, queue, finer tuned settings (volume, speed, quality)
            case "help":
                message.channel.send({embeds: [helpEmbed]});
                return;
            case "play":
                if (!args) {
                    message.reply("Please specify a song to play.");
                }
                const songName = args.slice(1).join(" ");
                playSongFromYouTube(message, songName);
                return;
            case "stop":
                stopPlayingMusic();
                return;
            case "chugjug":
                playSongFromLocalMusic(message, "chugjug");
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