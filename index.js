const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const ADMIN_ID = 7488161246;

// Local Database (Temporary)
let servicesDB = {
    'Facebook': [],
    'TikTok': [],
    'Telegram': [],
    'YouTube': []
};

let adminState = {}; 

// --- Main Menu ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Premium service'],
    ['Price & Info']
]).resize();

bot.start(async (ctx) => {
    const welcomeMsg = `🏠 **WELCOME TO RX SMM ZONE** 🏠\n\n🔥 মার্কেটের সবচেয়ে কম দাম\n🌟 সম্পূর্ণ অটোমেটিক সিস্টেম`;
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
    if (ctx.from.id !== ADMIN_ID) return ctx.reply('❌ Apni admin non!');
    
    ctx.reply('🛠 **ADMIN CONTROL PANEL**\nService add korar jonno category select korun:', 
    Markup.inlineKeyboard([
        [Markup.button.callback('➕ Facebook', 'add_Facebook'), Markup.button.callback('➕ TikTok', 'add_TikTok')],
        [Markup.button.callback('➕ Telegram', 'add_Telegram'), Markup.button.callback('➕ YouTube', 'add_YouTube')],
        [Markup.button.callback('🗑 Clear All', 'admin_clear')]
    ]));
});

// --- Admin Add Logic ---
bot.action(/add_(.+)/, (ctx) => {
    const category = ctx.match[1];
    adminState[ctx.from.id] = { step: 'adding', category: category };
    ctx.reply(`📝 **${category}**-er jonno service details pathan.\n\nFormat: \`Service Name - Price\`\nExample: \`1k Followers - 120\``);
});

// --- Order Section (Category View) ---
bot.hears('Order', (ctx) => {
    ctx.reply('🐢 **Select Category:**', Markup.inlineKeyboard([
        [Markup.button.callback('Facebook Services', 'view_Facebook'), Markup.button.callback('TikTok Services', 'view_TikTok')],
        [Markup.button.callback('Telegram Services', 'view_Telegram'), Markup.button.callback('YouTube Services', 'view_YouTube')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

// --- View Services based on Category ---
bot.action(/view_(.+)/, (ctx) => {
    const category = ctx.match[1];
    const services = servicesDB[category];

    if (!services || services.length === 0) {
        return ctx.answerCbQuery(`❌ ${category}-e kono service nei!`, { show_alert: true });
    }

    const buttons = services.map((s, index) => [
        Markup.button.callback(`${s.name} - ${s.price}৳`, `buy_${category}_${index}`)
    ]);
    buttons.push([Markup.button.callback('↩️ Back to Categories', 'back_to_order')]);

    ctx.editMessageText(`🔥 **${category} Services:**`, Markup.inlineKeyboard(buttons));
});

// --- Handling Admin Text Input ---
bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    if (adminState[userId] && adminState[userId].step === 'adding' && userId === ADMIN_ID) {
        const parts = text.split('-');
        if (parts.length === 2) {
            const category = adminState[userId].category;
            servicesDB[category].push({ name: parts[0].trim(), price: parts[1].trim() });
            delete adminState[userId];
            ctx.reply(`✅ Added to ${category}: ${parts[0].trim()} (${parts[1].trim()}৳)`);
        } else {
            ctx.reply('❌ Format vul! Likhun: Name - Price');
        }
        return;
    }

    // Default Payment logic
    if (!isNaN(text)) {
        ctx.reply(`✅ **পেমেন্ট লিঙ্ক তৈরি হয়েছে**\n💵 পরিমাণ: ${text}.00৳\n\n👇 পেমেন্ট করতে নিচের বাটনে ক্লিক করুন।`, 
        Markup.inlineKeyboard([[Markup.button.url('Bkash/Nogod Pay', 'https://bdsmmxz.com/deposit')]]));
    }
});

// --- Buy Action ---
bot.action(/buy_(.+)_(.+)/, (ctx) => {
    const category = ctx.match[1];
    const index = ctx.match[2];
    const service = servicesDB[category][index];
    ctx.reply(`✅ Selected: ${service.name} (${category})\n💰 Price: ${service.price}৳\n\nLink pathan:`);
});

bot.action('back_to_order', (ctx) => {
    ctx.editMessageText('🐢 **Select Category:**', Markup.inlineKeyboard([
        [Markup.button.callback('Facebook Services', 'view_Facebook'), Markup.button.callback('TikTok Services', 'view_TikTok')],
        [Markup.button.callback('Telegram Services', 'view_Telegram'), Markup.button.callback('YouTube Services', 'view_YouTube')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

bot.action('back_home', (ctx) => { ctx.deleteMessage(); ctx.reply('🏠 Main Menu', mainKeyboard); });

bot.action('admin_clear', (ctx) => {
    servicesDB = { 'Facebook': [], 'TikTok': [], 'Telegram': [], 'YouTube': [] };
    ctx.reply('✅ All services cleared!');
});

http.createServer((req, res) => { res.write('Bot Live'); res.end(); }).listen(process.env.PORT || 3000);
bot.launch();
