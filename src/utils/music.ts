import {AudioPlayerStatus, AudioPlayer,  joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnection} from '@discordjs/voice';
import {join} from "path";
import {Message, MessageEmbed} from "discord.js";
import {myAssert} from './utils';
import ytdlDiscord from 'ytdl-core-discord';
import * as dotenv from "dotenv";
import axios from 'axios';

dotenv.config({ path:'src/.env' });
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const youtubeSearchApiEndpoint = 'https://www.googleapis.com/youtube/v3/search';
const youtubeWatchEndpoint = 'https://www.youtube.com/watch';

let audioPlayer: AudioPlayer | undefined;
let connection: VoiceConnection | undefined;

export const playSongFromLocalMusic = (message: Message, songName: string) => {
    joinVoiceChannelAndStartAudioPlayer(message);

    const resource = createAudioResource(join('./src/assets/', `${songName}.mp3`), {inlineVolume: true});
    resource.volume!.setVolume(0.5);

    myAssert(audioPlayer);
    audioPlayer.play(resource);
}

// TODO: fix behavior when play is invoked and a song is already playing.
export const playSongFromYouTube = async (message: Message, songName: string): Promise<void> => {
    const youTubeVideoData = await getyouTubeVideoData(message, songName);
    if (!youTubeVideoData) {
        return;
    }
    const {title, thumbnails, description} = youTubeVideoData.snippet;
    if (title && thumbnails) {
        const embed = new MessageEmbed()
        .setURL(`${youtubeWatchEndpoint}?v=${youTubeVideoData.videoId}`)
        .setTitle(`Now Playing: ${title}`)
        .setDescription(description.length > 100 ? `${decodeURIComponent(description).slice(0, 50)}...` : decodeURIComponent(description))
        .setThumbnail(thumbnails.medium.url)
        .setColor('#FF0000');
        message.channel.send({embeds: [embed]});
    }

    joinVoiceChannelAndStartAudioPlayer(message);
    const stream = await ytdlDiscord(youTubeVideoData.videoId, {filter:'audioonly', highWaterMark: 1 << 25});
    const resource = createAudioResource(stream, {inlineVolume: true});
    resource.volume!.setVolume(0.5);

    myAssert(audioPlayer);
    audioPlayer.play(resource);
}

const joinVoiceChannelAndStartAudioPlayer = (message: Message) =>  {
    stopPlayingMusic();
    myAssert(message.member);

    connection = joinVoiceChannel({
        channelId: message.member.voice.channel!.id,
        guildId: message.guild!.id,
        adapterCreator: message.guild!.voiceAdapterCreator,
    });
    audioPlayer = createAudioPlayer();
    connection.subscribe(audioPlayer);
}

export const stopPlayingMusic = () => {
    if (connection) {
        connection.destroy();
        connection = undefined;
    }
    if (audioPlayer) {
        audioPlayer.stop();
        audioPlayer = undefined;
    }
}

const getyouTubeVideoData = async (message: Message, songName: string): Promise<{videoId: string, snippet: any} | undefined> => {
    try {
        const response = await axios.get(`${youtubeSearchApiEndpoint}?key=${GOOGLE_API_KEY}&order=relevance&q=${songName}&videoDefinition=any&maxResults=1&part=snippet`);
        const data = response.data;
        const firstVideo = data.items[0];
        return {videoId: firstVideo.id.videoId, snippet: firstVideo.snippet};
    } catch {
        message.reply('Error finding that song!');
        return undefined;
    }
}