import { Message, Client, MessageAttachment, TextChannel } from 'discord.js';
import config from '../config';

export default async function handleBuySellTradeMessage(
  msg: Message,
  client: Client
): Promise<void> {
  const buySellTradeChannel = (await client.channels.fetch(
    config.BUY_SELL_TRADE_CHANNEL
  )) as TextChannel;
}
