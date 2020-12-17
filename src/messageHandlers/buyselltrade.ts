import { Message, Client, TextChannel, MessageEmbed } from "discord.js";
import { clearTimeout } from "timers";
import config from '../config';

class BstPost extends Message {
    validationMessages: string[];
    // folowing only set when validation fails 
    warningMessage?: Message;
    expiration?: NodeJS.Timeout;

    constructor(msg: Message, warningMsg?: Message, expiration?: NodeJS.Timeout) {
        super(msg.client, {
            id: msg.id,
            type: msg.type,
            content: msg.content,
            author: msg.author,
            pinned: msg.pinned,
            tts: msg.tts,
            embeds: msg.embeds,
            attachments: msg.attachments,
            nonce: msg.nonce
        }
            , msg.channel);

        this.validationMessages = [];
        this.warningMessage = warningMsg;
        this.expiration = expiration;
    }
    addMessage(errText: string) {
        this.validationMessages.push(errText);
    }
    setMessageExpiration(timeInMs: number) {
        //this.expiration = 
        setTimeout(this.deleteMessage.bind(this), timeInMs);
    }
    async deleteMessage() {

        await this.delete();
        this.deleted = true;
        await this.warningMessage?.edit(this.warningMessage.content + "**Post was not edited in 30 minutes and was deleted**");
    }
    clearMessageExpiration() {
        if (this.expiration)
            clearTimeout(this.expiration);
    }
}

export default async function handleBuySellTradeMessage(
    msg: Message,
    client: Client
): Promise<void> {
    if (msg.channel.id == config.FORTIES_BST) {
        const currPost = new BstPost(msg);
        validateBstMessage(currPost);
    }
}

async function validateBstMessage(bstPost: BstPost) {
    // add any additional validations here 
    if (validateLocationBlockExistance(bstPost)) {
        validateLocationBlockLength(bstPost);
    }

    if (bstPost.validationMessages.length) {
        await handleFailedBstValidation(bstPost);
    }
    if (bstPost.warningMessage) {
        // if this isn't a messages first time through the system, clear the delete timer
        bstPost.clearMessageExpiration();
    }
}

async function handleFailedBstValidation(bstPost: BstPost) {
    const channel = bstPost.guild?.channels.cache.get(config.FORTIES_BST_DISCUSSION);
    // this is wonky for sure - discordJS returns a type "GuildChannel" on  
    // lookup so we have to cast to a TextChannel to send any messages, see : 
    // https://stackoverflow.com/questions/53563862/send-message-to-specific-channel-with-typescript/53565548
    if (!((channel): channel is TextChannel => channel?.type === 'text')(channel)) return;

    bstPost.warningMessage = await channel.send(createEmbededFailMessage(bstPost));

    runDeleteCountDown(bstPost);
}

function runDeleteCountDown(bstPost: BstPost) {
    // start a delete timeout for 30 minutes 
    bstPost.setMessageExpiration(1000 * 60 * 30);
    // check message in 10 seconds
    const interval: NodeJS.Timeout = setInterval(() => checkForEdit(bstPost, interval), 1000 * 10);
}

function checkForEdit(bstPost: BstPost, interval: NodeJS.Timeout) {
    if (bstPost.deleted) {
        clearInterval(interval);
        return;
    }
    bstPost.fetch()
        .then(msg => {
            if (msg.editedTimestamp ?? bstPost.createdTimestamp > bstPost.createdTimestamp) {
                clearInterval(interval);
                validateBstMessage(new BstPost(msg, bstPost.warningMessage, bstPost.expiration));
            }
        });
}

function createEmbededFailMessage(post: BstPost): MessageEmbed {
    const embed = {
        "description": `${post.author}
        
        Your post does not meet the requirements for posting in Buy/Sell/Trade.
        
        Please edit your message to correct the following errors **in the next 30 minutes** or your post will be deleted:
        
        ${post.validationMessages.map(x => "• " + x + "\n").join("").toString()}
        
        `,
        "color": 12729122,
        "fields": [
            {
                "name": "Original Mesasge Content",
                "value": `${post.content}`
            }
        ]
    };

    return new MessageEmbed(embed);
}

function validateLocationBlockExistance(post: BstPost): boolean {
    if (post.content.includes('[') && post.content.includes(']')) {
        return true;
    }
    post.addMessage("Post is missing location block or does not use square brackets to wrap the location block (e.g. [US-VA])");
    return false;
}

function validateLocationBlockLength(post: BstPost) {
    const locationBlock = parseLocation(post.content);
    if (locationBlock.length < 2 || locationBlock.length > 10) {
        post.addMessage("The size of the location text is outside of the acceptable bounds, location should be abbreviated and no larger than 10 characters");
    }
}

// For now only allow square brackets :
// we probably want to allow other characters to be surrounding  
// the location string i.e. "()" and "{}"
function parseLocation(msgText: string): string {
    return msgText.slice(msgText.indexOf('[') + 1, msgText.indexOf(']'));
}

