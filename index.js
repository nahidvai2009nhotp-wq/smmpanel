const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const ADMIN_ID = 7488161246;

// --- DATABASE (Local) ---
let servicesDB = { 
    'Facebook': [], 'TikTok': [], 'Telegram': [], 'YouTube': [], 'Instagram': [] 
};

// Price Info ager motoi thakbe
let priceInfo = {
    'Telegram': "🔵 𝗧𝗘𝗟𝗘𝗚𝗥𝗔𝗠\n\n👁️ 1K Views — 1 Taka\n❤️ 1K Reacts — 8 Taka\n👥 1K Members — 15 Taka",
    'Facebook': "🔷 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞\n\n🎥 1K Video Views — 5 Tk\n👤 1K Followers — 30 Taka\n😍 1K Reactions — 15 TK",
    'Instagram': "🟣 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠\n\n👁️ 1K Views — 1 Taka\n❤️ 1K Likes — 20 Taka\n⭐ 1K Followers — 45 Taka",
    'TikTok': "⚫ 𝗧𝗜𝗞𝗧𝗢𝗞\n\n👁️ 1K Views — 3 Taka\n👍 1K Likes — 10 Taka\n⭐ 1K Followers — 150 Tk",
    'YouTube': "🔴 𝗬𝗢𝗨𝗧𝗨𝗕𝗘\n\n👍 1K Likes — 60 Taka\n🔔 1K Subscribers — 140 Tk\n▶️ 1K Views — 120 Taka"
};

let adminState = {};

const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Price & Info'],
    ['Premium service']
]).resize();

bot.start((ctx) => ctx.reply('🏠 **WELCOME TO NH AUTO BOOST**', mainKeyboard));

// --- ORDER SECTION (Updated to match images) ---
bot.hears('Order', (ctx) => {
    ctx.reply('🏠 **Select your service.**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'cat_TikTok'), Markup.button.callback('Telegram Services', 'cat_Telegram')],
        [Markup.button.callback('YouTube Services', 'cat_YouTube'), Markup.button.callback('Facebook Services', 'cat_Facebook')],
        [Markup.button.callback('Instagram Services', 'cat_Instagram')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

// Sub-menus logic based on images
bot.action(/cat_(.+)/, (ctx) => {
    const platform = ctx.match[1];
    let buttons = [];

    if (platform === 'Instagram') {
        buttons = [
            [Markup.button.callback('✅ Instagram Likes ❤️', 'view_IG_Likes'), Markup.button.callback('✅ Instagram Followers 👥', 'view_IG_Followers')],
            [Markup.button.callback('✅ Instagram Views 👁️', 'view_IG_Views'), Markup.button.callback('↩️ Return.', 'back_to_order')]
        ];
    } else if (platform === 'Facebook') {
        buttons = [
            [Markup.button.callback('✅ Facebook Reacts ❤️', 'view_FB_Reacts'), Markup.button.callback('✅ Facebook Followers 👥', 'view_FB_Followers')],
            [Markup.button.callback('✅ Facebook Views 📈', 'view_FB_Views'), Markup.button.callback('↩️ Return.', 'back_to_order')]
        ];
    } else if (platform === 'TikTok') {
        buttons = [
            [Markup.button.callback('✅ TikTok Views 📈', 'view_TT_Views'), Markup.button.callback('✅ TikTok Likes ❤️', 'view_TT_Likes')],
            [Markup.button.callback('✅ TikTok Followers 👥', 'view_TT_Followers'), Markup.button.callback('↩️ Return.', 'back_to_order')]
        ];
    } else if (platform === 'Telegram') {
        buttons = [
            [Markup.button.callback('✅ Telegram Members 👥', 'view_TG_Members'), Markup.button.callback('✅ Telegram Views 👁️', 'view_TG_Views')],
            [Markup.button.callback('✅ Telegram Reactions 😍', 'view_TG_Reacts'), Markup.button.callback('Telegram Combo Pack 🎁', 'view_TG_Combo')],
            [Markup.button.callback('↩️ Return.', 'back_to_order')]
        ];
    } else if (platform === 'YouTube') {
        buttons = [
            [Markup.button.callback('✅ YouTube Views 📈', 'view_YT_Views'), Markup.button.callback('✅ YouTube Likes 👍', 'view_YT_Likes')],
            [Markup.button.callback('✅ YouTube Subscribers 👥', 'view_YT_Subs'), Markup.button.callback('↩️ Return.', 'back_to_order')]
        ];
    }

    ctx.editMessageText(`🔥 **${platform} Services:**`, Markup.inlineKeyboard(buttons));
});

// Final Service List (Order korar jonno)
bot.action(/view_(.+)/, (ctx) => {
    const subCat = ctx.match[1];
    const services = servicesDB[subCat] || [];
    if (services.length === 0) return ctx.answerCbQuery('Ekhono kono service add kora hoyni!', { show_alert: true });

    const buttons = services.map((s, i) => [Markup.button.callback(`${s.name} - ${s.price}৳`, `buy_${subCat}_${i}`)]);
    buttons.push([Markup.button.callback('↩️ Back', 'back_to_order')]);
    ctx.editMessageText(`🛒 **Service List:**`, Markup.inlineKeyboard(buttons));
});

// --- PRICE & INFO (Ager motoi) ---
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

// --- ADMIN & NAVIGATION ---
bot.command('admin', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    ctx.reply('🛠 **ADMIN PANEL**', Markup.inlineKeyboard([
        [Markup.button.callback('➕ Add Service', 'admin_add')],
        [Markup.button.callback('🗑 Clear All', 'admin_clear')]
    ]));
});

bot.action('back_to_order', (ctx) => {
    ctx.editMessageText('🏠 **Select your service.**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'cat_TikTok'), Markup.button.callback('Telegram Services', 'cat_Telegram')],
        [Markup.button.callback('YouTube Services', 'cat_YouTube'), Markup.button.callback('Facebook Services', 'cat_Facebook')],
        [Markup.button.callback('Instagram Services', 'cat_Instagram')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

bot.action('back_to_price', (ctx) => {
    ctx.editMessageText('🐢 **Select category to see price:**', Markup.inlineKeyboard([
        [Markup.button.callback('Telegram', 'p_Telegram'), Markup.button.callback('Facebook', 'p_Facebook')],
        [Markup.button.callback('Instagram', 'p_Instagram'), Markup.button.callback('TikTok', 'p_TikTok')],
        [Markup.button.callback('YouTube', 'p_YouTube')]
    ]));
});

bot.action('back_home', (ctx) => { ctx.deleteMessage(); ctx.reply('🏠 Main Menu', mainKeyboard); });

http.createServer((req, res) => { res.write('Bot Active'); res.end(); }).listen(process.env.PORT || 3000);
bot.launch();
