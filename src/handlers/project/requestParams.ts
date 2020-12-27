import { Snowflake, Message, Client, TextChannel } from 'discord.js';
import config from '../../config';

type ProjectRequestParams = {
  type: string;
  name: string;
  ownerId: Snowflake;
  description: string;
  imageUrl: string;
};

async function parse(
  msg: Message,
  client: Client
): Promise<ProjectRequestParams> {
  const lines = msg.content.split('\n');
  if (lines.length >= 3) {
    const type = lines[0];
    const name = lines[1];
    const description = lines.slice(2).join('\n');
    const typeValid = type == 'IC' || type == 'GB';
    const nameValid = name.length > 0 && name.length < 32;
    const descriptionValid =
      description.length > 0 &&
      description.length <= 1000 &&
      lines.length <= 15;
    const attachmentUrls = msg.attachments.map((attachment) => attachment.url);
    if (attachmentUrls.length !== 1) {
      const requestChannel = (await client.channels.fetch(
        config.IC_GB_REQUEST_CHANNEL
      )) as TextChannel;
      await requestChannel.send(
        'Please attach exactly one image for representing your project in the announcement.'
      );
      throw Error('FormatError');
    }
    if (typeValid && nameValid && descriptionValid) {
      return {
        type,
        name,
        ownerId: msg.author.id,
        description,
        imageUrl: attachmentUrls[0],
      };
    }
  }
  const requestErrorMessage = `Wrong format or missing parameters.`;
  const requestChannel = (await client.channels.fetch(
    config.IC_GB_REQUEST_CHANNEL
  )) as TextChannel;
  await requestChannel.send(requestErrorMessage);
  throw Error('FormatError');
}

export { ProjectRequestParams };

export default {
  parse,
};
