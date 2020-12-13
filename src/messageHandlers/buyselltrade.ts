import { Message, Client, User, TextChannel, MessageEmbed } from "discord.js";
import config from '../config';

class BstPost {
    user: User;
    message: Message;
    messageText : string;
    validationMessages: string[];

    constructor(msg: Message) {
        this.user = msg.author;
        this.message = msg;
        this.messageText = msg.content;
        this.validationMessages = [];
    }
    addMessage(errText : string){
        this.validationMessages.push(errText);
    }
}

export default async function handleBuySellTradeMessage(
    msg: Message,
    client: Client
): Promise<void> {
    if (msg.channel.id == config.FORTIES_BST) {
        let currPost = new BstPost(msg);
        // First we need to validate the message itself is fomatted properly 
        if (validateLocationBlockExistance(currPost))
        {
            // add any validations for the location block here 
            validateLocationBlockLength(currPost);
        }
        // add any additional validations here 
        if (currPost.validationMessages.length)
        {
            handleFailedBstValidation(currPost);
        }
    }
}

function handleFailedBstValidation(bstPost : BstPost) {
    const channel = bstPost.message.guild?.channels.cache.get(config.FORTIES_BST_DISCUSSION);
    // this is wonky for sure - discordJS returns a type "GuildChannel" on  
    // lookup so we have to cast to a TextChannel to send any messages, see : 
    // https://stackoverflow.com/questions/53563862/send-message-to-specific-channel-with-typescript/53565548
    if (!((channel): channel is TextChannel => channel?.type === 'text')(channel)) return;
    
    const message = channel.send(createEmbededFailMessage(bstPost));
    // delete post from bst (only do this if the channel post was successful)
    
    bstPost.message.delete();
}

function createEmbededFailMessage(post : BstPost) : MessageEmbed {
    const embed = {
        "description": `<@${post.user}>
        
        Your post does not meet the requirements for posting in Buy/Sell/Trade.
        
        Please correct the following errors and repost your message:
        
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

function validateLocationBlockExistance(post : BstPost) : boolean{
    if (post.messageText.includes('[') && post.messageText.includes(']')){
        return true;
        }
    post.addMessage("The size of the location text is outside of the acceptable bounds, location should be abbreviated and no larger than 10 characters"); 
    return false;
}

function validateLocationBlockLength(post : BstPost){
    const locationBlock = parseLocation(post.messageText);
    if (locationBlock.length > 1 && locationBlock.length < 11)
    {
        post.addMessage("The size of the location text is outside of the acceptable bounds, location should be abbreviated and no larger than 10 characters");
    }
}

// todo: we probably want to allow other characters to be surrounding  
// the location string i.e. "()" and "{}"
function parseLocation(msgText: string) : string{
    return msgText.slice(msgText.indexOf('[')+1, msgText.indexOf(']'));
}

