import config from './config';

import { Message, Client, MessageAttachment, TextChannel } from 'discord.js';

const client = new Client();

client.on('ready', () => {
  console.log('=== READY ===');
});

async function handleMessageAsync(msg: Message) {
  // Ignore messages from bots.
  if (msg.author.bot) {
    return;
  }

  if (msg.guild?.id === config.FORTIES_GUILD) {
    if (msg.content.includes(config.FORTIES_SHOWCASE)) {
      if (msg.attachments.size > 0) {
        msg.attachments.map(async (each) => {
          const url = each.proxyURL;
          const attachment = new MessageAttachment(url);

          console.log(
            `40s channel posted showcase: ${msg.author.username} ${url}`
          );

          const showcaseChannel = (await client.channels.fetch(
            config.FORTIES_SHOWCASE
          )) as TextChannel;
          await showcaseChannel.send(
            `Posted by: ${msg.author.toString()}`,
            attachment
          );
        });
      }
    }
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
}

// We use this wrapper because typescript eslint will throw a fit if we return
//  and unresolved promise instead of void in the client message handler.
function handleMessageSyncWrapper(msg: Message): void {
  void handleMessageAsync(msg);
}

client.on('message', handleMessageSyncWrapper);

void client.login(config.BOT_TOKEN);
