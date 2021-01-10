import { Message, Client, MessageAttachment, TextChannel } from 'discord.js';
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
        const attachment = new MessageAttachment(url);
        console.log(
          `40s channel posted showcase: ${msg.author.username} ${url}`
        );
        await showcaseChannel.send(
          `Posted by: ${msg.author.toString()}\nOP: ${msg.url}`,
          attachment
        );
        return;
      })
    );
  }
}
