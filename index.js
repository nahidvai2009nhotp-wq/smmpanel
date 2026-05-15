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

let userStats = {}; // Balance/Orders track korar jonno
let depositLink = "https://bdsmmxz.com/deposit"; 
let adminState = {};

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

// --- 1. DEPOSIT SECTION ---
bot.hears('Deposit', (ctx) => {
    adminState[ctx.from.id] = { step: 'waiting_amount' };
    ctx.reply(`━━━━━━━━━━━━━━━━━━━━\n💳 **𝗗𝗘𝗣𝗢𝗦𝗜𝗧 𝗔𝗠𝗢𝗨𝗡𝗧**\n━━━━━━━━━━━━━━━━━━━━\n\nআপনি কত টাকা ডিপোজিট করতে চান?\nশুধু টাকার পরিমাণটি লিখে পাঠান।👇`);
});

// --- 2. BALANCE SECTION (Image Format) ---
bot.hears('Balance', (ctx) => {
    const userId = ctx.from.id;
    const name = ctx.from.first_name || "User";
    if (!userStats[userId]) userStats[userId] = { balance: 0.00, orders: 0, spent: 0.00 };
    const stats = userStats[userId];

    const balanceMsg = `💳 ▬▬▬▬▬▬▬▬▬▬\n     **অ্যাকাউন্ট ব্যালেন্স**\n▬▬▬▬▬▬▬▬▬▬▬\n\n👤 **নাম :** ${name}\n💰 **বর্তমান ব্যালেন্স :** ${stats.balance.toFixed(2)} টাকা\n📦 **Total Orders :** ${stats.orders}\n💵 **Total Spent :** ${stats.spent.toFixed(2)} টাকা\n\n▬▬▬▬▬▬▬▬▬▬▬`;

    ctx.reply(balanceMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('💸 ডিপোজিট করুন', 'go_deposit')]])
    });
});

// --- 3. ORDER SECTION (Sub-menu Layout) ---
bot.hears('Order', (ctx) => {
    ctx.reply('🏠 **Select your service.**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'cat_TikTok'), Markup.button.callback('Telegram Services', 'cat_Telegram')],
        [Markup.button.callback('YouTube Services', 'cat_YouTube'), Markup.button.callback('Facebook Services', 'cat_Facebook')],
        [Markup.button.callback('Instagram Services', 'cat_Instagram')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

bot.action(/cat_(.+)/, (ctx) => {
    const platform = ctx.match[1];
    let buttons = [];
    if (platform === 'Instagram') {
        buttons = [[Markup.button.callback('✅ Instagram Likes ❤️', 'view_IG_Likes'), Markup.button.callback('✅ Instagram Followers 👥', 'view_IG_Followers')], [Markup.button.callback('✅ Instagram Views 👁️', 'view_IG_Views'), Markup.button.callback('↩️ Return.', 'back_to_order')]];
    } else if (platform === 'Facebook') {
        buttons = [[Markup.button.callback('✅ Facebook Reacts ❤️', 'view_FB_Reacts'), Markup.button.callback('✅ Facebook Followers 👥', 'view_FB_Followers')], [Markup.button.callback('✅ Facebook Views 📈', 'view_FB_Views'), Markup.button.callback('↩️ Return.', 'back_to_order')]];
    } else if (platform === 'TikTok') {
        buttons = [[Markup.button.callback('✅ TikTok Views 📈', 'view_TT_Views'), Markup.button.callback('✅ TikTok Likes ❤️', 'view_TT_Likes')], [Markup.button.callback('✅ TikTok Followers 👥', 'view_TT_Followers'), Markup.button.callback('↩️ Return.', 'back_to_order')]];
    } else if (platform === 'Telegram') {
        buttons = [[Markup.button.callback('✅ Telegram Members 👥', 'view_TG_Members'), Markup.button.callback('✅ Telegram Views 👁️', 'view_TG_Views')], [Markup.button.callback('✅ Telegram Reactions 😍', 'view_TG_Reacts'), Markup.button.callback('Telegram Combo Pack 🎁', 'view_TG_Combo')], [Markup.button.callback('↩️ Return.', 'back_to_order')]];
    } else if (platform === 'YouTube') {
        buttons = [[Markup.button.callback('✅ YouTube Views 📈', 'view_YT_Views'), Markup.button.callback('✅ YouTube Likes 👍', 'view_YT_Likes')], [Markup.button.callback('✅ YouTube Subscribers 👥', 'view_YT_Subs'), Markup.button.callback('↩️ Return.', 'back_to_order')]];
    }
    ctx.editMessageText(`🔥 **${platform} Services:**`, Markup.inlineKeyboard(buttons));
});

bot.action(/view_(.+)/, (ctx) => {
    const subCat = ctx.match[1];
    const services = servicesDB[subCat] || [];
    if (services.length === 0) return ctx.answerCbQuery('Ekhono kono service add kora hoyni!', { show_alert: true });
    const buttons = services.map((s, i) => [Markup.button.callback(`${s.name} - ${s.price}৳`, `buy_${subCat}_${i}`)]);
    buttons.push([Markup.button.callback('↩️ Back', 'back_to_order')]);
    ctx.editMessageText(`🛒 **Service List:**`, Markup.inlineKeyboard(buttons));
});

// --- 4. PRICE & INFO ---
bot.hears('Price & Info', (ctx) => {
    ctx.reply('🐢 **Select category to see price:**', Markup.inlineKeyboard([
        [Markup.button.callback('Telegram', 'p_Telegram'), Markup.button.callback('Facebook', 'p_Facebook')],
        [Markup.button.callback('Instagram', 'p_Instagram'), Markup.button.callback('TikTok', 'p_TikTok')],
        [Markup.button.callback('YouTube', 'p_YouTube')]
    ]));
});

bot.action(/p_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    const info = priceInfo[cat];
    ctx.editMessageText(`━━━━━━━━━━━━━━━━━━━━━━\n${info}\n━━━━━━━━━━━━━━━━━━━━━━`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('↩️ Back', 'back_to_price')]])
    });
});

