import { Message, Client, TextChannel } from 'discord.js';
import config from '../config';

export default async function handleBuySellTradeMessage(
  msg: Message,
  client: Client
): Promise<void> {
  const buySellTradeChannel = (await client.channels.fetch(
    config.BUY_SELL_TRADE_CHANNEL
  )) as TextChannel;
  await Promise.all(
    // Parse the message using regex to validate location tag

    // ignore if present and exit

    // if missing, copy msg

    // delete users msg from bst

    // ping them in bst discussion w/ private quoted reply

    // TODO: can we remove slowmode timer?
  )
}
