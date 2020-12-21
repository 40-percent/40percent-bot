import config from './config.js';
import {
  Message,
  Client,
  MessageReaction,
  User,
  PartialUser,
} from 'discord.js';
import {
  handleMessage as handleMessageAsync,
  handleReaction as handleReactionAsync,
} from './handlers';

const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.on('ready', () => {
  console.log('==== READY ====');
});

// We use these wrappers because typescript eslint will throw a fit if we return
//  and unresolved promise instead of void in the client handlers.
function handleMessageSyncWrapper(msg: Message): void {
  void handleMessageAsync(msg, client);
}

// We use these wrappers because typescript eslint will throw a fit if we return
//  and unresolved promise instead of void in the client handlers.
function handleReactionSyncWrapper(
  reaction: MessageReaction,
  user: User | PartialUser
): void {
  void handleReactionAsync(reaction, user, client);
}

client.on('message', handleMessageSyncWrapper);

client.on('messageReactionAdd', handleReactionSyncWrapper);

void client.login(config.BOT_TOKEN);
