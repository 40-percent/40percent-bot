import config from '../config';
import { Message, Client } from 'discord.js';
import handleShowcaseMessage from './showcase';
import handleSoundtestMessage from './soundtest';
import handleBuySellTradeMessage from './buyselltrade';
import { handleIcGbRequestMessage } from './projects';

async function handleMessage(msg: Message, client: Client): Promise<void> {
  // Ignore messages from bots.
  if (msg.author.bot) {
    return;
  }

  if (msg.guild?.id === config.FORTIES_GUILD) {
    await handleShowcaseMessage(msg, client);
    await handleSoundtestMessage(msg, client);
    await handleIcGbRequestMessage(msg, client);
    await handleBuySellTradeMessage(msg, client);
  }
}

export { handleMessage };
