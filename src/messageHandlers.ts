import config from './config';
import { Message, Client, MessageAttachment, TextChannel } from 'discord.js';
import slugify from 'slugify';


async function handleMessage(msg: Message, client: Client): Promise<void> {
    // Ignore messages from bots.
    if (msg.author.bot) {
        return;
    }

    if (msg.guild?.id === config.FORTIES_GUILD) {
        await handleShowcaseMessage(msg, client);
        await handleSoundtestMessage(msg, client);
        await handleIcGbRequestMessage(msg, client);
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

async function handleIcGbRequestMessage(msg: Message, client: Client) {
    if (msg.channel.id == config.IC_GB_REQUEST_CHANNEL) {
        try {
            const { type, name, description } = parseIcGbRequestMessage(msg);
            const nameSlug = slugify(name, {
                lower: true,
                strict: true,
                locale: 'en'
            });
            const reviewChannel = (await client.channels.fetch(
                config.IC_GB_REVIEW_CHANNEL
            )) as TextChannel;
            await reviewChannel.send(
                `${msg.author.toString()} requested ${type} for ${name}
Channel name would be #${nameSlug}
${description}
`
            );
        } catch (error) {
            await msg.reply(`Wrong format or missing parameters. Please check the format and submit again.
\`IC or GB
Project name (up to 32 characters)
Project description
more description... (up to 1000 characters, up to 12 lines)
\`
For example:
\`IC
Disaster40
This is an awesome 40% keyboard with bracket-mount whingdings.
I will be cutting this using a rotary spinner zingus.
Promise it's not a disaster guyyyys.
\`
`);
        }
    }
}

function parseIcGbRequestMessage(msg: Message) {
    const lines = msg.content.split('\n');
    if (lines.length >= 3) {
        const type = lines[0];
        const name = lines[1];
        const description = lines.slice(2).join('\n');
        const typeValid = (type == 'IC' || type == 'GB');
        const nameValid = (name.length > 0 && name.length < 32);
        const descriptionValid = (
            description.length > 0 &&
            description.length <= 1000 &&
            lines.length <= 15
        );
        if (typeValid && nameValid && descriptionValid) {
            return { type, name, description };
        }
    }
    throw Error('FormatError');
}

export { handleMessage }