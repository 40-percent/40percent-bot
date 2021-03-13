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
    await Promise.all(
      msg.attachments.map(async (each) => {
        const url = each.proxyURL;
        console.log(
          `40s channel posted showcase: ${msg.author.username} ${url}`
        );
        const embed = new MessageEmbed()
          .setAuthor(
            msg.author.username,
            msg.author.avatarURL() ?? msg.author.defaultAvatarURL
          )
          .setDescription(
            msg.content.replace(
              new RegExp(`^<#${config.FORTIES_SHOWCASE}>\\s*`),
              ''
            )
          )
          .addField('Original Message', `[🔗](${msg.url})`)
          .setTimestamp()
          .setImage(url);
        await showcaseChannel.send(embed);
        return;
      })
    );
  }
}
