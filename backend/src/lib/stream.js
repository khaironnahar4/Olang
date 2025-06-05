import {StreamChat} from 'stream-chat';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Stream API key and secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData)=> {
    try {
        await streamClient.upsertUser(userData)
        return userData;
    } catch (error) {
        console.log("Error upserting user in Stream:", error);
    }
}

export const generateStreamToken = (userId) => {
    try {
        // ensure userId is a string
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.log("Error generating Stream token:", error);
    }
}