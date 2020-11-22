import config from '../config';
import { Message, MessageAttachment, Client, TextChannel } from 'discord.js';
import slugify from 'slugify';

type IcGbRequestParams = {
  type: string;
  name: string;
  description: string;
};

const requestErrorMessage = `Wrong format or missing parameters. Please check the format and submit again.
\`IC or GB
Project name (up to 32 characters)
Project description
more description... (up to 1000 characters, up to 12 lines)
\`
For example:
\`IC
Disaster40
This is an awesome 40% keyboard with bracket-mount whingdings.
I will be cutting this using a rotary spinner zingus.
Promise it's not a disaster guyyyys.
\``;

function formatIcGbReviewMessage(
  creator: string,
  { name, type, description }: IcGbRequestParams
): string {
  const nameSlug = formatSlug(name);
  return `Creator - ${creator}
${type} - ${name} - #${nameSlug}
${description}`;
}

async function handleIcGbRequestMessage(
  msg: Message,
  client: Client
): Promise<void> {
  if (msg.channel.id == config.IC_GB_REQUEST_CHANNEL) {
    try {
      const requestParams = parseIcGbRequestMessage(msg);
      const reviewMessage = formatIcGbReviewMessage(
        msg.author.toString(),
        requestParams
      );
      const serializedParams = new MessageAttachment(
        Buffer.from(
          JSON.stringify({
            ...requestParams,
            slug: formatSlug(requestParams.name),
          })
        ),
        'metadata.json'
      );
      const reviewChannel = (await client.channels.fetch(
        config.IC_GB_REVIEW_CHANNEL
      )) as TextChannel;
      await reviewChannel.send(reviewMessage, serializedParams);
    } catch (error) {
      await msg.reply(requestErrorMessage);
    }
  }
}

function parseIcGbRequestMessage(msg: Message): IcGbRequestParams {
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
    if (typeValid && nameValid && descriptionValid) {
      return { type, name, description };
    }
  }
  throw Error('FormatError');
}

function formatSlug(projectName: string): string {
  return slugify(projectName, {
    lower: true,
    strict: true,
    locale: 'en',
  });
}

export { handleIcGbRequestMessage };
