import {AudioPlayer, AudioPlayerStatus, joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnection} from '@discordjs/voice';
import {join} from "path";
import {Message, MessageEmbed, User} from "discord.js";
import {myAssert} from './utils';
import ytdlDiscord from 'ytdl-core-discord';
import * as dotenv from "dotenv";
import axios from 'axios';
const yts = require( 'yt-search' )

dotenv.config({ path:'src/.env' });
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_API_KEY_2 = process.env.GOOGLE_API_KEY_2;

const youtubeSearchApiEndpoint = 'https://www.googleapis.com/youtube/v3/search';
const youtubeWatchEndpoint = 'https://www.youtube.com/watch';

type YouTubeVideoData = {videoId: string, snippet: any, submitter?: User};

// TODO: refactor this into a singleton class. 
let audioPlayer: AudioPlayer | undefined;
let connection: VoiceConnection | undefined;
let isSongPaused = false;
let quitChannelTimeout: ReturnType<typeof setTimeout>;
const songQueue: Array<YouTubeVideoData> = [];

export const playSongFromLocalMusic = (message: Message, songName: string) => {
    if (!connection || !audioPlayer) {
        joinVoiceChannelAndStartAudioPlayer(message);
    } 
    const resource = createAudioResource(join('./src/assets/', `${songName}.mp3`), {inlineVolume: true});
    resource.volume!.setVolume(0.5);

    myAssert(audioPlayer);
    audioPlayer.play(resource);
}

// TODO: fix behavior when play is invoked and a song is already playing.
export const playSongFromYouTube = async (message: Message, ytVideoData: YouTubeVideoData, addToQueue?: boolean): Promise<void> => {
    if (!connection || !audioPlayer) {
        joinVoiceChannelAndStartAudioPlayer(message);
         // Only register handles once when audio player is started. 
         audioPlayer?.on(AudioPlayerStatus.Idle, () => {
            songQueue.shift();
            if (songQueue.length) {
                playSongFromYouTube(message, songQueue[0]);
            }
            showSongQueue(message);
            quitChannelTimeout = setTimeout(() => {
                message.channel.send("Bot was idle for 60 seconds, leaving channel.");
                stopPlayingMusic();
            }, 60000);
        });

        audioPlayer?.on(AudioPlayerStatus.Paused, () => {
            quitChannelTimeout = setTimeout(() => {
                message.channel.send("Bot was paused for 60 seconds, leaving channel.");
                stopPlayingMusic();
            }, 60000);
        });
    } 

    // If audio player wasn't set, we weren't in a voice channel. 
    if (!audioPlayer) {
        return;
    }

    const {title, thumbnails, description} = ytVideoData.snippet;
    if (title && thumbnails) {
        const embed = new MessageEmbed()
        .setURL(`${youtubeWatchEndpoint}?v=${ytVideoData.videoId}`)
        .setTitle(`Now Playing: ${title}`)
        .setDescription(description.length > 100 ? `${decodeURIComponent(description).slice(0, 50)}...` : decodeURIComponent(description))
        .setThumbnail(thumbnails.medium.url)
        .setColor('#FF0000');
        message.channel.send({embeds: [embed]});
    }

    const stream = await ytdlDiscord(ytVideoData.videoId, {filter:'audioonly', highWaterMark: 1 << 25});
    const resource = createAudioResource(stream, {inlineVolume: true});
    resource.volume!.setVolume(0.5);

    myAssert(audioPlayer);
    audioPlayer.play(resource);
   
    if (addToQueue) songQueue.unshift({...ytVideoData, submitter: message.author});
    return;
}

const joinVoiceChannelAndStartAudioPlayer = (message: Message) =>  {
    myAssert(message.member);
    if (!message.member.voice.channel) {
        message.reply('Join a voice channel first!');
        return;
    }
    connection = joinVoiceChannel({
        channelId: message.member.voice.channel!.id,
        guildId: message.guild!.id,
        adapterCreator: message.guild!.voiceAdapterCreator,
    });
    
    audioPlayer = createAudioPlayer();

    audioPlayer.on(AudioPlayerStatus.Playing, () => {
        clearTimeout(quitChannelTimeout);
    });
    connection.subscribe(audioPlayer);
}

export const songQueueHasMusic = () => {
    return songQueue.length > 0;
}

export const skipCurrentSong = async (message: Message) => {
    audioPlayer?.stop();
}

