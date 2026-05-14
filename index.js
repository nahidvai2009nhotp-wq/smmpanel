const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const http = require('http');

// --- CONFIGURATION ---
const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const API_URL = 'https://bdsmmxz.com/api/v2';
const API_KEY = 'YOUR_ACTUAL_API_KEY_HERE'; // 👈 bdsmmxz.com theke API Key niye ekhane bosaun
const ADMIN_ID = 7488161246; // ✅ Apnar Admin ID

// --- KEYBOARDS ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Premium service'],
    ['Price & Info']
]).resize();

// --- START COMMAND ---
bot.start(async (ctx) => {
    const welcomeMsg = `🏠 **WELCOME TO RX SMM ZONE** 🏠\n\n🔥 মার্কেটের সবচেয়ে কম দাম\n🌟 সম্পূর্ণ অটোমেটিক সিস্টেম\n⚡ ৩০ মিনিটের মধ্যেই অর্ডার কমপ্লিট`;
    try {
        await ctx.replyWithPhoto('https://i.ibb.co/VWV0YfX/rx-smm.jpg', {
            caption: welcomeMsg, parse_mode: 'Markdown', ...mainKeyboard
        });
    } catch (e) {
        await ctx.reply(welcomeMsg, { parse_mode: 'Markdown', ...mainKeyboard });
    }
});

// --- ADMIN PANEL (/admin) ---
bot.command('admin', (ctx) => {
    if (ctx.from.id === ADMIN_ID) {
        ctx.reply('🛠 **ADMIN CONTROL PANEL**\n\nWelcome Boss! Ekhan theke bot control korun.', 
        Markup.inlineKeyboard([
            [Markup.button.callback('📊 API Balance', 'admin_balance')],
            [Markup.button.callback('📢 Broadcast', 'admin_bc')],
            [Markup.button.callback('🔄 Refresh Services', 'admin_update')]
        ]));
    } else {
        ctx.reply('❌ Error: Apni admin non!');
    }
});

// --- ORDER BUTTON (DYNAMIC SERVICE LIST) ---
bot.hears('Order', async (ctx) => {
    try {
        const res = await axios.post(API_URL, `key=${API_KEY}&action=services`);
        const services = res.data;

        if (Array.isArray(services)) {
            // Prothom 12 ta service button akare sajano
            const serviceButtons = [];
            const limitedServices = services.slice(0, 12);
            
            for (let i = 0; i < limitedServices.length; i += 2) {
                const row = [
                    Markup.button.callback(`${limitedServices[i].name.substring(0,15)}...`, `buy_${limitedServices[i].service}`)
                ];
                if (limitedServices[i+1]) {
                    row.push(Markup.button.callback(`${limitedServices[i+1].name.substring(0,15)}...`, `buy_${limitedServices[i+1].service}`));
                }
                serviceButtons.push(row);
            }

            serviceButtons.push([Markup.button.callback('↩️ Return Main Menu', 'back_home')]);

            ctx.reply('🐢 **Select Your Service:**', Markup.inlineKeyboard(serviceButtons));
        } else {
            ctx.reply('❌ No services found in panel API.');
        }
    } catch (err) {
        ctx.reply('❌ API theke service load hote somossa hoyeche. Key check korun.');
    }
});

// --- BALANCE ---
bot.hears('Balance', async (ctx) => {
    try {
        const res = await axios.post(API_URL, `key=${API_KEY}&action=balance`);
        ctx.reply(`💳 **অ্যাকাউন্ট ব্যালেন্স**\n\n💰 বর্তমান ব্যালেন্স: ${res.data.balance || '0.00'} ${res.data.currency || 'USD'}\n👤 ইউজার: ${ctx.from.first_name}`);
    } catch (err) {
        ctx.reply('❌ API Error! Balance load hoy ni.');
    }
});

// --- DEPOSIT ---
bot.hears('Deposit', (ctx) => {
    ctx.reply('💳 আপনি কত টাকা ডিপোজিট করতে চান?\nশুধু টাকার পরিমাণটি লিখে পাঠান। 👇');
});

// --- TEXT HANDLING (Payment Links) ---
bot.on('text', (ctx) => {
    const text = ctx.message.text;
    if (!isNaN(text)) {
        ctx.reply(`✅ **পেমেন্ট লিঙ্ক তৈরি হয়েছে**\n💵 পরিমাণ: ${text}.00৳\n\n👇 পেমেন্ট করতে নিচের বাটনে ক্লিক করুন।`, 
        Markup.inlineKeyboard([
            [Markup.button.url('Bkash/Nogod Pay', 'https://bdsmmxz.com/deposit')],
            [Markup.button.url('Binance Pay', 'https://bdsmmxz.com/deposit')]
        ]));
    }
});

// --- CALLBACK QUERIES ---
bot.action(/buy_(.+)/, (ctx) => {
    const sId = ctx.match[1];
    ctx.reply(`✅ Selected Service ID: ${sId}\n\nএখন আপনার অর্ডারের লিঙ্কটি দিন (Link Pathan):`);
});

bot.action('back_home', (ctx) => {
    ctx.deleteMessage();
    ctx.reply('🏠 Main Menu', mainKeyboard);
});

bot.action('admin_balance', async (ctx) => {
    try {
        const res = await axios.post(API_URL, `key=${API_KEY}&action=balance`);
        ctx.answerCbQuery(`API Balance: ${res.data.balance}`, { show_alert: true });
    } catch (e) {
        ctx.answerCbQuery('API Error!');
    }
});

// --- RENDER PORT LISTENER (MANDATORY) ---
http.createServer((req, res) => {
    res.write('Bot is running safely!');
    res.end();
}).listen(process.env.PORT || 3000);

// --- ERROR CATCHER ---
bot.catch((err) => {
    console.log('Bot Error:', err);
});

bot.launch().then(() => console.log("Bot Live for Admin 7488161246"));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
