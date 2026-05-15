const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const ADMIN_ID = 7488161246;

// Database for Sub-categories and Services
let servicesDB = {
    'Facebook': { 'Likes': [], 'Followers': [], 'Views': [] },
    'TikTok': { 'Likes': [], 'Followers': [], 'Views': [] },
    'Telegram': { 'Members': [], 'Views': [], 'Reactions': [] },
    'YouTube': { 'Likes': [], 'Subscribers': [], 'Views': [] },
    'Instagram': { 'Likes': [], 'Followers': [], 'Views': [] }
};

let adminState = {};

const mainKeyboard = Markup.keyboard([
    ['Order'], ['Deposit', 'Balance'], ['Support', 'Price & Info'], ['Premium service']
]).resize();

// --- ADMIN PANEL ---
bot.command('admin', (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    ctx.reply('🛠 **ADMIN PANEL**', Markup.inlineKeyboard([
        [Markup.button.callback('➕ Add Service', 'admin_select_cat')],
        [Markup.button.callback('🗑 Clear All', 'admin_clear')]
    ]));
});

bot.action('admin_select_cat', (ctx) => {
    const buttons = Object.keys(servicesDB).map(cat => [Markup.button.callback(cat, `admin_cat_${cat}`)]);
    ctx.editMessageText('Select Category:', Markup.inlineKeyboard(buttons));
});

bot.action(/admin_cat_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    const subCats = Object.keys(servicesDB[cat]);
    const buttons = subCats.map(sub => [Markup.button.callback(sub, `admin_sub_${cat}_${sub}`)]);
    ctx.editMessageText(`Select Sub-category for ${cat}:`, Markup.inlineKeyboard(buttons));
});

bot.action(/admin_sub_(.+)_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    const sub = ctx.match[2];
    adminState[ctx.from.id] = { step: 'adding', cat, sub };
    ctx.reply(`📝 **${cat} > ${sub}**-er details pathan (Name - Price)`);
});

// --- ORDER SECTION (User View) ---
bot.hears('Order', (ctx) => {
    ctx.reply('🐢 **Select a Service Category:**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'user_cat_TikTok'), Markup.button.callback('Telegram Services', 'user_cat_Telegram')],
        [Markup.button.callback('YouTube Services', 'user_cat_YouTube'), Markup.button.callback('Facebook Services', 'user_cat_Facebook')],
        [Markup.button.callback('Instagram Services', 'user_cat_Instagram')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

bot.action(/user_cat_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    const subCats = Object.keys(servicesDB[cat]);
    const buttons = subCats.map(sub => [Markup.button.callback(`✅ ${cat} ${sub}`, `user_sub_${cat}_${sub}`)]);
    buttons.push([Markup.button.callback('↩️ Back', 'back_to_order')]);
    ctx.editMessageText(`📂 **${cat} Sub-categories:**`, Markup.inlineKeyboard(buttons));
});

bot.action(/user_sub_(.+)_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    const sub = ctx.match[2];
    const services = servicesDB[cat][sub];
    
    if (services.length === 0) return ctx.answerCbQuery('No services here!', { show_alert: true });

    const buttons = services.map((s, i) => [Markup.button.callback(`${s.name} - ${s.price}৳`, `buy_${cat}_${sub}_${i}`)]);
    buttons.push([Markup.button.callback('↩️ Back', `user_cat_${cat}`)]);
    ctx.editMessageText(`🔥 **${cat} > ${sub} List:**`, Markup.inlineKeyboard(buttons));
});

// --- TEXT HANDLER ---
bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    if (adminState[userId] && adminState[userId].step === 'adding' && userId === ADMIN_ID) {
        const { cat, sub } = adminState[userId];
        const parts = ctx.message.text.split('-');
        if (parts.length === 2) {
            servicesDB[cat][sub].push({ name: parts[0].trim(), price: parts[1].trim() });
            ctx.reply(`✅ Added to ${cat} > ${sub}!`);
            delete adminState[userId];
        } else { ctx.reply('❌ Use format: Name - Price'); }
        return;
    }
});

bot.action('back_to_order', (ctx) => {
    ctx.editMessageText('🐢 **Select a Service Category:**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'user_cat_TikTok'), Markup.button.callback('Telegram Services', 'user_cat_Telegram')],
        [Markup.button.callback('YouTube Services', 'user_cat_YouTube'), Markup.button.callback('Facebook Services', 'user_cat_Facebook')],
        [Markup.button.callback('Instagram Services', 'user_cat_Instagram')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

bot.action('back_home', (ctx) => { ctx.deleteMessage(); ctx.reply('🏠 Main Menu', mainKeyboard); });

http.createServer((req, res) => { res.write('Sub-cat Bot Live'); res.end(); }).listen(process.env.PORT || 3000);
bot.launch();
