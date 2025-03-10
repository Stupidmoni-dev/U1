const TelegramBot = require('node-telegram-bot-api');
const { Connection, PublicKey } = require('@solana/web3.js');
const { Metadata } = require('@metaplex-foundation/mpl-token-metadata');

// Telegram Bot Token (Replace with your actual bot token)
const BOT_TOKEN = "7420937580:AAFd9Y1fkZZwt7AwnngaLAvl3X91r_G8SNg";

// Solana RPC Endpoint (Use mainnet or devnet as needed)
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC);

// Initialize Telegram Bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🤖 Solana Anti-Rug Bot is running...");

// Function to fetch token metadata from the blockchain
async function getTokenMetadata(mintAddress) {
    try {
        const mintPublicKey = new PublicKey(mintAddress);
        const metadataPDA = await Metadata.getPDA(mintPublicKey);
        const metadataAccount = await Metadata.load(connection, metadataPDA);
        const { data } = metadataAccount.data;

        return {
            name: data.name.trim(),
            symbol: data.symbol.trim(),
            uri: data.uri,
            sellerFeeBasisPoints: data.sellerFeeBasisPoints,
        };
    } catch (error) {
        console.error(`Error fetching metadata: ${error.message}`);
        return null;
    }
}

// Telegram bot command to check a token
bot.onText(/\/check (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const tokenMint = match[1].trim();

    try {
        // Validate if the provided mint address is a valid Solana address
        new PublicKey(tokenMint);
    } catch (error) {
        bot.sendMessage(chatId, '❌ Invalid token mint address.');
        return;
    }

    bot.sendMessage(chatId, `🔍 Checking token: ${tokenMint}...`);

    const metadata = await getTokenMetadata(tokenMint);
    if (!metadata) {
        bot.sendMessage(chatId, '❌ Token metadata not found or inaccessible.');
        return;
    }

    let message = `✅ **Token Analysis**\n`;
    message += `🔹 **Name**: ${metadata.name}\n`;
    message += `🔹 **Symbol**: ${metadata.symbol}\n`;
    message += `🔹 **URI**: ${metadata.uri}\n`;
    message += `🔹 **Seller Fee Basis Points**: ${metadata.sellerFeeBasisPoints / 100}%\n`;

    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});
