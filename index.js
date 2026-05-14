const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const http = require('http');

const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const API_URL = 'https://bdsmmxz.com/api/v2';
const API_KEY = 'YOUR_API_KEY'; // Account page theke key ekhane bosaun

// --- Main Menu ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Premium service'],
    ['Price & Info']
]).resize();

// --- Start Command (Image error handling shoh) ---
bot.start(async (ctx) => {
    const welcomeText = `🏠 **WELCOME TO RX SMM ZONE** 🏠\n\n🔥 মার্কেটের সবচেয়ে কম দাম\n🌟 সম্পূর্ণ অটোমেটিক সিস্টেম\n⚡ ৩০ মিনিটের মধ্যেই অর্ডার কমপ্লিট`;
    
    try {
        // Image pathate chesta korbe
        await ctx.replyWithPhoto('https://i.ibb.co/VWV0YfX/rx-smm.jpg', {
            caption: welcomeText,
            parse_mode: 'Markdown',
            ...mainKeyboard
        });
    } catch (error) {
        // Image load na hole shudhu text pathabe jate crash na hoy
        console.log("Image load failed, sending text only.");
        await ctx.reply(welcomeText, { parse_mode: 'Markdown', ...mainKeyboard });
    }
});

// --- Balance (Corrected API Call) ---
bot.hears('Balance', async (ctx) => {
    try {
        const res = await axios.post(API_URL, `key=${API_KEY}&action=balance`);
        const data = res.data;
        ctx.reply(`💳 **অ্যাকাউন্ট ব্যালেন্স**\n\n👤 নাম: ${ctx.from.first_name}\n💰 বর্তমান ব্যালেন্স: ${data.balance || '0.00'} ${data.currency || 'USD'}`);
    } catch (err) {
        ctx.reply('❌ API Connection Failed!');
    }
});

// --- Order ---
bot.hears('Order', (ctx) => {
    ctx.reply('🐢 Select your service.', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'serv'), Markup.button.callback('Telegram Services', 'serv')],
        [Markup.button.callback('YouTube Services', 'serv'), Markup.button.callback('Facebook Services', 'serv')]
    ]));
});

// --- Deposit Logic ---
bot.hears('Deposit', (ctx) => {
    ctx.reply('💳 **DEPOSIT AMOUNT**\n\nআপনি কত টাকা ডিপোজিট করতে চান?\nশুধু টাকার পরিমাণটি লিখে পাঠান। 👇');
});

bot.on('text', (ctx) => {
    const amount = parseInt(ctx.message.text);
    if (!isNaN(amount)) {
        ctx.reply(`✅ **পেমেন্ট লিঙ্ক তৈরি হয়েছে**\n\n💵 পরিমাণ: ${amount}.00৳\n\n👇 পেমেন্ট করতে নিচের বাটনে ক্লিক করুন।`, 
        Markup.inlineKeyboard([
            [Markup.button.url('Bkash/Nogod Pay', 'https://bdsmmxz.com/deposit')],
            [Markup.button.url('Binance Pay', 'https://bdsmmxz.com/deposit')]
        ]));
    }
});

// --- Render Port Listener (Important for Render) ---
http.createServer((req, res) => {
    res.write('Bot is Live!');
    res.end();
}).listen(process.env.PORT || 3000);

bot.launch().then(() => console.log("Bot successfully started!"));
