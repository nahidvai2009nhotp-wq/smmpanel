const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const ADMIN_ID = 7488161246;

// Database Logic
let servicesDB = { 'Facebook': [], 'TikTok': [], 'Telegram': [], 'YouTube': [], 'Instagram': [] };
let userStats = {}; // To store user specific balance/orders
let adminState = {};

const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Premium service'],
    ['Price & Info']
]).resize();

// --- START ---
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

// --- BALANCE UI (Customized as per your image) ---
bot.hears('Balance', (ctx) => {
    const userId = ctx.from.id;
    const name = ctx.from.first_name || "User";
    
    // Initialize stats if not exists
    if (!userStats[userId]) {
        userStats[userId] = { balance: 0.00, orders: 0, spent: 0.00 };
    }

    const stats = userStats[userId];
    
    const balanceMsg = `
💳 ▬▬▬▬▬▬▬▬▬▬
     **অ্যাকাউন্ট ব্যালেন্স**
▬▬▬▬▬▬▬▬▬▬▬

👤 **নাম :** ${name}
💰 **বর্তমান ব্যালেন্স :** ${stats.balance.toFixed(2)} টাকা
📦 **Total Orders :** ${stats.orders}
💵 **Total Spent :** ${stats.spent.toFixed(2)} টাকা

▬▬▬▬▬▬▬▬▬▬▬`;

    ctx.reply(balanceMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('💸 ডিপোজিট করুন', 'go_deposit')]
        ])
    });
});

// --- ORDER SECTION ---
bot.hears('Order', (ctx) => {
    ctx.reply('🐢 **Select your service.**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'view_TikTok'), Markup.button.callback('Telegram Services', 'view_Telegram')],
        [Markup.button.callback('YouTube Services', 'view_YouTube'), Markup.button.callback('FaceBook Services', 'view_Facebook')],
        [Markup.button.callback('InstaGram Services', 'view_Instagram'), Markup.button.callback('❌ Empty', 'none')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

// --- ADMIN PANEL ---
bot.command('admin', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    ctx.reply('🛠 **ADMIN PANEL**', Markup.inlineKeyboard([
        [Markup.button.callback('➕ Add Service', 'admin_select_cat')],
        [Markup.button.callback('💰 Give Balance', 'admin_give_bal')],
        [Markup.button.callback('🗑 Clear All', 'admin_clear')]
    ]));
});

bot.action('admin_select_cat', (ctx) => {
    ctx.editMessageText('Select Category to add service:', Markup.inlineKeyboard([
        [Markup.button.callback('Facebook', 'add_Facebook'), Markup.button.callback('TikTok', 'add_TikTok')],
        [Markup.button.callback('Telegram', 'add_Telegram'), Markup.button.callback('YouTube', 'add_YouTube')],
        [Markup.button.callback('Instagram', 'add_Instagram')]
    ]));
});

// --- ACTIONS ---
bot.action(/add_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    adminState[ctx.from.id] = { step: 'adding', category: cat };
    ctx.reply(`📝 **${cat}**-er details pathan (Format: Name - Price)`);
});

bot.action(/view_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    const services = servicesDB[cat] || [];
    if (services.length === 0) return ctx.answerCbQuery('No services here!', { show_alert: true });

    const buttons = services.map((s, i) => [Markup.button.callback(`${s.name} - ${s.price}৳`, `buy_${cat}_${i}`)]);
    buttons.push([Markup.button.callback('↩️ Back', 'back_to_order')]);
    ctx.editMessageText(`🔥 **${cat} Menu:**`, Markup.inlineKeyboard(buttons));
});

bot.action('go_deposit', (ctx) => {
    ctx.reply('💳 আপনি কত টাকা ডিপোজিট করতে চান? শুধু সংখ্যাটি লিখুন।');
});

bot.action('back_to_order', (ctx) => {
    ctx.editMessageText('🐢 **Select your service.**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'view_TikTok'), Markup.button.callback('Telegram Services', 'view_Telegram')],
        [Markup.button.callback('YouTube Services', 'view_YouTube'), Markup.button.callback('FaceBook Services', 'view_Facebook')],
        [Markup.button.callback('InstaGram Services', 'view_Instagram'), Markup.button.callback('❌ Empty', 'none')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

bot.action('back_home', (ctx) => { ctx.deleteMessage(); ctx.reply('🏠 Main Menu', mainKeyboard); });

// --- TEXT HANDLER ---
bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    if (adminState[userId] && adminState[userId].step === 'adding' && userId === ADMIN_ID) {
        const parts = text.split('-');
        if (parts.length === 2) {
            servicesDB[adminState[userId].category].push({ name: parts[0].trim(), price: parts[1].trim() });
            ctx.reply('✅ Service Added!');
            delete adminState[userId];
        }
        return;
    }

    if (!isNaN(text)) {
        ctx.reply(`✅ **পেমেন্ট লিঙ্ক তৈরি হয়েছে**\n💵 পরিমাণ: ${text}৳`, 
        Markup.inlineKeyboard([[Markup.button.url('Bkash/Nogod Pay', 'https://bdsmmxz.com/deposit')]]));
    }
});

// Server for Render
http.createServer((req, res) => { res.write('Bot UI Active'); res.end(); }).listen(process.env.PORT || 3000);
bot.launch();
