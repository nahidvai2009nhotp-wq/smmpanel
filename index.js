const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const http = require('http');

const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const API_URL = 'https://bdsmmxz.com/api/v2';
const API_KEY = 'YOUR_API_KEY'; // Ekhane Account page theke original key boshan

// --- Main Menu ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Premium service'],
    ['Price & Info']
]).resize();

// --- Start ---
bot.start((ctx) => {
    ctx.replyWithPhoto('https://i.ibb.co/VWV0YfX/rx-smm.jpg', {
        caption: `🏠 **WELCOME TO RX SMM ZONE** 🏠\n\n🔥 মার্কেটের সবচেয়ে কম দাম\n⚡ ৩০ মিনিটের মধ্যেই অর্ডার কমপ্লিট`,
        ...mainKeyboard
    });
});

// --- Order Click korle Service Dekhabe (API Call) ---
bot.hears('Order', async (ctx) => {
    try {
        await ctx.reply('🔄 Loading Services from Panel...');
        
        // API theke service list ana hocche
        const res = await axios.post(API_URL, `key=${API_KEY}&action=services`);
        const services = res.data;

        if (Array.isArray(services)) {
            // Prothom 10-15 ta service dekhano hocche (Telegram limit thake)
            const serviceButtons = services.slice(0, 15).map(s => [
                Markup.button.callback(`[${s.service}] ${s.name} - ${s.rate}৳`, `buy_${s.service}`)
            ]);

            serviceButtons.push([Markup.button.callback('↩️ Return', 'back_home')]);

            ctx.reply('🐢 **Select Your Service:**', Markup.inlineKeyboard(serviceButtons));
        } else {
            ctx.reply('❌ No services found in panel.');
        }
    } catch (err) {
        console.error(err);
        ctx.reply('❌ API theke service load korte somossa hoyeche.');
    }
});

// --- Balance Section ---
bot.hears('Balance', async (ctx) => {
    try {
        const res = await axios.post(API_URL, `key=${API_KEY}&action=balance`);
        ctx.reply(`💳 **অ্যাকাউন্ট ব্যালেন্স**\n\n💰 বর্তমান ব্যালেন্স: ${res.data.balance || '0.00'} ${res.data.currency || 'USD'}`);
    } catch (err) {
        ctx.reply('❌ API Error!');
    }
});

// --- Deposit Section ---
bot.hears('Deposit', (ctx) => {
    ctx.reply('💳 আপনি কত টাকা ডিপোজিট করতে চান? শুধু টাকার পরিমাণটি লিখে পাঠান।');
});

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

// --- Callback handling ---
bot.action(/buy_(.+)/, (ctx) => {
    const sId = ctx.match[1];
    ctx.reply(`✅ Selected Service ID: ${sId}\n\nEkhon apnar order link-ti pathan:`);
});

bot.action('back_home', (ctx) => {
    ctx.deleteMessage();
    ctx.reply('🏠 Main Menu', mainKeyboard);
});

// --- Render Port ---
http.createServer((req, res) => { res.write('Bot Live'); res.end(); }).listen(process.env.PORT || 3000);

bot.launch().then(() => console.log("Bot started with dynamic service list!"));
