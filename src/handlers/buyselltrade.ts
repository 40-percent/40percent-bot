import {
  Message,
  Client,
  Formatters,
  TextChannel
} from 'discord.js';
import config from '../config';

const containsValidLocation = (msg: string) => {
  const locationFormat = /\[{1}[^\]]{2,10}\]{1}/im;
  return locationFormat.test(msg);
};

export default async function handleBuySellTradeMessage(
  msg: Message,
  client: Client
): Promise<void> {
    if (msg.channel.isThread()) return;
    if (containsValidLocation(msg.content)) return;

    const buySellTradeDiscussionChannel = (await client.channels.fetch(
      config.BUY_SELL_TRADE_DISCUSSION_CHANNEL
    )) as TextChannel;
    const msgCopy = Formatters.blockQuote(msg.content);

    await msg.delete()
      .then(msg => console.log(`Deleted message in BST from: ${msg.author.username} for missing location.`))
      .catch(console.error);

    await buySellTradeDiscussionChannel.send(`
  ${Formatters.userMention(msg.author.id)}, your request was removed because it lacked a valid location or the formatting was incorrect. Please review the BST rules and resubmit your message:
  ${msgCopy}
`);
}
