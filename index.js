const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const ADMIN_ID = 7488161246;

// Local storage for services (Bot restart hole eita reset hote pare Render-e)
let customServices = []; 
let adminState = {}; // To track if admin is typing service details

// --- Main Menu ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Premium service'],
    ['Price & Info']
]).resize();

// --- Start ---
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

// --- Admin Panel ---
bot.command('admin', (ctx) => {
    if (ctx.from.id === ADMIN_ID) {
        ctx.reply('🛠 **ADMIN CONTROL PANEL**', 
        Markup.inlineKeyboard([
            [Markup.button.callback('➕ Add New Service', 'admin_add')],
            [Markup.button.callback('🗑 Clear All Services', 'admin_clear')]
        ]));
    } else {
        ctx.reply('❌ Apni admin non!');
    }
});

// --- Order Button (Showing Manually Added Services) ---
bot.hears('Order', (ctx) => {
    if (customServices.length === 0) {
        return ctx.reply('❌ No services available. Please contact admin.');
    }

    const buttons = customServices.map((s, index) => [
        Markup.button.callback(`${s.name} - ${s.price}৳`, `buy_${index}`)
    ]);
    buttons.push([Markup.button.callback('↩️ Return', 'back_home')]);

    ctx.reply('🐢 **Select Your Service:**', Markup.inlineKeyboard(buttons));
});

// --- Admin Actions ---
bot.action('admin_add', (ctx) => {
    adminState[ctx.from.id] = 'awaiting_service';
    ctx.reply('Service-er nam ebong dam eivabe likhun:\n\n`Service Name - Price`\n(Example: TikTok Followers - 50)');
});

bot.action('admin_clear', (ctx) => {
    customServices = [];
    ctx.reply('✅ Shob service muche fela hoyeche.');
});

// --- Handling Text Input (Admin Adding Service) ---
bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    // Admin service add korche kina check
    if (adminState[userId] === 'awaiting_service' && userId === ADMIN_ID) {
        const parts = text.split('-');
        if (parts.length === 2) {
            const name = parts[0].trim();
            const price = parts[1].trim();
            customServices.push({ name, price });
            delete adminState[userId];
            ctx.reply(`✅ Service Added: ${name} (${price}৳)`);
        } else {
            ctx.reply('❌ Format thik nai. Eivabe likhun: Name - Price');
        }
        return;
    }

    // Default Payment Link Logic
    const amount = parseInt(text);
    if (!isNaN(amount)) {
        ctx.reply(`✅ **পেমেন্ট লিঙ্ক তৈরি হয়েছে**\n💵 পরিমাণ: ${amount}.00৳\n\n👇 পেমেন্ট করতে নিচের বাটনে ক্লিক করুন।`, 
        Markup.inlineKeyboard([
            [Markup.button.url('Bkash/Nogod Pay', 'https://bdsmmxz.com/deposit')],
            [Markup.button.url('Binance Pay', 'https://bdsmmxz.com/deposit')]
        ]));
    }
});

bot.action(/buy_(.+)/, (ctx) => {
    const index = ctx.match[1];
    const service = customServices[index];
    if(service) {
        ctx.reply(`✅ Selected: ${service.name}\n💰 Price: ${service.price}৳\n\nএখন আপনার অর্ডারের লিঙ্কটি দিন:`);
    }
});

bot.action('back_home', (ctx) => {
    ctx.deleteMessage();
    ctx.reply('🏠 Main Menu', mainKeyboard);
});

// --- Port for Render ---
http.createServer((req, res) => { res.write('Bot Live'); res.end(); }).listen(process.env.PORT || 3000);

bot.launch();
        
