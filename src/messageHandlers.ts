import config from './config';
import { Message, Client, MessageAttachment, TextChannel } from 'discord.js';


async function handleMessage(msg: Message, client: Client): Promise<void> {
    // Ignore messages from bots.
    if (msg.author.bot) {
        return;
    }

    if (msg.guild?.id === config.FORTIES_GUILD) {
        await handleShowcaseMessage(msg, client);
        await handleSoundtestMessage(msg, client);
    }
}

async function handleShowcaseMessage(msg: Message, client: Client) {
    if (msg.content.includes(config.FORTIES_SHOWCASE) && msg.attachments.size > 0) {
        const showcaseChannel = (await client.channels.fetch(
            config.FORTIES_SHOWCASE
        )) as TextChannel;
        await Promise.all(msg.attachments.map(
            async (each) => {
                const url = each.proxyURL;
                const attachment = new MessageAttachment(url);
                console.log(
                    `40s channel posted showcase: ${msg.author.username} ${url}`
                );
                await showcaseChannel.send(
                    `Posted by: ${msg.author.toString()}`,
                    attachment
                );
                return;
            }
        ))

    }
}

async function handleSoundtestMessage(msg: Message, client: Client) {
    if (msg.content.includes(config.FORTIES_SOUNDTEST)) {
        const url = msg.content.split(`<#${config.FORTIES_SOUNDTEST}> `)[1];
        console.log(
            `40s channel posted soundtest: ${msg.author.username} ${url}`
        );
        const soundTestChannel = (await client.channels.fetch(
            config.FORTIES_SOUNDTEST
        )) as TextChannel;
        await soundTestChannel.send(
            `Posted by: ${msg.author.toString()}\n${url}`
        );
    }
}

export { handleMessage }