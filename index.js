const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const ADMIN_ID = 7488161246;

// Database for Price Info
let priceInfo = {
    'Telegram': "🔵 𝗧𝗘𝗟𝗘𝗚𝗥𝗔𝗠\n\n👁️ 1K Views — 1 Taka (Life Time)\n❤️ 1K Reacts + Views — 8 Taka (Life Time Agun service 💥)\n👥 1K Members — 15 Taka [low drop]",
    'Facebook': "🔷 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞\n\n🎥 1K Video/Reels Views — 5 Tk (Life Time)\n👤 1K Followers — 30 Taka (Life Time)\n😍 1K Reactions — 15 TK (Life Time)",
    'Instagram': "🟣 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠\n\n👁️ 1K Views — 1 Taka (Life Time)\n❤️ 1K Likes — 20 Taka (Drop 5%)\n⭐ 1K Followers — 45 Taka (Drop +7%)",
    'TikTok': "⚫ 𝗧𝗜𝗞𝗧𝗢𝗞\n\n👁️ 1K Views — 3 Taka (low drop)\n👍 1K Likes — 10 Taka (permanent)\n⭐ 1K Followers — 150 Tk (permanent)",
    'YouTube': "🔴 𝗬𝗢𝗨𝗧𝗨𝗕𝗘\n\n👍 1K Likes — 60 Taka (permanent)\n🔔 1K Subscribers — 140 Tk (Drop 60%)\n▶️ 1K Views — 120 Taka (lifetime)"
};

let adminState = {};

const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Price & Info'],
    ['Premium service']
]).resize();

bot.start(async (ctx) => {
    ctx.reply('🏠 **WELCOME TO NH AUTO BOOST**', mainKeyboard);
});

// --- Price & Info Section ---
bot.hears('Price & Info', (ctx) => {
    ctx.reply('🐢 **কোন সার্ভিসের প্রাইস লিস্ট দেখতে চান?**', Markup.inlineKeyboard([
        [Markup.button.callback('Telegram', 'p_Telegram'), Markup.button.callback('Facebook', 'p_Facebook')],
        [Markup.button.callback('Instagram', 'p_Instagram'), Markup.button.callback('TikTok', 'p_TikTok')],
        [Markup.button.callback('YouTube', 'p_YouTube')],
        [Markup.button.callback('↩️ Main Menu', 'back_home')]
    ]));
});

// Show Price Logic
bot.action(/p_(.+)/, (ctx) => {
    const category = ctx.match[1];
    const info = priceInfo[category] || "Price info not set yet.";
    ctx.editMessageText(`━━━━━━━━━━━━━━━━━━━━━━\n${info}\n━━━━━━━━━━━━━━━━━━━━━━\n💥 তাড়াতাড়ি অর্ডার কমপ্লিট\n⏱ ৩০ মিনিট এর মধ্যে কমপ্লিট হবে\n━━━━━━━━━━━━━━━━━━━━━━`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('↩️ Back', 'back_to_price')]])
    });
});

// --- Admin Control to Edit Price ---
bot.command('admin', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    ctx.reply('🛠 **ADMIN PANEL**', Markup.inlineKeyboard([
        [Markup.button.callback('📝 Edit Price List', 'admin_edit_price')],
        [Markup.button.callback('🗑 Clear State', 'admin_clear')]
    ]));
});

bot.action('admin_edit_price', (ctx) => {
    ctx.editMessageText('কোন ক্যাটাগরির প্রাইস লিস্ট এডিট করবেন?', Markup.inlineKeyboard([
        [Markup.button.callback('Telegram', 'edit_Telegram'), Markup.button.callback('Facebook', 'edit_Facebook')],
        [Markup.button.callback('Instagram', 'edit_Instagram'), Markup.button.callback('TikTok', 'edit_TikTok')],
        [Markup.button.callback('YouTube', 'edit_YouTube')]
    ]));
});

bot.action(/edit_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    adminState[ctx.from.id] = { step: 'editing_price', category: cat };
    ctx.reply(`📝 **${cat}**-এর নতুন প্রাইস লিস্টটি লিখে পাঠান।`);
});

// --- Handling Text Inputs ---
bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    if (adminState[userId] && adminState[userId].step === 'editing_price') {
        const cat = adminState[userId].category;
        priceInfo[cat] = ctx.message.text;
        delete adminState[userId];
        return ctx.reply(`✅ **${cat}** Price list updated successfully!`);
    }
});

// --- Navigation Callbacks ---
bot.action('back_to_price', (ctx) => {
    ctx.editMessageText('🐢 **কোন সার্ভিসের প্রাইস লিস্ট দেখতে চান?**', Markup.inlineKeyboard([
        [Markup.button.callback('Telegram', 'p_Telegram'), Markup.button.callback('Facebook', 'p_Facebook')],
        [Markup.button.callback('Instagram', 'p_Instagram'), Markup.button.callback('TikTok', 'p_TikTok')],
        [Markup.button.callback('YouTube', 'p_YouTube')],
        [Markup.button.callback('↩️ Main Menu', 'back_home')]
    ]));
});

bot.action('back_home', (ctx) => { ctx.deleteMessage(); ctx.reply('🏠 Main Menu', mainKeyboard); });

http.createServer((req, res) => { res.write('Price Bot Live'); res.end(); }).listen(process.env.PORT || 3000);
bot.launch();
