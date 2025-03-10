import telebot
from solana.rpc.api import Client
from solders.pubkey import Pubkey

# ✅ Telegram Bot Token (Replace with your actual bot token)
BOT_TOKEN = "7420937580:AAFd9Y1fkZZwt7AwnngaLAvl3X91r_G8SNg"

# ✅ Solana RPC Endpoint
SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com"
client = Client(SOLANA_RPC_URL)

# ✅ Initialize Telegram Bot
bot = telebot.TeleBot(BOT_TOKEN)

print("🤖 Solana Anti-Rug Bot is running...")


# ✅ Function to fetch token metadata
def get_token_metadata(mint_address):
    try:
        mint_pubkey = Pubkey.from_string(mint_address)

        # Fetch token supply info
        supply_info = client.get_token_supply(mint_pubkey)
        if not supply_info["result"]:
            return None

        return {
            "supply": int(supply_info["result"]["value"]["amount"]),
            "decimals": int(supply_info["result"]["value"]["decimals"]),
        }
    except Exception as e:
        print(f"⚠️ Error fetching metadata: {e}")
        return None


# ✅ Telegram bot command to check a token
@bot.message_handler(commands=['check'])
def check_token(message):
    chat_id = message.chat.id
    try:
        token_mint = message.text.split(" ")[1].strip()
        token_metadata = get_token_metadata(token_mint)

        if not token_metadata:
            bot.send_message(chat_id, "❌ Token metadata not found or inaccessible.")
            return

        supply = token_metadata["supply"] / (10 ** token_metadata["decimals"])
        msg = f"✅ **Token Analysis**\n"
        msg += f"🔹 **Total Supply**: {supply:.2f}\n"
        bot.send_message(chat_id, msg, parse_mode="Markdown")

    except IndexError:
        bot.send_message(chat_id, "❌ Please provide a valid token mint address.")
    except Exception as e:
        bot.send_message(chat_id, f"❌ Error: {e}")


# ✅ Start polling
bot.polling()
