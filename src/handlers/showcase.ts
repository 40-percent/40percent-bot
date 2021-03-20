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

    const url = msg.attachments.first()?.proxyURL as string;
    console.log(`40s channel posted showcase: ${msg.author.username} ${url}`);

    const embed = new MessageEmbed()
      .setAuthor(
        msg.author.username,
        msg.author.avatarURL() ?? msg.author.defaultAvatarURL
      )
      .setDescription(
        msg.content
          .replace(`<#${config.FORTIES_SHOWCASE}>`, '')
          .trim()
          .substring(0, 512)
      )
      .addField('Original Message', `[Jump 🔗](${msg.url})`, true)
      .setImage(url)
      .setFooter(`#${(msg.channel as TextChannel).name}`)
      .setTimestamp();

    await showcaseChannel.send(embed);
    return;
  }
}