export const stopPlayingMusic = () => {
    if (connection) {
        connection.destroy();
        connection = undefined;
    }
    if (audioPlayer) {
        audioPlayer.stop();
        audioPlayer = undefined;
        if (quitChannelTimeout) {
            clearTimeout(quitChannelTimeout);
        }
    }
}

export const queueSong = async (songName: string, message: Message) => {
    clearTimeout(quitChannelTimeout);
    const youtubeVideoData = await getYouTubeVideoData(songName);
    if (youtubeVideoData) {
        if (!songQueue.length) {
            // Consider song paused so if play is hit when queue,
            // we unpause/play the music. 
            isSongPaused = true;
        }
        songQueue.push({...youtubeVideoData, submitter: message.author});
        const {title, thumbnails, description} = youtubeVideoData.snippet;
        if (title && thumbnails) {
            const embed = new MessageEmbed()
            .setURL(`${youtubeWatchEndpoint}?v=${youtubeVideoData.videoId}`)
            .setTitle(`Added to Queue: ${title}`)
            .setDescription(description.length > 100 ? `${decodeURIComponent(description).slice(0, 50)}...` : decodeURIComponent(description))
            .setThumbnail(thumbnails.medium.url)
            .setColor('#FF0000');
            message.channel.send({embeds: [embed]});
        }
    } else {
        message.reply(`Failed to queue song: ${songName}`);
    }
}

export const showSongQueue = (message: Message) => {
    const songQueueEmbed = new MessageEmbed()
        .setTitle('UwU OwO Music Bot Queue')
        .setColor('#78A2CC');
    let queueDescription: string;

    if (!songQueue.length) {
        queueDescription = "Queue is empty. Use `uwu q {song name}` to add to the queue."
        songQueueEmbed.setDescription(queueDescription);
        message.channel.send({embeds: [songQueueEmbed]});
        return;
    }

    for (let i = 0; i < songQueue.length; i++) {
        const {title: songTitle} = songQueue[i].snippet; 
        const userId = songQueue[i].submitter?.id;
        if (i === 0) {
            queueDescription = `1. ${songTitle} (added by: <@${userId}>)`;
        } else {
            // Must be defined by now since we start at 0. 
            queueDescription! += `\n${i + 1}. ${songTitle} ${userId ? `(added by: <@${userId}>)`: ''}`;
        }
    }
    songQueueEmbed.setDescription(queueDescription!);
    message.channel.send({embeds: [songQueueEmbed]});
}

export const getIsSongPaused = (): boolean => {
    if (audioPlayer) {
        return isSongPaused;
    }
    return false;
}

export const unPauseSong = (message: Message): void => {
    if (audioPlayer) {
        audioPlayer.unpause();
    } else {
        playSongFromYouTube(message, songQueue[0]);
    }

    isSongPaused = false;
}

export const pauseSong = (): void => {
    if (audioPlayer) {
        audioPlayer.pause();
        isSongPaused = true;
    }
}

export const getYouTubeVideoData = async (songName: string): Promise<YouTubeVideoData | undefined> => {
    // Let's first use our own API keys, if that fails, then let's use yt-search.
    // TODO: this is spaghetti af, fix this...
    try {
        const videoData = await fetchVideoData(songName, GOOGLE_API_KEY);
        return videoData;
    } catch {
        try {
            const videoData = await fetchVideoData(songName, GOOGLE_API_KEY_2);
            return videoData;
        } catch {
            const videoData = await getYouTubeVideoDataUsingYtSearchModule(songName);
            return videoData;
        }
    }
}

const fetchVideoData = async (songName: string, apiKey?: string): Promise<YouTubeVideoData> => {
    const response = await axios.get(`${youtubeSearchApiEndpoint}?key=${apiKey}&order=relevance&q=${songName}&videoDefinition=any&maxResults=1&part=snippet`);
    const data = response.data;
    const firstVideo = data.items[0];
    return {videoId: firstVideo.id.videoId, snippet: firstVideo.snippet};
}

const getYouTubeVideoDataUsingYtSearchModule = async (songName: string): Promise<YouTubeVideoData | undefined> => { 
    try {
        const results = await yts(songName);
        const firstResult = results.videos[0];
        return {videoId: firstResult.videoId, snippet: {title: firstResult.title, description: firstResult.description, thumbnails: {medium: {url: firstResult.thumbnail}}}}
    } catch {
        return undefined;
    }
 }