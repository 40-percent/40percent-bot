import { Message, Client, TextChannel, MessageEmbed } from 'discord.js';
import config from '../config';

export default async function handleShowcaseMessage(
  msg: Message,
  client: Client
): Promise<void> {
  if (
    msg.content.includes(config.FORTIES_SHOWCASE) &&
    msg.attachments.size > 0
  ) {
    const showcaseChannel = (await client.channels.fetch(
      config.FORTIES_SHOWCASE
    )) as TextChannel;
    let url;

    if (msg.attachments.size > 1) {
      const acceptedFileFormats = new RegExp('.(jpe?g|png|gif|bmp)$', 'i');
      const attachmentToUse = msg.attachments.find((attachment) =>
        acceptedFileFormats.test(attachment.url)
      );
      if (attachmentToUse) url = attachmentToUse.url ;
    } else {
      url = msg.attachments.first()?.url as string;
    }

    if (!url) {
      console.log('Missing showcase image:', {
        author: msg.author.tag,
        message_url: msg.url,
      });

      await msg.reply(
        "something went wrong. We'll take a look, but in the meantime please ensure an image is attached and try again."
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

    const embed = new MessageEmbed()
      .setAuthor(
        msg.author.username,
        msg.author.avatarURL() ?? msg.author.defaultAvatarURL
      )
      .setDescription(trimDescription(msg.content))
      .addField('Original Message', `[Jump 🔗](${msg.url})`, true)
      .setImage(url)
      .setFooter(`#${(msg.channel as TextChannel).name}`)
      .setTimestamp();

    const embedMessage = await showcaseChannel.send(embed);

    console.log('40s channel posted showcase:', {
      author: msg.author.tag,
      image_url: url,
      message_url: embedMessage.url,
    });

    return;
  }
}
