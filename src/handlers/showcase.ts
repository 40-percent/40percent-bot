import { Message, Client, TextChannel, MessageEmbed } from 'discord.js';
import config from '../config';

export default async function handleShowcaseMessage(
  msg: Message,
  client: Client
): Promise<void> {
  if (
    msg.content.includes(`<#${config.FORTIES_SHOWCASE}>`) &&
    msg.attachments.size > 0
  ) {
    const showcaseChannel = (await client.channels.fetch(
      config.FORTIES_SHOWCASE
    )) as TextChannel;

    const acceptedFileFormats = new RegExp(
      '.(jpe?g|png|gif|bmp|webp|tiff?)$',
      'i'
    );
    const image = msg.attachments.find((attachment) =>
      acceptedFileFormats.test(attachment.url)
    );

    if (!image) {
      await msg.reply(
        'showcase messages must contain an image. Accepted file types are .jpg, .png, .bmp, .gif, .webp, and .tif'
      );

      return;
    }

    const trimDescription = (content: string): string => {
      const trimmedContent = content
        .replace(`<#${config.FORTIES_SHOWCASE}>`, '')
        .trim();
      return trimmedContent.length > 512
        ? `${trimmedContent.substring(0, 512).trim()}...`
        : trimmedContent;
    };

    const embed = new MessageEmbed({
      author: {
        name: msg.author.username,
        icon_url: msg.author.avatarURL() ?? msg.author.defaultAvatarURL,
      },
      description: trimDescription(msg.content),
      fields: [
        {
          name: 'Original Message',
          value: `[Jump 🔗](${msg.url})`,
          inline: false,
        },
      ],
      image: {
        url: image.url,
        proxyURL: image.proxyURL,
        height: image.height ?? 0,
        width: image.width ?? 0,
      },
      timestamp: new Date(),
      footer: {
        text: `#${(msg.channel as TextChannel).name}`,
      },
    });

    const embedMessage = await showcaseChannel.send(embed);

    console.log('40s channel posted showcase:', {
      author: msg.author.tag,
      message_url: embedMessage.url,
      image: embed.image,
    });

    return;
  }
}
