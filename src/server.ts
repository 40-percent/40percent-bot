// import { config as dotenvConfig } from 'dotenv';
import { Message, Client, MessageAttachment, TextChannel } from 'discord.js';

// // As early as possible in your application, require and configure dotenv.
// // https://www.npmjs.com/package/dotenv#usage
// dotenvConfig();

const client = new Client();
const ENV = process.env;

client.on('ready', () => {
  console.log('=== READY ===');
});

async function handleMessageAsync(msg: Message) {
  // Ignore messages from bots.
  if (msg.author.bot) {
    return;
  }

  if (msg.guild?.id === ENV.FORTIES_GUILD) {
    if (msg.content.includes(ENV.FORTIES_SHOWCASE)) {
      if (msg.attachments.size > 0) {
        msg.attachments.map(async (each) => {
          const url = each.proxyURL;
          const attachment = new MessageAttachment(url);

          console.log(
            `40s channel posted showcase: ${msg.author.username} ${url}`
          );

          const showcaseChannel = (await client.channels.fetch(
            ENV.FORTIES_SHOWCASE
          )) as TextChannel;
          await showcaseChannel.send(
            `Posted by: ${msg.author.toString()}`,
            attachment
          );
        });
      }
    }

    if (msg.content.includes(ENV.FORTIES_SOUNDTEST)) {
      const url = msg.content.split(`<#${ENV.FORTIES_SOUNDTEST}> `)[1];

      console.log(
        `40s channel posted soundtest: ${msg.author.username} ${url}`
      );

      const soundTestChannel = (await client.channels.fetch(
        ENV.FORTIES_SOUNDTEST
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

console.log(ENV);

void client.login(ENV.BOT_TOKEN);
