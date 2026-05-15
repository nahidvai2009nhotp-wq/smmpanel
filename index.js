const { Telegraf, Markup } = require('telegraf');
const http = require('http');

const bot = new Telegraf('8899621376:AAFcaWoRVw4QiS74vrsAPvFZxNbnBCEmOF4');
const ADMIN_ID = 7488161246;

// --- DATABASE (Local) ---
let servicesDB = { 'Facebook': [], 'TikTok': [], 'Telegram': [], 'YouTube': [], 'Instagram': [] };
let priceInfo = {
    'Telegram': "🔵 𝗧𝗘𝗟𝗘𝗚𝗥𝗔𝗠 list...",
    'Facebook': "🔷 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 list...",
    'Instagram': "🟣 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠 list...",
    'TikTok': "⚫ 𝗧𝗜𝗞𝗧𝗢𝗞 list...",
    'YouTube': "🔴 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 list..."
};
let adminState = {};

// --- KEYBOARD ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Price & Info'],
    ['Premium service']
]).resize();

// --- START ---
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
    ctx.reply('🛠 **ADMIN CONTROL PANEL**\n\nKi korte chan select korun:', 
    Markup.inlineKeyboard([
        [Markup.button.callback('➕ Add Order Service', 'admin_add_serv')],
        [Markup.button.callback('📝 Edit Price & Info', 'admin_edit_price')],
        [Markup.button.callback('🗑 Clear All Services', 'admin_clear')]
    ]));
});

// --- ADMIN ACTION: ADD SERVICE TO ORDER BUTTON ---
bot.action('admin_add_serv', (ctx) => {
    ctx.editMessageText('Kon category-te service add korben?', Markup.inlineKeyboard([
        [Markup.button.callback('Facebook', 'add_Facebook'), Markup.button.callback('TikTok', 'add_TikTok')],
        [Markup.button.callback('Telegram', 'add_Telegram'), Markup.button.callback('YouTube', 'add_YouTube')],
        [Markup.button.callback('Instagram', 'add_Instagram')]
    ]));
});

bot.action(/add_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    adminState[ctx.from.id] = { step: 'adding_service', category: cat };
    ctx.reply(`📝 **${cat}**-er jonno service details pathan.\n\nFormat: \`Service Name - Price\`\nExample: \`1K Followers - 30\``);
});

// --- ADMIN ACTION: EDIT PRICE & INFO TEXT ---
bot.action('admin_edit_price', (ctx) => {
    ctx.editMessageText('Kon category-r Price Info edit korben?', Markup.inlineKeyboard([
        [Markup.button.callback('Telegram', 'ep_Telegram'), Markup.button.callback('Facebook', 'ep_Facebook')],
        [Markup.button.callback('Instagram', 'ep_Instagram'), Markup.button.callback('TikTok', 'ep_TikTok')],
        [Markup.button.callback('YouTube', 'ep_YouTube')]
    ]));
});

bot.action(/ep_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    adminState[ctx.from.id] = { step: 'editing_price_info', category: cat };
    ctx.reply(`📝 **${cat}**-er jonno puro price list text-ti pathan (Bold/Emoji use korte parben).`);
});

// --- ORDER HANDLER ---
bot.hears('Order', (ctx) => {
    ctx.reply('🐢 **Select category:**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'view_TikTok'), Markup.button.callback('Telegram Services', 'view_Telegram')],
        [Markup.button.callback('YouTube Services', 'view_YouTube'), Markup.button.callback('Facebook Services', 'view_Facebook')],
        [Markup.button.callback('Instagram Services', 'view_Instagram')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

bot.action(/view_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    const services = servicesDB[cat] || [];
    if (services.length === 0) return ctx.answerCbQuery('No services added yet!', { show_alert: true });

    const buttons = services.map((s, i) => [Markup.button.callback(`${s.name} - ${s.price}৳`, `buy_${cat}_${i}`)]);
    buttons.push([Markup.button.callback('↩️ Back', 'back_to_order')]);
    ctx.editMessageText(`🔥 **${cat} Menu:**`, Markup.inlineKeyboard(buttons));
});

// --- PRICE & INFO HANDLER ---
bot.hears('Price & Info', (ctx) => {
    ctx.reply('🐢 **Select category to see price:**', Markup.inlineKeyboard([
        [Markup.button.callback('Telegram', 'showp_Telegram'), Markup.button.callback('Facebook', 'showp_Facebook')],
        [Markup.button.callback('Instagram', 'showp_Instagram'), Markup.button.callback('TikTok', 'showp_TikTok')],
        [Markup.button.callback('YouTube', 'showp_YouTube')]
    ]));
});

bot.action(/showp_(.+)/, (ctx) => {
    const cat = ctx.match[1];
    const text = priceInfo[cat] || "No info set.";
    ctx.editMessageText(`━━━━━━━━━━━━━━━━━━━━━━\n${text}\n━━━━━━━━━━━━━━━━━━━━━━`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('↩️ Back', 'back_to_price_list')]])
    });
});

// --- TEXT INPUT HANDLER ---
bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    const msg = ctx.message.text;

    if (adminState[userId] && userId === ADMIN_ID) {
        const state = adminState[userId];
        
        if (state.step === 'adding_service') {
            const parts = msg.split('-');
            if (parts.length === 2) {
                servicesDB[state.category].push({ name: parts[0].trim(), price: parts[1].trim() });
                ctx.reply(`✅ Service added to ${state.category}!`);
                delete adminState[userId];
            } else {
                ctx.reply('❌ Vul format! Name - Price likhun.');
            }
        } 
        else if (state.step === 'editing_price_info') {
            priceInfo[state.category] = msg;
            ctx.reply(`✅ Price Info updated for ${state.category}!`);
            delete adminState[userId];
        }
        return;
    }
});

// --- HELPERS ---
bot.action('back_to_order', (ctx) => {
    ctx.editMessageText('🐢 **Select category:**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'view_TikTok'), Markup.button.callback('Telegram Services', 'view_Telegram')],
        [Markup.button.callback('YouTube Services', 'view_YouTube'), Markup.button.callback('Facebook Services', 'view_Facebook')],
        [Markup.button.callback('Instagram Services', 'view_Instagram')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ]));
});

bot.action('back_to_price_list', (ctx) => {
    ctx.editMessageText('🐢 **Select category to see price:**', Markup.inlineKeyboard([
        [Markup.button.callback('Telegram', 'showp_Telegram'), Markup.button.callback('Facebook', 'showp_Facebook')],
        [Markup.button.callback('Instagram', 'showp_Instagram'), Markup.button.callback('TikTok', 'showp_TikTok')],
        [Markup.button.callback('YouTube', 'showp_YouTube')]
    ]));
});

bot.action('back_home', (ctx) => { ctx.deleteMessage(); ctx.reply('🏠 Main Menu', mainKeyboard); });

http.createServer((req, res) => { res.write('Live'); res.end(); }).listen(process.env.PORT || 3000);
bot.launch();
                    
