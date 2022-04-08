"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPlayingMusic = exports.playSongFromYouTube = exports.playSongFromLocalMusic = void 0;
const tslib_1 = require("tslib");
const voice_1 = require("@discordjs/voice");
const path_1 = require("path");
const discord_js_1 = require("discord.js");
const utils_1 = require("./utils");
const ytdl_core_discord_1 = tslib_1.__importDefault(require("ytdl-core-discord"));
const dotenv = tslib_1.__importStar(require("dotenv"));
const axios_1 = tslib_1.__importDefault(require("axios"));
dotenv.config({ path: 'src/.env' });
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const youtubeSearchApiEndpoint = 'https://www.googleapis.com/youtube/v3/search';
const youtubeWatchEndpoint = 'https://www.youtube.com/watch';
let audioPlayer;
let connection;
const playSongFromLocalMusic = (message, songName) => {
    joinVoiceChannelAndStartAudioPlayer(message);
    const resource = (0, voice_1.createAudioResource)((0, path_1.join)('./src/assets/', `${songName}.mp3`), { inlineVolume: true });
    resource.volume.setVolume(0.5);
    (0, utils_1.myAssert)(audioPlayer);
    audioPlayer.play(resource);
};
exports.playSongFromLocalMusic = playSongFromLocalMusic;
const playSongFromYouTube = async (message, songName) => {
    const youTubeVideoData = await getyouTubeVideoData(message, songName);
    if (!youTubeVideoData) {
        return;
    }
    const { title, thumbnails, description } = youTubeVideoData.snippet;
    if (title && thumbnails) {
        const embed = new discord_js_1.MessageEmbed()
            .setURL(`${youtubeWatchEndpoint}?v=${youTubeVideoData.videoId}`)
            .setTitle(`Now Playing: ${title}`)
            .setDescription(description.length > 100 ? `${decodeURIComponent(description).slice(0, 50)}...` : decodeURIComponent(description))
            .setThumbnail(thumbnails.medium.url)
            .setColor('#FF0000');
        message.channel.send({ embeds: [embed] });
    }
    joinVoiceChannelAndStartAudioPlayer(message);
    const stream = await (0, ytdl_core_discord_1.default)(youTubeVideoData.videoId, { filter: 'audioonly', highWaterMark: 1 << 25 });
    const resource = (0, voice_1.createAudioResource)(stream, { inlineVolume: true });
    resource.volume.setVolume(0.5);
    (0, utils_1.myAssert)(audioPlayer);
    audioPlayer.play(resource);
};
exports.playSongFromYouTube = playSongFromYouTube;
const joinVoiceChannelAndStartAudioPlayer = (message) => {
    (0, exports.stopPlayingMusic)();
    (0, utils_1.myAssert)(message.member);
    connection = (0, voice_1.joinVoiceChannel)({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    });
    audioPlayer = (0, voice_1.createAudioPlayer)();
    connection.subscribe(audioPlayer);
};
const stopPlayingMusic = () => {
    if (connection) {
        connection.destroy();
        connection = undefined;
    }
    if (audioPlayer) {
        audioPlayer.stop();
        audioPlayer = undefined;
    }
};
exports.stopPlayingMusic = stopPlayingMusic;
const getyouTubeVideoData = async (message, songName) => {
    try {
        const response = await axios_1.default.get(`${youtubeSearchApiEndpoint}?key=${GOOGLE_API_KEY}&order=relevance&q=${songName}&videoDefinition=any&maxResults=1&part=snippet`);
        const data = response.data;
        const firstVideo = data.items[0];
        return { videoId: firstVideo.id.videoId, snippet: firstVideo.snippet };
    }
    catch {
        message.reply('Error finding that song!');
        return undefined;
    }
};
