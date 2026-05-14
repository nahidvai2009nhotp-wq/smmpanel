const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// Bot Token
const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const API_URL = 'https://bdsmmxz.com/api/v2';
const API_KEY = 'YOUR_API_KEY'; // 👈 Ekhane apnar key boshan

// --- Main Menu ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Premium service'],
    ['Price & Info']
]).resize();

// --- Start ---
bot.start((ctx) => {
    try {
        ctx.replyWithPhoto(
            'https://i.ibb.co/VWV0YfX/rx-smm.jpg',
            {
                caption: `🏠 **WELCOME TO RX SMM ZONE** 🏠\n\n🔥 মার্কেটের সবচেয়ে কম দাম\n🌟 সম্পূর্ণ অটোমেটিক সিস্টেম\n⚡ ৩০ মিনিটের মধ্যেই অর্ডার কমপ্লিট`,
                ...mainKeyboard
            }
        );
    } catch (e) {
        console.error(e);
    }
});

// --- Balance ---
bot.hears('Balance', async (ctx) => {
    try {
        const res = await axios.get(API_URL, {
            params: { key: API_KEY, action: 'balance' }
        });
        const data = res.data;
        ctx.reply(`💳 **ব্যালেন্স:** ${data.balance || '0.00'} ${data.currency || 'BDT'}`);
    } catch (err) {
        ctx.reply('❌ API Connection Failed!');
    }
});

// --- Error Handling (Main Reason for Exit) ---
bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

// --- Render Port Binding (Important) ---
const http = require('http');
http.createServer((req, res) => {
    res.write('Bot is running!');
    res.end();
}).listen(process.env.PORT || 3000);

bot.launch().then(() => console.log("Bot Live on Render!"));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
