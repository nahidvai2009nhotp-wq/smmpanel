const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// Bot Configuration
const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const API_URL = 'https://bdsmmxz.com/api/v2';
const API_KEY = 'YOUR_API_KEY'; // 👈 Oboshshoi Account page theke key niye ekhane bosaun

// User State (Temporary storage for order flow)
const userSession = {};

// --- Main Menu Keyboard ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Premium service'],
    ['Price & Info']
]).resize();

// --- Start Command ---
bot.start((ctx) => {
    ctx.replyWithPhoto(
        'https://i.ibb.co/VWV0YfX/rx-smm.jpg',
        {
            caption: `🏠 **WELCOME TO RX SMM ZONE** 🏠\n\n🔥 মার্কেটের সবচেয়ে কম দাম\n🌟 সম্পূর্ণ অটোমেটিক সিস্টেম\n⚡ ৩০ মিনিটের মধ্যেই অর্ডার কমপ্লিট`,
            ...mainKeyboard
        }
    );
});

// --- Balance (API: action: balance) ---
bot.hears('Balance', async (ctx) => {
    try {
        const res = await axios.post(API_URL, `key=${API_KEY}&action=balance`);
        const data = res.data;
        
        if (data.balance) {
            ctx.reply(`💳 **অ্যাকাউন্ট ব্যালেন্স**\n\n👤 নাম: ${ctx.from.first_name}\n💰 বর্তমান ব্যালেন্স: ${data.balance} ${data.currency}\n\n[ডিপোজিট করুন]`, 
            Markup.inlineKeyboard([[Markup.button.callback('ডিপোজিট করুন', 'go_depo')]]));
        } else {
            ctx.reply('❌ API Key invalid ba problem hosse.');
        }
    } catch (err) {
        ctx.reply('❌ Server error! API connect hoy ni.');
    }
});

// --- Order & Service List (API: action: services) ---
bot.hears('Order', async (ctx) => {
    ctx.reply('🐢 Select your service.', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'serv_list'), Markup.button.callback('Telegram Services', 'serv_list')],
        [Markup.button.callback('YouTube Services', 'serv_list'), Markup.button.callback('Facebook Services', 'serv_list')],
        [Markup.button.callback('Instagram Services', 'serv_list')]
    ]));
});

// Service list callback
bot.action('serv_list', async (ctx) => {
    try {
        const res = await axios.post(API_URL, `key=${API_KEY}&action=services`);
        const services = res.data.slice(0, 5); // Prothom 5 ta service dekhabe
        
        let buttons = services.map(s => [Markup.button.callback(`${s.name} - ${s.rate}৳`, `buy_${s.service}`)]);
        buttons.push([Markup.button.callback('↩️ Return', 'back_home')]);
        
        ctx.editMessageText('✅ Select a specific service:', Markup.inlineKeyboard(buttons));
    } catch (err) {
        ctx.reply('❌ Services load hote somossa hosse.');
    }
});

// --- Deposit Section ---
bot.hears('Deposit', (ctx) => {
    ctx.reply('💳 **DEPOSIT AMOUNT**\n\nআপনি কত টাকা ডিপোজিট করতে চান?\nশুধু টাকার পরিমাণটি লিখে পাঠান। 👇');
});

// --- Handling Text Input (Amount or Order Details) ---
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const userId = ctx.from.id;

    // Amount input logic
    if (!isNaN(text)) {
        return ctx.reply(`✅ **পেমেন্ট লিঙ্ক তৈরি হয়েছে**\n\n👤 নাম: ${ctx.from.first_name}\n💵 পরিমাণ: ${text}.00৳\n\n👇 পেমেন্ট করতে নিচের বাটনে ক্লিক করুন।`, 
        Markup.inlineKeyboard([
            [Markup.button.url('Bkash/Nogod Pay', 'https://bdsmmxz.com/deposit')],
            [Markup.button.url('Binance Pay', 'https://bdsmmxz.com/deposit')]
        ]));
    }

    // Support logic
    if (text === 'Support') {
        return ctx.reply(`📍 **RX SMM ZONE SUPPORT**\n\n☎️ ২৪/৭ সাপোর্টের জন্য যোগাযোগ করুন:`,
        Markup.inlineKeyboard([[Markup.button.url('যোগাযোগ করুন', 'https://t.me/BDTROCKY')]]));
    }
});

// --- New Order Implementation (API: action: add) ---
bot.action(/buy_(.+)/, (ctx) => {
    const serviceId = ctx.match[1];
    ctx.reply(`Selected Service ID: ${serviceId}\nEkhon apnar Link pathan (e.g. Profile or Post link):`);
    // Note: Actual 'add' order logic requires link and quantity step-by-step
});

bot.launch().then(() => console.log("Bot running with bdsmmxz API!"))
