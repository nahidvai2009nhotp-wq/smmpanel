const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const ADMIN_ID = 7488161246;

// --- DATABASE (Local) ---
let servicesDB = { 'Facebook': [], 'TikTok': [], 'Telegram': [], 'YouTube': [], 'Instagram': [] };

// Apnar dewa updated price list ekhane set kora holo
let priceInfo = {
    'Telegram': "🔵 𝗧𝗘𝗟𝗘𝗚𝗥𝗔𝗠\n\n👁️ 1K Views — 1 Taka (Life Time)\n❤️ 1K Reacts + Views — 8 Taka (Life Time Agun service 💥)\n👥 1K Members — 15 Taka [low drop]",
    'Facebook': "🔷 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞\n\n🎥 1K Video/Reels Views — 5 Tk (Life Time)\n👤 1K Followers — 30 Taka (Life Time)\n😍 1K Reactions — 15 TK (Life Time)",
    'Instagram': "🟣 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠\n\n👁️ 1K Views — 1 Taka (Life Time)\n❤️ 1K Likes — 20 Taka (Drop 5%)\n⭐ 1K Followers — 45 Taka (Drop +7%)",
    'TikTok': "⚫ 𝗧𝗜𝗞𝗧𝗢𝗞\n\n👁️ 1K Views — 3 Taka (low drop)\n👍 1K Likes — 10 Taka (permanent)\n⭐ 1K Followers — 150 Tk (permanent)",
    'YouTube': "🔴 𝗬𝗢𝗨𝗧𝗨𝗕𝗘\n\n👍 1K Likes — 60 Taka (permanent)\n🔔 1K Subscribers — 140 Tk (Drop 60%)\n▶️ 1K Views — 120 Taka (lifetime)"
};

let adminState = {};

// --- MAIN KEYBOARD ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Price & Info'],
    ['Premium service']
]).resize();

bot.start(async (ctx) => {
    const welcomeMsg = `🏠 **WELCOME TO NH AUTO BOOST** 🏠\n\n🔥 মার্কেটের সবচেয়ে কম দাম\n🌟 সম্পূর্ণ অটোমেটিক সিস্টেম`;
    try {
        await ctx.replyWithPhoto('https://i.ibb.co/VWV0YfX/rx-smm.jpg', {
            caption: welcomeMsg, parse_mode: 'Markdown', ...mainKeyboard
        });
    } catch (e) {
        await ctx.reply(welcomeMsg, { parse_mode: 'Markdown', ...mainKeyboard });
    }
});

// --- ADMIN PANEL ---
bot.command('admin', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    ctx.reply('🛠 **ADMIN CONTROL PANEL**', 
    Markup.inlineKeyboard([
        [Markup.button.callback('➕ Add Order Service', 'admin_add_serv')],
        [Markup.button.callback('📝 Edit Price & Info', 'admin_edit_price')],
        [Markup.button.callback('🗑 Clear All Services', 'admin_clear')]
    ]));
});

// --- PRICE & INFO SECTION ---
bot.hears('Price & Info', (ctx) => {
    ctx.reply('🐢 **কোন সার্ভিসের প্রাইস লিস্ট দেখতে চান?**', Markup.inlineKeyboard([
        [Markup.button.callback('Telegram', 'p_Telegram'), Markup.button.callback('Facebook', 'p_Facebook')],
        [Markup.button.callback('Instagram', 'p_Instagram'), Markup.button.callback('TikTok', 'p_TikTok')],
        [Markup.button.callback('YouTube', 'p_YouTube')],
        [Markup.button.callback('↩️ Main Menu', 'back_home')]
    ]));
});

// Show Price Logic (Apnar format-e)
bot.action(/p_(.+)/, (ctx) => {
    const category = ctx.match[1];
    const info = priceInfo[category] || "No info set.";
    ctx.editMessageText(`━━━━━━━━━━━━━━━━━━━━━━\n📲 NH AUTO BOOST 🔥 – SERVICE LIST\n━━━━━━━━━━━━━━━━━━━━━━\n\n${info}\n\n━━━━━━━━━━━━━━━━━━━━━━\n💥 তাড়াতাড়ি অর্ডার কমপ্লিট\n⏱ ৩০ মিনিট এর মধ্যে অর্ডার কমপ্লিট হবে\n🛡 গ্যারান্টি সহ সাপোর্ট এবং সার্ভিস\n━━━━━━━━━━━━━━━━━━━━━━`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('↩️ Back', 'back_to_price')]])
    });
});

// --- ORDER SECTION ---
bot.hears('Order', (ctx) => {
    ctx.reply('🐢 **Select category:**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'view_TikTok'), Markup.button.callback('Telegram Services', 'view_Telegram')],
        [Markup.button.callback('YouTube Services', 'view_YouTube'), Markup.button.callback('Facebook Services', 'view_Facebook')],
        [Markup.button.callback('Instagram Services', 'view_Instagram')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

// --- ADMIN CALLBACKS & TEXT HANDLER ---
bot.action('admin_add_serv', (ctx) => {
    ctx.editMessageText('কোন ক্যাটাগরিতে সার্ভিস এড করবেন?', Markup.inlineKeyboard([
        [Markup.button.callback('Facebook', 'add_Facebook'), Markup.button.callback('TikTok', 'add_TikTok')],
        [Markup.button.callback('Telegram', 'add_Telegram'), Markup.button.callback('YouTube', 'add_YouTube')],
        [Markup.button.callback('Instagram', 'add_Instagram')]
    ]));
});

bot.action(/add_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    adminState[ctx.from.id] = { step: 'adding_service', category: cat };
    ctx.reply(`📝 **${cat}**-এর সার্ভিস এড করুন।\n\nFormat: \`Service Name - Price\`\nExample: \`1K Views - 1\``);
});

bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    if (adminState[userId] && userId === ADMIN_ID) {
        const state = adminState[userId];
        if (state.step === 'adding_service') {
            const parts = ctx.message.text.split('-');
            if (parts.length === 2) {
                servicesDB[state.category].push({ name: parts[0].trim(), price: parts[1].trim() });
                ctx.reply(`✅ Added to ${state.category}!`);
                delete adminState[userId];
            } else { ctx.reply('❌ ভুল ফরম্যাট! Name - Price লিখুন।'); }
        }
        return;
    }
});

// --- NAVIGATION ---
bot.action('back_to_price', (ctx) => {
    ctx.editMessageText('🐢 **কোন সার্ভিসের প্রাইস লিস্ট দেখতে চান?**', Markup.inlineKeyboard([
        [Markup.button.callback('Telegram', 'p_Telegram'), Markup.button.callback('Facebook', 'p_Facebook')],
        [Markup.button.callback('Instagram', 'p_Instagram'), Markup.button.callback('TikTok', 'p_TikTok')],
        [Markup.button.callback('YouTube', 'p_YouTube')],
        [Markup.button.callback('↩️ Main Menu', 'back_home')]
    ]));
});

bot.action('back_home', (ctx) => { ctx.deleteMessage(); ctx.reply('🏠 Main Menu', mainKeyboard); });

http.createServer((req, res) => { res.write('NH Boost Live'); res.end(); }).listen(process.env.PORT || 3000);
bot.launch();
