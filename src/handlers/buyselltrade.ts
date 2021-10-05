import {
  Message,
  Client,
  TextChannel
} from 'discord.js';
import config from '../config';

const containsValidLocation = (msg: string) => {
  const locationFormat = new RegExp(
    '\[.{2,10}\]',
    'i'
  );
  return locationFormat.test(msg);
};

export default async function handleBuySellTradeMessage(
  msg: Message,
  client: Client
): Promise<void> {
    if (containsValidLocation(msg.content)) return;

    const buySellTradeChannel = (await client.channels.fetch(
      config.BUY_SELL_TRADE_CHANNEL
    )) as TextChannel;
    const buySellTradeDiscussionChannel = (await client.channels.fetch(
      config.BUY_SELL_TRADE_DISCUSSION_CHANNEL
    )) as TextChannel;
    const msgCopy = msg;

    await msg.delete()
      .then(msg => console.log(`Deleted message in BST from: ${msg.author.username} for missing location.`))
      .catch(console.error);

    // ping them in bst discussion w/ private quoted reply

    // TODO: can we remove slowmode timer?
}
