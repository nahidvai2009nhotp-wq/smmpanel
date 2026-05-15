const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const ADMIN_ID = 7488161246;

// --- DATABASE & SETTINGS ---
let servicesDB = { 
    'FB_Reacts': [], 'FB_Followers': [], 'FB_Views': [],
    'TT_Views': [], 'TT_Likes': [], 'TT_Followers': [],
    'TG_Members': [], 'TG_Views': [], 'TG_Reacts': [], 'TG_Combo': [],
    'YT_Views': [], 'YT_Likes': [], 'YT_Subs': [],
    'IG_Likes': [], 'IG_Followers': [], 'IG_Views': []
};

let userStats = {}; 
let depositLink = "https://bdsmmxz.com/deposit"; 
let adminState = {};

// Ei list-ti Price & Info button-e dekhabe
let priceInfo = {
    'Telegram': "🔵 𝗧𝗘𝗟𝗘𝗚𝗥𝗔𝗠\n\n👁️ 1K Views — 1 Taka\n❤️ 1K Reacts — 8 Taka\n👥 1K Members — 15 Taka",
    'Facebook': "🔷 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞\n\n🎥 1K Video Views — 5 Tk\n👤 1K Followers — 30 Taka\n😍 1K Reactions — 15 TK",
    'Instagram': "🟣 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠\n\n👁️ 1K Views — 1 Taka\n❤️ 1K Likes — 20 Taka\n⭐ 1K Followers — 45 Taka",
    'TikTok': "⚫ 𝗧𝗜𝗞𝗧𝗢𝗞\n\n👁️ 1K Views — 3 Taka\n👍 1K Likes — 10 Taka\n⭐ 1K Followers — 150 Tk",
    'YouTube': "🔴 𝗬𝗢𝗨𝗧𝗨𝗕𝗘\n\n👍 1K Likes — 60 Taka\n🔔 1K Subscribers — 140 Tk\n▶️ 1K Views — 120 Taka"
};

const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Price & Info'],
    ['Premium service']
]).resize();

bot.start((ctx) => ctx.reply('🏠 **WELCOME TO NH AUTO BOOST**', mainKeyboard));

// --- 1. PRICE & INFO HANDLER ---
bot.hears('Price & Info', (ctx) => {
    ctx.reply('🐢 **কোন সার্ভিসের প্রাইস লিস্ট দেখতে চান?**', Markup.inlineKeyboard([
        [Markup.button.callback('Telegram', 'p_Telegram'), Markup.button.callback('Facebook', 'p_Facebook')],
        [Markup.button.callback('Instagram', 'p_Instagram'), Markup.button.callback('TikTok', 'p_TikTok')],
        [Markup.button.callback('YouTube', 'p_YouTube')],
        [Markup.button.callback('↩️ Main Menu', 'back_home')]
    ]));
});

bot.action(/p_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    const info = priceInfo[cat];
    ctx.editMessageText(`━━━━━━━━━━━━━━━━━━━━━━\n📲 NH AUTO BOOST 🔥 – SERVICE LIST\n━━━━━━━━━━━━━━━━━━━━━━\n\n${info}\n\n━━━━━━━━━━━━━━━━━━━━━━\n💥 তাড়াতাড়ি অর্ডার কমপ্লিট\n⏱ ৩০ মিনিট এর মধ্যে অর্ডার কমপ্লিট হবে\n🛡 গ্যারান্টি সহ সাপোর্ট এবং সার্ভিস\n━━━━━━━━━━━━━━━━━━━━━━`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('↩️ Back', 'back_to_price')]])
    });
});

// --- 2. DEPOSIT LOGIC ---
bot.hears('Deposit', (ctx) => {
    adminState[ctx.from.id] = { step: 'waiting_amount' };
    ctx.reply(`━━━━━━━━━━━━━━━━━━━━\n💳 **𝗗𝗘𝗣𝗢𝗦𝗜𝗧 𝗔𝗠𝗢𝗨𝗡𝗧**\n━━━━━━━━━━━━━━━━━━━━\n\nআপনি কত টাকা ডিপোজিট করতে চান?\nশুধু টাকার পরিমাণটি লিখে পাঠান।👇`);
});

bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    const msg = ctx.message.text;

    if (adminState[userId] && adminState[userId].step === 'waiting_amount') {
        const amount = parseFloat(msg);
        if (isNaN(amount)) return ctx.reply('❌ সংখায় লিখুন।');
        if (amount < 10) return ctx.reply('❌ Minimum amount 10 taka');

        const orderId = Math.floor(10000000 + Math.random() * 90000000);
        const name = ctx.from.first_name || "User";
        const summary = `✅ **পেমেন্ট লিংক তৈরি হয়েছে**\n━━━━━━━━━━━━━━\n\n👤 **নাম:** ${name}\n💰 **পরিমাণ:** ${amount.toFixed(2)}৳\n➕ **মোট যোগ হবে:** ${amount.toFixed(2)}৳\n🧾 **অর্ডার আইডি:** ${orderId}\n\n👉 **পেমent করতে নিচের বাটনে ক্লিক করুন।**\n━━━━━━━━━━━━━━`;
        
        delete adminState[userId];
        return ctx.reply(summary, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.url('💸 পেমেন্ট করুন', depositLink)]])
        });
    }

    // Admin handlers (link change/service add)
    if (adminState[userId] && userId === ADMIN_ID) {
        if (adminState[userId].step === 'editing_link') {
            depositLink = msg;
            delete adminState[userId];
            return ctx.reply('✅ Deposit link updated!');
        }
        if (adminState[userId].step === 'adding_service') {
            const parts = msg.split('-');
            if (parts.length === 2) {
                servicesDB[adminState[userId].category].push({ name: parts[0].trim(), price: parts[1].trim() });
                ctx.reply('✅ Service Added!');
                delete adminState[userId];
            } else { ctx.reply('❌ Format: Name - Price'); }
        }
    }
});

// --- 3. BALANCE & ORDER (Shorter for space, code remains same) ---
bot.hears('Balance', (ctx) => {
    const stats = userStats[ctx.from.id] || { balance: 0.0, orders: 0, spent: 0.0 };
    ctx.reply(`💳 **অ্যাকাউন্ট ব্যালেন্স**\n\n👤 নাম : ${ctx.from.first_name}\n💰 ব্যালেন্স : ${stats.balance.toFixed(2)} টাকা\n📦 Orders : ${stats.orders}`, Markup.inlineKeyboard([[Markup.button.callback('💸 ডিপোজিট', 'go_deposit')]]));
});

bot.hears('Order', (ctx) => {
    ctx.reply('🏠 **Select your service.**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'cat_TikTok'), Markup.button.callback('Telegram Services', 'cat_Telegram')],
        [Markup.button.callback('YouTube Services', 'cat_YouTube'), Markup.button.callback('Facebook Services', 'cat_Facebook')],
        [Markup.button.callback('Instagram Services', 'cat_Instagram')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

// --- 4. NAVIGATION & ADMIN ---
bot.command('admin', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    ctx.reply('🛠 **ADMIN PANEL**', Markup.inlineKeyboard([
        [Markup.button.callback('➕ Add Order Service', 'admin_add_serv')],
        [Markup.button.callback('🔗 Change Deposit Link', 'admin_edit_link')]
    ]));
});

bot.action('back_to_price', (ctx) => {
    ctx.editMessageText('🐢 **কোন সার্ভিসের প্রাইস লিস্ট দেখতে চান?**', Markup.inlineKeyboard([
        [Markup.button.callback('Telegram', 'p_Telegram'), Markup.button.callback('Facebook', 'p_Facebook')],
        [Markup.button.callback('Instagram', 'p_Instagram'), Markup.button.callback('TikTok', 'p_TikTok')],
        [Markup.button.callback('YouTube', 'p_YouTube')],
        [Markup.button.callback('↩️ Main Menu', 'back_home')]
    ]));
});

bot.action('back_home', (ctx) => { ctx.deleteMessage(); ctx.reply('🏠 Main Menu', mainKeyboard); });
bot.action('go_deposit', (ctx) => { adminState[ctx.from.id] = { step: 'waiting_amount' }; ctx.reply('পেমেন্ট অ্যামাউন্ট পাঠান (Min 10):'); });

http.createServer((req, res) => { res.write('Bot Active'); res.end(); }).listen(process.env.PORT || 3000);
bot.launch();
