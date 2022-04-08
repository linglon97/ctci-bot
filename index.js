import { Client, Intents, MessageEmbed, Collection } from "discord.js";
import {isMessageMeantForBot, messagePrefix, ALL_INTENTS} from "./utils/utils.js";
import {handlePersonMessage, handleMessageContentDirectly} from "./utils/people.js";
import 'dotenv/config' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

const BOT_API_KEY = process.env.DISCORD_API_KEY;

function initClient() {
    const intents = new Intents(ALL_INTENTS);
    const client = new Client({intents});
    client.login(BOT_API_KEY);

    client.once('ready', () => {
        client.user.setActivity('HBD Tony April 15', {type: 'PLAYING'});
    });

    client.on("messageCreate", async (message) => {
        if (!isMessageMeantForBot(message)){
            return;
        }
        if (handleMessageContentDirectly(message, client)) {
            return;
        }
        const commandBody = message.content.slice(messagePrefix.length);
        const args = commandBody.split(' ');
        const command = args.shift().toLowerCase();

        message.reply(`${command}`);
        console.log(command, args);
        switch(command) {
            case "p": 
            case "person": {
                const name = args[0];
                await handlePersonMessage(name, message, client);
            }
            default:
                break;
        }
    });
}

initClient();