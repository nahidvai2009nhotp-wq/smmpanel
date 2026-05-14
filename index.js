const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const http = require('http');

const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const API_URL = 'https://bdsmmxz.com/api/v2';
const API_KEY = 'YOUR_API_KEY'; // Account page theke key ekhane bosaun

// --- Main Menu (Persistent Keyboard) ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Premium service'],
    ['Price & Info']
]).resize();

// --- Start Command ---
bot.start(async (ctx) => {
    const welcomeText = `🏠 **WELCOME TO RX SMM ZONE** 🏠\n\n🔥 মার্কেটের সবচেয়ে কম দাম\n🌟 সম্পূর্ণ অটোমেটিক সিস্টেম\n⚡ ৩০ মিনিটের মধ্যেই অর্ডার কমপ্লিট`;
    try {
        await ctx.replyWithPhoto('https://i.ibb.co/VWV0YfX/rx-smm.jpg', {
            caption: welcomeText,
            parse_mode: 'Markdown',
            ...mainKeyboard
        });
    } catch (e) {
        await ctx.reply(welcomeText, { parse_mode: 'Markdown', ...mainKeyboard });
    }
});

// --- Order Button (Same to Same UI as Screenshot) ---
bot.hears('Order', (ctx) => {
    ctx.reply('🐢 Select your service.', Markup.inlineKeyboard([
        // Row 1: Blue Buttons
        [
            Markup.button.callback('TikTok Services', 'serv_list'),
            Markup.button.callback('Telegram Services', 'serv_list')
        ],
        // Row 2: Green Buttons
        [
            Markup.button.callback('YouTube Services', 'serv_list'),
            Markup.button.callback('Facebook Services', 'serv_list')
        ],
        // Row 3: Green Button + Empty/Custom Slot
        [
            Markup.button.callback('InstaGram Services', 'serv_list'),
            Markup.button.callback('Premium Services', 'serv_list')
        ],
        // Row 4: Large Red Return Button
        [
            Markup.button.callback('↩️ Return', 'back_home')
        ]
    ]));
});

// --- Balance (API Integration) ---
bot.hears('Balance', async (ctx) => {
    try {
        const res = await axios.post(API_URL, `key=${API_KEY}&action=balance`);
        const data = res.data;
        ctx.reply(`💳 **অ্যাকাউন্ট ব্যালেন্স**\n\n👤 নাম: ${ctx.from.first_name}\n💰 বর্তমান ব্যালেন্স: ${data.balance || '0.00'} ${data.currency || 'USD'}\nTotal Orders: 0\nTotal Spent: 0.00`, 
        Markup.inlineKeyboard([[Markup.button.callback('ডিপোজিট করুন', 'go_depo')]]));
    } catch (err) {
        ctx.reply('❌ API Key invalid or connection error.');
    }
});

// --- Deposit Flow ---
bot.hears('Deposit', (ctx) => {
    ctx.reply('💳 **DEPOSIT AMOUNT**\n\nআপনি কত টাকা ডিপোজিট করতে চান?\nশুধু টাকার পরিমাণটি লিখে পাঠান। 👇');
});

// --- Handling Numbers (Payment Link logic) ---
bot.on('text', (ctx) => {
    const amount = parseInt(ctx.message.text);
    if (!isNaN(amount)) {
        ctx.reply(`✅ **পেমেন্ট লিঙ্ক তৈরি হয়েছে**\n\n👤 নাম: ${ctx.from.first_name}\n💵 পরিমাণ: ${amount}.00৳\n\n👇 পেমেন্ট করতে নিচের বাটনে ক্লিক করুন।`, 
        Markup.inlineKeyboard([
            [Markup.button.url('Bkash/Nogod Pay', 'https://bdsmmxz.com/deposit')],
            [Markup.button.url('Binance Pay', 'https://bdsmmxz.com/deposit')],
            [Markup.button.callback('ডিপোজিট করার নিয়ম', 'how_to')]
        ]));
    }
});

// --- Support ---
bot.hears('Support', (ctx) => {
    ctx.reply(`📍 **RX SMM ZONE SUPPORT**\n\n☎️ ২৪/৭ সাপোর্টের জন্য যোগাযোগ করুন:`,
    Markup.inlineKeyboard([[Markup.button.url('যোগাযোগ করুন', 'https://t.me/BDTROCKY')]]));
});

// --- Callback for Return ---
bot.action('back_home', (ctx) => {
    ctx.deleteMessage();
    ctx.reply('🏠 Main Menu-te firiye ana holo.', mainKeyboard);
});

// --- Render Port Listener ---
http.createServer((req, res) => {
    res.write('Bot is Live!');
    res.end();
}).listen(process.env.PORT || 3000);

bot.launch().then(() => console.log("Bot successfully started with UI Update!"));