// --- 5. ADMIN HANDLERS ---
bot.command('admin', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    ctx.reply('🛠 **ADMIN PANEL**', Markup.inlineKeyboard([
        [Markup.button.callback('➕ Add Order Service', 'admin_add_serv')],
        [Markup.button.callback('🔗 Change Deposit Link', 'admin_edit_link')],
        [Markup.button.callback('🗑 Clear All', 'admin_clear')]
    ]));
});

bot.action('admin_edit_link', (ctx) => {
    adminState[ctx.from.id] = { step: 'editing_link' };
    ctx.reply('🔗 নতুন পেমent লিঙ্কটি লিখে পাঠান:');
});

bot.action('admin_add_serv', (ctx) => {
    const cats = Object.keys(servicesDB);
    const buttons = cats.map(c => [Markup.button.callback(c, `add_${c}`)]);
    ctx.editMessageText('Kon sub-category te add korben?', Markup.inlineKeyboard(buttons));
});

bot.action(/add_(.+)/, (ctx) => {
    adminState[ctx.from.id] = { step: 'adding_service', category: ctx.match[1] };
    ctx.reply(`📝 **${ctx.match[1]}**-er jonno likhun: Name - Price`);
});

// --- 6. TEXT INPUT LOGIC ---
bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    const msg = ctx.message.text;

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
        return;
    }

    if (adminState[userId] && adminState[userId].step === 'waiting_amount') {
        const amount = parseFloat(msg);
        if (isNaN(amount)) return ctx.reply('❌ সংখায় লিখুন।');
        if (amount < 10) return ctx.reply('❌ Minimum amount 10 taka');

        const orderId = Math.floor(10000000 + Math.random() * 90000000);
        const name = ctx.from.first_name || "User";
        const summary = `✅ **পেমেন্ট লিংক তৈরি হয়েছে**\n━━━━━━━━━━━━━━\n\n👤 **নাম:** ${name}\n💰 **পরিমাণ:** ${amount.toFixed(2)}৳\n➕ **মোট যোগ হবে:** ${amount.toFixed(2)}৳\n🧾 **অর্ডার আইডি:** ${orderId}\n\n👉 **পেমেন্ট করতে নিচের বাটনে ক্লিক করুন।**\n━━━━━━━━━━━━━━`;
        
        delete adminState[userId];
        return ctx.reply(summary, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.url('💸 পেমেন্ট করুন', depositLink)]])
        });
    }
});

// --- NAVIGATION ---
bot.action('go_deposit', (ctx) => {
    adminState[ctx.from.id] = { step: 'waiting_amount' };
    ctx.reply(`━━━━━━━━━━━━━━━━━━━━\n💳 **𝗗𝗘𝗣𝗢𝗦𝗜𝗧 𝗔𝗠𝗢𝗨𝗡𝗧**\n━━━━━━━━━━━━━━━━━━━━\n\nআপনি কত টাকা ডিপোজিট করতে চান?\nশুধু টাকার পরিমাণটি লিখে পাঠান।👇`);
});
bot.action('back_to_order', (ctx) => { /* Same as Order Hears */ ctx.editMessageText('🏠 Select your service.', Markup.inlineKeyboard([[Markup.button.callback('TikTok Services', 'cat_TikTok'), Markup.button.callback('Telegram Services', 'cat_Telegram')], [Markup.button.callback('YouTube Services', 'cat_YouTube'), Markup.button.callback('Facebook Services', 'cat_Facebook')], [Markup.button.callback('Instagram Services', 'cat_Instagram')], [Markup.button.callback('↩️ Return', 'back_home')]])); });
bot.action('back_to_price', (ctx) => { /* Same as Price Hears */ ctx.editMessageText('🐢 Select category to see price:', Markup.inlineKeyboard([[Markup.button.callback('Telegram', 'p_Telegram'), Markup.button.callback('Facebook', 'p_Facebook')], [Markup.button.callback('Instagram', 'p_Instagram'), Markup.button.callback('TikTok', 'p_TikTok')], [Markup.button.callback('YouTube', 'p_YouTube')]])); });
bot.action('back_home', (ctx) => { ctx.deleteMessage(); ctx.reply('🏠 Main Menu', mainKeyboard); });

http.createServer((req, res) => { res.write('Bot Active'); res.end(); }).listen(process.env.PORT || 3000);
bot.launch();
                    
