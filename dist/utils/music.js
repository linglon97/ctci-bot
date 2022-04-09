"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYouTubeVideoData = exports.pauseSong = exports.unPauseSong = exports.getIsSongPaused = exports.showSongQueue = exports.queueSong = exports.stopPlayingMusic = exports.skipCurrentSong = exports.songQueueHasMusic = exports.playSongFromYouTube = exports.playSongFromLocalMusic = void 0;
const tslib_1 = require("tslib");
const voice_1 = require("@discordjs/voice");
const path_1 = require("path");
const discord_js_1 = require("discord.js");
const utils_1 = require("./utils");
const ytdl_core_discord_1 = tslib_1.__importDefault(require("ytdl-core-discord"));
const dotenv = tslib_1.__importStar(require("dotenv"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const yts = require('yt-search');
dotenv.config({ path: 'src/.env' });
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_API_KEY_2 = process.env.GOOGLE_API_KEY_2;
const youtubeSearchApiEndpoint = 'https://www.googleapis.com/youtube/v3/search';
const youtubeWatchEndpoint = 'https://www.youtube.com/watch';
let audioPlayer;
let connection;
let isSongPaused = false;
let quitChannelTimeout;
const songQueue = [];
const playSongFromLocalMusic = (message, songName) => {
    if (!connection || !audioPlayer) {
        joinVoiceChannelAndStartAudioPlayer(message);
    }
    const resource = (0, voice_1.createAudioResource)((0, path_1.join)('./src/assets/', `${songName}.mp3`), { inlineVolume: true });
    resource.volume.setVolume(0.5);
    (0, utils_1.myAssert)(audioPlayer);
    audioPlayer.play(resource);
};
exports.playSongFromLocalMusic = playSongFromLocalMusic;
const playSongFromYouTube = async (message, ytVideoData, addToQueue) => {
    if (!connection || !audioPlayer) {
        joinVoiceChannelAndStartAudioPlayer(message);
        audioPlayer?.on(voice_1.AudioPlayerStatus.Idle, () => {
            songQueue.shift();
            if (songQueue.length) {
                (0, exports.playSongFromYouTube)(message, songQueue[0]);
            }
            (0, exports.showSongQueue)(message);
            quitChannelTimeout = setTimeout(() => {
                message.channel.send("Bot was idle for 60 seconds, leaving channel.");
                (0, exports.stopPlayingMusic)();
            }, 60000);
        });
        audioPlayer?.on(voice_1.AudioPlayerStatus.Paused, () => {
            quitChannelTimeout = setTimeout(() => {
                message.channel.send("Bot was paused for 60 seconds, leaving channel.");
                (0, exports.stopPlayingMusic)();
            }, 60000);
        });
    }
    if (!audioPlayer) {
        return;
    }
    const { title, thumbnails, description } = ytVideoData.snippet;
    if (title && thumbnails) {
        const embed = new discord_js_1.MessageEmbed()
            .setURL(`${youtubeWatchEndpoint}?v=${ytVideoData.videoId}`)
            .setTitle(`Now Playing: ${title}`)
            .setDescription(description.length > 100 ? `${decodeURIComponent(description).slice(0, 50)}...` : decodeURIComponent(description))
            .setThumbnail(thumbnails.medium.url)
            .setColor('#FF0000');
        message.channel.send({ embeds: [embed] });
    }
    const stream = await (0, ytdl_core_discord_1.default)(ytVideoData.videoId, { filter: 'audioonly', highWaterMark: 1 << 25 });
    const resource = (0, voice_1.createAudioResource)(stream, { inlineVolume: true });
    resource.volume.setVolume(0.5);
    (0, utils_1.myAssert)(audioPlayer);
    audioPlayer.play(resource);
    if (addToQueue)
        songQueue.unshift({ ...ytVideoData, submitter: message.author });
    return;
};
exports.playSongFromYouTube = playSongFromYouTube;
const joinVoiceChannelAndStartAudioPlayer = (message) => {
    (0, utils_1.myAssert)(message.member);
    if (!message.member.voice.channel) {
        message.reply('Join a voice channel first!');
        return;
    }
    connection = (0, voice_1.joinVoiceChannel)({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    });
    audioPlayer = (0, voice_1.createAudioPlayer)();
    audioPlayer.on(voice_1.AudioPlayerStatus.Playing, () => {
        clearTimeout(quitChannelTimeout);
    });
    connection.subscribe(audioPlayer);
};
const songQueueHasMusic = () => {
    return songQueue.length > 0;
};
exports.songQueueHasMusic = songQueueHasMusic;
const skipCurrentSong = async (message) => {
    audioPlayer?.stop();
};
exports.skipCurrentSong = skipCurrentSong;
const stopPlayingMusic = () => {
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
};
exports.stopPlayingMusic = stopPlayingMusic;
const queueSong = async (songName, message) => {
    clearTimeout(quitChannelTimeout);
    const youtubeVideoData = await (0, exports.getYouTubeVideoData)(songName);
    if (youtubeVideoData) {
        if (!songQueue.length) {
            isSongPaused = true;
        }
        songQueue.push({ ...youtubeVideoData, submitter: message.author });
        const { title, thumbnails, description } = youtubeVideoData.snippet;
        if (title && thumbnails) {
            const embed = new discord_js_1.MessageEmbed()
                .setURL(`${youtubeWatchEndpoint}?v=${youtubeVideoData.videoId}`)
                .setTitle(`Added to Queue: ${title}`)
                .setDescription(description.length > 100 ? `${decodeURIComponent(description).slice(0, 50)}...` : decodeURIComponent(description))
                .setThumbnail(thumbnails.medium.url)
                .setColor('#FF0000');
            message.channel.send({ embeds: [embed] });
        }
    }
    else {
        message.reply(`Failed to queue song: ${songName}`);
    }
};
exports.queueSong = queueSong;
const showSongQueue = (message) => {
    const songQueueEmbed = new discord_js_1.MessageEmbed()
        .setTitle('UwU OwO Music Bot Queue')
        .setColor('#78A2CC');
    let queueDescription;
    if (!songQueue.length) {
        queueDescription = "Queue is empty. Use `uwu q {song name}` to add to the queue.";
        songQueueEmbed.setDescription(queueDescription);
        message.channel.send({ embeds: [songQueueEmbed] });
        return;
    }
    for (let i = 0; i < songQueue.length; i++) {
        const { title: songTitle } = songQueue[i].snippet;
        const userId = songQueue[i].submitter?.id;
        if (i === 0) {
            queueDescription = `1. ${songTitle} (added by: <@${userId}>)`;
        }
        else {
            queueDescription += `\n${i + 1}. ${songTitle} ${userId ? `(added by: <@${userId}>)` : ''}`;
        }
    }
    songQueueEmbed.setDescription(queueDescription);
    message.channel.send({ embeds: [songQueueEmbed] });
};
exports.showSongQueue = showSongQueue;
const getIsSongPaused = () => {
    if (audioPlayer) {
        return isSongPaused;
    }
    return false;
};
exports.getIsSongPaused = getIsSongPaused;
const unPauseSong = (message) => {
    if (audioPlayer) {
        audioPlayer.unpause();
    }
    else {
        (0, exports.playSongFromYouTube)(message, songQueue[0]);
    }
    isSongPaused = false;
};
exports.unPauseSong = unPauseSong;
const pauseSong = () => {
    if (audioPlayer) {
        audioPlayer.pause();
        isSongPaused = true;
    }
};
exports.pauseSong = pauseSong;
const getYouTubeVideoData = async (songName) => {
    try {
        const videoData = await fetchVideoData(songName, GOOGLE_API_KEY);
        return videoData;
    }
    catch {
        try {
            const videoData = await fetchVideoData(songName, GOOGLE_API_KEY_2);
            return videoData;
        }
        catch {
            const videoData = await getYouTubeVideoDataUsingYtSearchModule(songName);
            return videoData;
        }
    }
};
exports.getYouTubeVideoData = getYouTubeVideoData;
const fetchVideoData = async (songName, apiKey) => {
    const response = await axios_1.default.get(`${youtubeSearchApiEndpoint}?key=${apiKey}&order=relevance&q=${songName}&videoDefinition=any&maxResults=1&part=snippet`);
    const data = response.data;
    const firstVideo = data.items[0];
    return { videoId: firstVideo.id.videoId, snippet: firstVideo.snippet };
};
const getYouTubeVideoDataUsingYtSearchModule = async (songName) => {
    try {
        const results = await yts(songName);
        const firstResult = results.videos[0];
        return { videoId: firstResult.videoId, snippet: { title: firstResult.title, description: firstResult.description, thumbnails: { medium: { url: firstResult.thumbnail } } } };
    }
    catch {
        return undefined;
    }
};
