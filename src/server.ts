import config from './config.js';
import { Client, User, Message, MessageReaction } from 'discord.js';
import handleShowcaseMessage from './handlers/showcase';
import handleSoundtestMessage from './handlers/soundtest';
import {
  handleIcGbRequestMessage,
  handleIcGbReviewReaction,
  handleProjectAnnouncementReaction,
} from './handlers/project';
import fetchPartial from './utils/fetchPartial';
import callHandlers from './utils/callHandlers.js';

function messageShouldBeHandled(msg: Message): boolean {
  // Ignore messages from bots
  // Ignore messages from DMs
  return !msg.author.bot && msg.guild?.id === config.FORTIES_GUILD;
}

function reactionShouldBeHandled(reaction: MessageReaction, user: User) {
  // Ignore reactions from bots
  // Ignore reactions from DMs
  return !user.bot && reaction.message.guild?.id === config.FORTIES_GUILD;
}

const client = new Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'],
});

client.once('ready', () => {
  console.log('==== READY ====');
});

client.on('error', (err) => {
  console.log('Uncaught error:', err);
});

client.on('message', (msg) => {
  void fetchPartial(msg).then(() => {
    if (messageShouldBeHandled(msg)) {
      void callHandlers(
        handleShowcaseMessage(msg, client),
        handleSoundtestMessage(msg, client),
        handleIcGbRequestMessage(msg, client)
      );
    }
  });
});

client.on('messageReactionAdd', (reaction, user) => {
  void Promise.all([fetchPartial(reaction), fetchPartial(user)]).then(() => {
    if (reactionShouldBeHandled(reaction, user as User)) {
      void callHandlers(
        handleIcGbReviewReaction(reaction, client, user as User),
        handleProjectAnnouncementReaction(reaction, user as User, 'add')
      );
    }
  });
});

client.on('messageReactionRemove', (reaction, user) => {
  void Promise.all([fetchPartial(reaction), fetchPartial(user)]).then(() => {
    if (reactionShouldBeHandled(reaction, user as User)) {
      void callHandlers(
        handleProjectAnnouncementReaction(reaction, user as User, 'remove')
      );
    }
  });
});

void client.login(config.BOT_TOKEN);
