import { Message } from 'discord.js';

const dotenv = require('dotenv').config();

const { Client, MessageAttachment, TextChannel } = require('discord.js');

const client = new Client();
const ENV = process.env;

client.on('ready', () => {
  console.log('=== READY ===');
});

client.on('message', async (msg: Message) => {
  // Ignore messages from bots.
  if (msg.author.bot) {
    return;
  }

  if (msg?.guild?.id === ENV.FORTIES_GUILD ?? '') {
    if (msg.content.includes(ENV.FORTIES_SHOWCASE ?? '')) {
      if (msg.attachments.size > 0) {
        msg.attachments.map(async (each) => {
          const url = each.proxyURL;
          const attachment = new MessageAttachment(url);

          console.log(
            `40s channel posted showcase: ${msg.author.username} ${url}`
          );
          const showcaseChannel = (await client.channels.fetch(
            ENV.FORTIES_SHOWCASE ?? ''
          )) as typeof TextChannel;
          await showcaseChannel.send(
            `Posted by: ${msg.author.toString()}`,
            attachment
          );
        });
      }
    }

    if (msg.content.includes(ENV.FORTIES_SOUNDTEST ?? '')) {
      const url = msg.content.split(`<#${ENV.FORTIES_SOUNDTEST ?? ''}> `)[1];

      console.log(
        `40s channel posted soundtest: ${msg.author.username} ${url}`
      );

      const soundTestChannel = (await client.channels.fetch(
        ENV.FORTIES_SOUNDTEST ?? ''
      )) as typeof TextChannel;
      await soundTestChannel.send(
        `Posted by: ${msg.author.toString()}\n${url}`
      );
    }
  }
});

client.login(ENV.BOT_TOKEN);
