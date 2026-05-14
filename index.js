const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const http = require('http');

// --- CONFIGURATION ---
const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const API_URL = 'https://bdsmmxz.com/api/v2';
const API_KEY = 'YOUR_API_KEY'; // 👈 Account page theke original key niye ekhane bosaun
const ADMIN_ID = 7488161246;

// --- KEYBOARDS ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Premium service'],
    ['Price & Info']
]).resize();

// --- START ---
bot.start(async (ctx) => {
    const welcomeMsg = `🏠 **WELCOME TO RX SMM ZONE** 🏠\n\n🔥 মার্কেটের সবচেয়ে কম দাম\n⚡ ৩০ মিনিটের মধ্যেই অর্ডার কমপ্লিট`;
    try {
        await ctx.replyWithPhoto('https://i.ibb.co/VWV0YfX/rx-smm.jpg', {
            caption: welcomeMsg, parse_mode: 'Markdown', ...mainKeyboard
        });
    } catch (e) {
        await ctx.reply(welcomeMsg, { parse_mode: 'Markdown', ...mainKeyboard });
    }
});

// --- ADMIN ---
bot.command('admin', (ctx) => {
    if (ctx.from.id === ADMIN_ID) {
        ctx.reply('🛠 **ADMIN PANEL**', Markup.inlineKeyboard([
            [Markup.button.callback('📊 Check API Balance', 'admin_balance')],
            [Markup.button.callback('📢 Broadcast', 'admin_bc')]
        ]));
    }
});

// --- ORDER BUTTON (Using API: action: services) ---
bot.hears('Order', async (ctx) => {
    try {
        const res = await axios.post(API_URL, `key=${API_KEY}&action=services`);
        const services = res.data;

        if (Array.isArray(services)) {
            // Prothom 10 ta service column wise sajano
            const buttons = services.slice(0, 10).map(s => [
                Markup.button.callback(`[ID:${s.service}] ${s.name} - ${s.rate}৳`, `buy_${s.service}`)
            ]);
            buttons.push([Markup.button.callback('↩️ Return Main Menu', 'back_home')]);
            ctx.reply('🐢 **Select Your Service:**', Markup.inlineKeyboard(buttons));
        } else {
            ctx.reply('❌ No services found in panel.');
        }
    } catch (err) {
        ctx.reply('❌ API Connection Error! Key thik ache ki?');
    }
});

// --- USER BALANCE (Using API: action: balance) ---
bot.hears('Balance', async (ctx) => {
    try {
        const res = await axios.post(API_URL, `key=${API_KEY}&action=balance`);
        const data = res.data;
        ctx.reply(`💳 **অ্যাকাউন্ট ব্যালেন্স**\n\n💰 বর্তমান ব্যালেন্স: ${data.balance || '0.00'} ${data.currency || 'USD'}\n👤 নাম: ${ctx.from.first_name}`);
    } catch (err) {
        ctx.reply('❌ API Error! Balance load hoy ni.');
    }
});

// --- NEW ORDER (Using API: action: add) ---
bot.action(/buy_(.+)/, (ctx) => {
    const serviceId = ctx.match[1];
    ctx.reply(`✅ Selected Service ID: ${serviceId}\n\nএখন আপনার অর্ডারের লিঙ্কটি দিন (Link Pathan):`);
    // Note: User link pathale action: 'add' call korte hobe logic onujayi
});

// --- DEPOSIT ---
bot.hears('Deposit', (ctx) => {
    ctx.reply('💳 কত টাকা ডিপোজিট করতে চান? শুধু টাকার পরিমাণটি লিখে পাঠান।');
});

// --- TEXT HANDLING ---
bot.on('text', (ctx) => {
    const amount = parseInt(ctx.message.text);
    if (!isNaN(amount)) {
        ctx.reply(`✅ **পেমেন্ট লিঙ্ক তৈরি হয়েছে**\n💵 পরিমাণ: ${amount}.00৳\n\n👇 পেমেন্ট করতে নিচের বাটনে ক্লিক করুন।`, 
        Markup.inlineKeyboard([
            [Markup.button.url('Bkash/Nogod Pay', 'https://bdsmmxz.com/deposit')],
            [Markup.button.url('Binance Pay', 'https://bdsmmxz.com/deposit')]
        ]));
    }
});

bot.action('back_home', (ctx) => {
    ctx.deleteMessage();
    ctx.reply('🏠 Main Menu', mainKeyboard);
});

// --- RENDER PORT LISTENER ---
http.createServer((req, res) => { res.write('Bot Live'); res.end(); }).listen(process.env.PORT || 3000);

bot.launch().then(() => console.log("Bot with bdsmmxz API Started!"));
