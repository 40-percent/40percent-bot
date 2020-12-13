import { Message, Client, User, TextChannel, MessageEmbed } from "discord.js";
import { clearTimeout } from "timers";
import config from '../config';

class BstPost {
    user: User;
    message: Message;
    messageText: string;
    validationMessages: string[];
    // only set when validation fails 
    warningMessage?: Message;
    expiration?: NodeJS.Timeout;

    constructor(msg: Message, warningMsg?: Message, expiration?: NodeJS.Timeout) {
        this.user = msg.author;
        this.message = msg;
        this.messageText = msg.content;
        this.validationMessages = [];
        this.warningMessage = warningMsg;
        this.expiration = expiration;
    }
    addMessage(errText: string) {
        this.validationMessages.push(errText);
    }
    setMessageExpiration(timeInMs: number) {
        this.expiration = setTimeout(() => this.message.delete(), timeInMs);
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
    // if this isn't a messages first time through the system, clear the delete timer
    bstPost.clearMessageExpiration();
}

async function handleFailedBstValidation(bstPost: BstPost) {
    const channel = bstPost.message.guild?.channels.cache.get(config.FORTIES_BST_DISCUSSION);
    // this is wonky for sure - discordJS returns a type "GuildChannel" on  
    // lookup so we have to cast to a TextChannel to send any messages, see : 
    // https://stackoverflow.com/questions/53563862/send-message-to-specific-channel-with-typescript/53565548
    if (!((channel): channel is TextChannel => channel?.type === 'text')(channel)) return;

    const warningMsg = await channel.send(createEmbededFailMessage(bstPost));

    await runDeleteCountDown(bstPost, warningMsg);
}

async function runDeleteCountDown(bstPost: BstPost, warningMessage: Message) {
    // start a delete timeout for 30 minutes 
    bstPost.setMessageExpiration(1000 * 60 * 30);
    // check message every 10 seconds
    setInterval(() => checkForEdit(bstPost, warningMessage), 1000 * 10);
}

function checkForEdit(bstPost: BstPost, warningMessage: Message) {
    if (bstPost.message.deleted) return;

    const originalStamp = bstPost.message.createdTimestamp;
    
    bstPost.message.fetch().then(msg => (msg.editedTimestamp ?? originalStamp > originalStamp) ? validateBstMessage(new BstPost(msg, warningMessage, bstPost.expiration)) : null);
    // todo: update the warning message 
}

function createEmbededFailMessage(post: BstPost): MessageEmbed {
    const embed = {
        "description": `<@${post.user}>
        
        Your post does not meet the requirements for posting in Buy/Sell/Trade.
        
        Please edit your message to correct the following errors:
        
        ${post.validationMessages.map(x => "• " + x + "\n").toString()}
        
        `,
        "color": 12729122,
        "fields": [
            {
                "name": "Original Mesasge Content",
                "value": `${post.messageText}`
            }
        ]
    };

    return new MessageEmbed(embed);
}

function validateLocationBlockExistance(post: BstPost): boolean {
    if (post.messageText.includes('[') && post.messageText.includes(']')) {
        return true;
    }
    post.addMessage("The size of the location text is outside of the acceptable bounds, location should be abbreviated and no larger than 10 characters");
    return false;
}

function validateLocationBlockLength(post: BstPost) {
    const locationBlock = parseLocation(post.messageText);
    if (locationBlock.length < 2 && locationBlock.length > 10) {
        post.addMessage("The size of the location text is outside of the acceptable bounds, location should be abbreviated and no larger than 10 characters");
    }
}

// todo: we probably want to allow other characters to be surrounding  
// the location string i.e. "()" and "{}"
function parseLocation(msgText: string): string {
    return msgText.slice(msgText.indexOf('[') + 1, msgText.indexOf(']'));
}

