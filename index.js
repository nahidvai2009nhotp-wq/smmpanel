const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const http = require('http');

// --- CONFIGURATION ---
const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const API_URL = 'https://bdsmmxz.com/api/v2';
const API_KEY = 'YOUR_API_KEY'; // Account page theke key ekhane bosaun

// --- MAIN KEYBOARD ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Premium service'],
    ['Price & Info']
]).resize();

// --- 1. START COMMAND FIX ---
bot.start(async (ctx) => {
    const welcomeMsg = `🏠 **WELCOME TO RX SMM ZONE** 🏠\n\n🔥 মার্কেটের সবচেয়ে কম দাম\n🌟 সম্পূর্ণ অটোমেটিক সিস্টেম\n⚡ ৩০ মিনিটের মধ্যেই অর্ডার কমপ্লিট`;
    
    try {
        // Image link jodi thik thake
        await ctx.replyWithPhoto('https://i.ibb.co/VWV0YfX/rx-smm.jpg', {
            caption: welcomeMsg,
            parse_mode: 'Markdown',
            ...mainKeyboard
        });
    } catch (err) {
        // Image link-e problem hole shudhu text reply dibe (Bot crash hobe na)
        console.log("Image load fail, sending text only.");
        await ctx.reply(welcomeMsg, { parse_mode: 'Markdown', ...mainKeyboard });
    }
});

// --- 2. ORDER CLICK LOGIC (Direct Service List) ---
bot.hears('Order', async (ctx) => {
    try {
        const res = await axios.post(API_URL, `key=${API_KEY}&action=services`);
        const services = res.data;

        if (Array.isArray(services)) {
            // Prothom 10 ti service dekhabe
            const serviceButtons = services.slice(0, 10).map(s => [
                Markup.button.callback(`[ID: ${s.service}] ${s.name} - ${s.rate}৳`, `buy_${s.service}`)
            ]);
            serviceButtons.push([Markup.button.callback('↩️ Return', 'back_home')]);

            await ctx.reply('🐢 **Select Your Service:**', Markup.inlineKeyboard(serviceButtons));
        } else {
            ctx.reply('❌ No services found.');
        }
    } catch (err) {
        ctx.reply('❌ API Connection Error!');
    }
});

// --- 3. BALANCE CHECK ---
bot.hears('Balance', async (ctx) => {
    try {
        const res = await axios.post(API_URL, `key=${API_KEY}&action=balance`);
        ctx.reply(`💳 **ব্যালেন্স:** ${res.data.balance || '0.00'} ${res.data.currency || 'USD'}`);
    } catch (err) {
        ctx.reply('❌ API error.');
    }
});

// --- 4. RENDER PORT BINDING (MANDATORY) ---
http.createServer((req, res) => {
    res.write('Bot is running safely!');
    res.end();
}).listen(process.env.PORT || 3000);

// --- ERROR CATCHER ---
bot.catch((err) => {
    console.log('Bot Error:', err);
});

bot.launch().then(() => console.log("Bot Live!"));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
    
