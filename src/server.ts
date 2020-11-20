import config from './config.js';
import { Message, Client } from 'discord.js';
import { handleMessage as handleMessageAsync } from './messageHandlers';

const client = new Client();

client.on('ready', () => {
  console.log('==== READY ====');
});

// We use this wrapper because typescript eslint will throw a fit if we return
//  and unresolved promise instead of void in the client message handler.
function handleMessageSyncWrapper(msg: Message): void {
  void handleMessageAsync(msg, client);
}

client.on('message', handleMessageSyncWrapper);

void client.login(config.BOT_TOKEN);
