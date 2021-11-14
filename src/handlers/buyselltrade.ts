import { Message, Client, Formatters, TextChannel } from 'discord.js';
import { byInternet } from 'country-code-lookup';
import config from '../config';

const containsValidLocation = (msg: string) => {
  const locationFormat =
    /[[({]{1}([a-zA-Z]{2,3})(-([a-zA-Z]{2,4}))?[\])}]{1}/im;
  const location = locationFormat.exec(msg);

  if (!location) return false;

  return location.some((v) => (v ? byInternet(v) : false));
};

export default async function handleBuySellTradeMessage(
  msg: Message,
  client: Client
): Promise<void> {
  if (msg.channel.id !== config.BUY_SELL_TRADE_CHANNEL) return;
  if (
    msg.channel.isThread() ||
    ['THREAD_STARTER_MESSAGE', 'THREAD_CREATED'].includes(msg.type)
  )
    return;
  if (containsValidLocation(msg.content)) return;

  const buySellTradeDiscussionChannel = (await client.channels.fetch(
    config.BUY_SELL_TRADE_DISCUSSION_CHANNEL
  )) as TextChannel;
  const msgCopy = Formatters.blockQuote(msg.content);

  await msg
    .delete()
    .then((msg) =>
      console.log(
        `Deleted message in BST from ${msg.author.username} for missing location or invalid formatting: ${msg.content}`
      )
    )
    .catch(console.error);

  await buySellTradeDiscussionChannel.send(`
  ${Formatters.userMention(
    msg.author.id
  )}, your request was removed because it lacked a valid country code or the formatting was invalid. Please review the BST rules and resubmit your message:
  ${msgCopy}
`);
}
