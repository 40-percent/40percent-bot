import { Message, Client, TextChannel } from 'discord.js';
import config from '../config';

export default async function handleSoundtestMessage(
  msg: Message,
  client: Client
): Promise<void> {
  if (msg.content.includes(config.FORTIES_SOUNDTEST)) {
    const url = msg.content.split(`<#${config.FORTIES_SOUNDTEST}> `)[1];
    console.log(`40s channel posted soundtest: ${msg.author.username} ${url}`);
    const soundTestChannel = (await client.channels.fetch(
      config.FORTIES_SOUNDTEST
    )) as TextChannel;
    await soundTestChannel.send(`Posted by: ${msg.author.toString()}\n${url}`);
  }
}
