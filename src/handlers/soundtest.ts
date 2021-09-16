import { Message, MessageAttachment, Client, TextChannel } from 'discord.js';
import config from '../config';
import containsValidUrl from '../utils/containsValidUrl';

export default async function handleSoundtestMessage(
  msg: Message,
  client: Client
): Promise<void> {
  if (
    msg.content.includes(`<#${config.FORTIES_SOUNDTEST}>`) &&
    msg.channel.id !== config.FORTIES_SOUNDTEST
  ) {
    const soundTestChannel = (await client.channels.fetch(
      config.FORTIES_SOUNDTEST
    )) as TextChannel;
    const filteredUserInput = msg.content
      .replace(new RegExp(`<#${config.FORTIES_SOUNDTEST}>`), '')
      .trim();
    const validUrlPresent = containsValidUrl(filteredUserInput);
    const attachmentUrl = msg.attachments?.first()?.url;

    if (validUrlPresent || !!attachmentUrl) {
      let messageToSend = `Posted by: ${msg.author.toString()}`;
      if (filteredUserInput) messageToSend += `\n${filteredUserInput}`;
      console.log(
        `40s channel posted soundtest: ${msg.author.username} ${filteredUserInput}`
      );
      if (attachmentUrl) {
        const attachment = new MessageAttachment(attachmentUrl);
        await soundTestChannel.send({
          content: messageToSend,
          files: [attachment],
        });
      } else {
        await soundTestChannel.send(messageToSend);
      }
    } else {
      await msg.reply(
        'sound tests must contain a valid url and/or attachment.'
      );
    }
  }
}
