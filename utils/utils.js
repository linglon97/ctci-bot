import {AudioPlayerStatus, joinVoiceChannel, createAudioPlayer, createAudioResource} from '@discordjs/voice';

let audioPlayer;

// https://discord.com/developers/docs/topics/gateway#list-of-intents
export const ALL_INTENTS = 
    (1 << 0) +  // GUILDS
    (1 << 1) +  // GUILD_MEMBERS
    (1 << 2) +  // GUILD_BANS
    (1 << 3) +  // GUILD_EMOJIS_AND_STICKERS
    (1 << 4) +  // GUILD_INTEGRATIONS
    (1 << 5) +  // GUILD_WEBHOOKS
    (1 << 6) +  // GUILD_INVITES
    (1 << 7) +  // GUILD_VOICE_STATES
    (1 << 8) +  // GUILD_PRESENCES
    (1 << 9) +  // GUILD_MESSAGES
    (1 << 10) + // GUILD_MESSAGE_REACTIONS
    (1 << 11) + // GUILD_MESSAGE_TYPING
    (1 << 12) + // DIRECT_MESSAGES
    (1 << 13) + // DIRECT_MESSAGE_REACTIONS
    (1 << 14);  // DIRECT_MESSAGE_TYPING

export const messagePrefix = "!";

export const isMessageMeantForBot = (message) =>  {
    if (message.author.bot) {
        return false;
    }
    return true;
    // return message.content.startsWith(messagePrefix);
}

export const getEmojiStringByName = (emojiName, client) => {
    return client.emojis.cache.find(emoji => emoji.name === emojiName);
}

export const joinChannelAndPlayMusic = (message) => {
    const voiceChannel = message.member.voice.channel;
    const permissions = voiceChannel.permissionsFor(message.client.user);
    const connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    });
    audioPlayer = createAudioPlayer();
    const resource = createAudioResource(`../assets/chugjug.mp3`, {inlineVolume: true});
    resource.volume.setVolume(0.2);

    connection.subscribe(audioPlayer);
    console.log("playing audio")
    audioPlayer.play(resource);

    // audioPlayer.on(AudioPlayerStatus.Idle, () => {
    //     connection.destroy();
    // });
}

