const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// Updated with your new bot token
const bot = new Telegraf('8255693337:AAEOHh2xoiOwoR-K3ndLGtui8dmbGcgVlJ0');

// Initial setup with your primary account as global supervisor
let admins = [7488161246]; 
let adminState = {};

// --- DATABASE & SETTINGS ---
let servicesDB = { 
    'FB_Reacts': [], 'FB_Followers': [], 'FB_Views': [],
    'TT_Views': [], 'TT_Likes': [], 'TT_Followers': [],
    'TG_Members': [], 'TG_Views': [], 'TG_Reacts': [], 'TG_Combo': [],
    'YT_Views': [], 'YT_Likes': [], 'YT_Subs': [],
    'IG_Likes': [], 'IG_Followers': [], 'IG_Views': []
};

let userStats = {}; 

// Admin adjustable wallet numbers
let bkashNumber = "01897846165";
let nagadNumber = "0101001010";

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

// --- 2. BALANCE SECTION ---
bot.hears('Balance', (ctx) => {
    const userId = ctx.from.id;
    const name = ctx.from.first_name || "User";
    if (!userStats[userId]) userStats[userId] = { balance: 2.00, orders: 0, spent: 0.00 };
    const stats = userStats[userId];

    const balanceMsg = `💳 ▬▬▬▬▬▬▬▬▬▬\n     **অ্যাকাউন্ট ব্যালেন্স**\n▬▬▬▬▬▬▬▬▬▬▬\n\n👤 **নাম :** ${name}\n💰 **বর্তমান ব্যালেন্স :** ${stats.balance.toFixed(2)} টাকা\n📦 **Total Orders :** ${stats.orders}\n💵 **Total Spent :** ${stats.spent.toFixed(2)} টাকা\n\n▬▬▬▬▬▬▬▬▬▬▬`;

    ctx.reply(balanceMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('💸 ডিপোজিট করুন', 'go_deposit')]])
    });
});

// --- 3. ORDER SECTION (Updated Keyboard Layout based on Photo) ---
bot.hears('Order', (ctx) => {
    ctx.reply('🏠 **Select your service.**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'cat_TikTok'), Markup.button.callback('Telegram Services', 'cat_Telegram')],
        [Markup.button.callback('YouTube Services', 'cat_YouTube'), Markup.button.callback('FaceBook Services', 'cat_Facebook')],
        [Markup.button.callback('InstaGram Services', 'cat_Instagram'), Markup.button.callback('🌐 Premium service', 'premium_service')],
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

// --- 5. TEXT INPUT HANDLER (Deposit & Admin Input System) ---
bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    const msg = ctx.message.text;

    // Fixed: explicit command detection inside text interceptor to prevent loop freezing
    if (msg === '/admin') {
        if (!admins.includes(userId)) {
            return ctx.reply(`❌ Apni ei bot-er admin non!\n\n💡 আপনার ইউজার আইডি: ${userId}`);
        }
        return ctx.reply('🛠 **ADMIN CONTROL PANEL**', Markup.inlineKeyboard([
            [Markup.button.callback('📱 Edit bKash Number', 'edit_bkash')],
            [Markup.button.callback('📱 Edit Nagad Number', 'edit_nagad')],
            [Markup.button.callback('➕ Add New Admin', 'add_admin_panel')],
            [Markup.button.callback('🗑 Remove Admin', 'remove_admin_panel')]
        ]));
    }

    // Admin updates text state processing
    if (adminState[userId] && admins.includes(userId)) {
        if (adminState[userId].step === 'editing_bkash') {
            bkashNumber = msg;
            delete adminState[userId];
            return ctx.reply(`✅ bKash number updated to: ${msg}`);
        }
        if (adminState[userId].step === 'editing_nagad') {
            nagadNumber = msg;
            delete adminState[userId];
            return ctx.reply(`✅ Nagad number updated to: ${msg}`);
        }
        if (adminState[userId].step === 'adding_admin') {
            const targetId = parseInt(msg);
            if (isNaN(targetId)) return ctx.reply('❌ দয়া করে শুধুমাত্র সঠিক Numerical ID টি পাঠান।');
            if (admins.includes(targetId)) return ctx.reply('⚠️ এই আইডিটি ইতিমধ্যেই এডমিন লিস্টে আছে।');
            admins.push(targetId);
            delete adminState[userId];
            return ctx.reply(`✅ সফলভাবে এডমিন যোগ করা হয়েছে! নতুন এডমিন আইডি: ${targetId}`);
        }
        if (adminState[userId].step === 'removing_admin') {
            const targetId = parseInt(msg);
            if (isNaN(targetId)) return ctx.reply('❌ দয়া করে শুধুমাত্র সঠিক Numerical ID টি পাঠান।');
            if (targetId === 7488161246) return ctx.reply('❌ মূল সুপারভাইজার আইডি রিমুভ করা সম্ভব নয়!');
            
            const index = admins.indexOf(targetId);
            if (index > -1) {
                admins.splice(index, 1);
                delete adminState[userId];
                return ctx.reply(`✅ সফলভাবে আইডি: ${targetId} কে এডমিন লিস্ট থেকে রিমুভ করা হয়েছে।`);
            } else {
                return ctx.reply('❌ এই আইডিটি এডমিন লিস্টে খুঁজে পাওয়া যায়নি।');
            }
        }
    }

    // User State Deposit Processing
    if (adminState[userId] && adminState[userId].step === 'waiting_amount') {
        const amount = parseFloat(msg);
        if (isNaN(amount)) return ctx.reply('❌ সংখায় লিখুন।');
        if (amount < 10) return ctx.reply('❌ Minimum amount 10 taka');

        const orderId = Math.floor(10000000 + Math.random() * 90000000);
        const name = ctx.from.first_name || "Toxic";
        
        const summary = `✅ **পেমেন্ট লিংক তৈরি হয়েছে**\n━━━━━━━━━━━━━━\n\n👤 **নাম:** ${name}\n💰 **পরিমাণ:** ${amount.toFixed(2)}৳\n➕ **মোট যোগ হবে:** ${amount.toFixed(2)}৳\n🧾 **অর্ডার আইডি:** ${orderId}\nBKASH:${bkashNumber}\nNAGAD:${nagadNumber}\n\n👉 **পেমেন্ট করে নিচে ট্রানজেকশন আইডি লিখুন**\n━━━━━━━━━━━━━━`;
        
        adminState[userId] = { step: 'waiting_trx', amount: amount, orderId: orderId };
        return ctx.reply(summary);
    }

    // Waiting for Transaction ID submission
    if (adminState[userId] && adminState[userId].step === 'waiting_trx') {
        ctx.reply(`⚡ **আপনার ট্রানজেকশন আইডি (${msg}) সাবমিট হয়েছে!**\nএডমিন ভেরিফাই করে কিছুক্ষণের মধ্যে ব্যালেন্স যোগ করে দেবে।`);
        
        // Broadcast to all authorized administrators
        admins.forEach(adminId => {
            bot.telegram.sendMessage(adminId, `🔔 **New Deposit Request!**\n\n👤 User: ${ctx.from.first_name} (${userId})\n💰 Amount: ${adminState[userId].amount}৳\n🧾 Order ID: ${adminState[userId].orderId}\n🔑 Trx ID: ${msg}`).catch(e => console.log(e.message));
        });
        
        delete adminState[userId];
        return;
    }
});

// --- 6. ADMIN COMMAND BACKUP INITIALIZER ---
bot.command('admin', (ctx) => {
    const userId = ctx.from.id;
    if (!admins.includes(userId)) {
        return ctx.reply(`❌ Apni ei bot-er admin non!\n\n💡 আপনার ইউজার আইডি: ${userId}`);
    }
    ctx.reply('🛠 **ADMIN CONTROL PANEL**', Markup.inlineKeyboard([
        [Markup.button.callback('📱 Edit bKash Number', 'edit_bkash')],
        [Markup.button.callback('📱 Edit Nagad Number', 'edit_nagad')],
        [Markup.button.callback('➕ Add New Admin', 'add_admin_panel')],
        [Markup.button.callback('🗑 Remove Admin', 'remove_admin_panel')]
    ]));
});

bot.action('edit_bkash', (ctx) => {
    if (!admins.includes(ctx.from.id)) return;
    adminState[ctx.from.id] = { step: 'editing_bkash' };
    ctx.reply('📞 নতুন bKash নাম্বারটি লিখে পাঠান:');
});

bot.action('edit_nagad', (ctx) => {
    if (!admins.includes(ctx.from.id)) return;
    adminState[ctx.from.id] = { step: 'editing_nagad' };
    ctx.reply('📞 নতুন Nagad নাম্বারটি লিখে পাঠান:');
});

bot.action('add_admin_panel', (ctx) => {
    if (!admins.includes(ctx.from.id)) return;
    adminState[ctx.from.id] = { step: 'adding_admin' };
    ctx.reply('👤 যে ইউজারকে এডমিন বানাতে চান তার Numerical Telegram ID টি লিখে পাঠান:');
});

bot.action('remove_admin_panel', (ctx) => {
    if (!admins.includes(ctx.from.id)) return;
    adminState[ctx.from.id] = { step: 'removing_admin' };
    ctx.reply('🗑 যে এডমিন আইডিটি রিমুভ করতে চান তা লিখে পাঠান:');
});

bot.action('go_deposit', (ctx) => {
    adminState[ctx.from.id] = { step: 'waiting_amount' };
    ctx.reply(`━━━━━━━━━━━━━━━━━━━━\n💳 **𝗗𝗘𝗣𝗢𝗦𝗜𝗧 𝗔𝗠𝗢𝗨𝗡𝗧**\n━━━━━━━━━━━━━━━━━━━━\n\nআপনি কত টাকা ডিপোজিট করতে চান?\nশুধু টাকার পরিমাণটি লিখে পাঠান।👇`);
});

bot.action('back_to_order', (ctx) => { 
    ctx.editMessageText('🏠 **Select your service.**', Markup.inlineKeyboard([
        [Markup.button.callback('TikTok Services', 'cat_TikTok'), Markup.button.callback('Telegram Services', 'cat_Telegram')],
        [Markup.button.callback('YouTube Services', 'cat_YouTube'), Markup.button.callback('FaceBook Services', 'cat_Facebook')],
        [Markup.button.callback('InstaGram Services', 'cat_Instagram'), Markup.button.callback('🌐 Premium service', 'premium_service')],
        [Markup.button.callback('↩️ Return', 'back_home')]
    ])); 
});

bot.action('premium_service', (ctx) => {
    ctx.answerCbQuery('Premium service ekhono available noy!', { show_alert: true });
});

bot.action('back_to_price', (ctx) => { 
    ctx.editMessageText('🐢 **Select category to see price:**', Markup.inlineKeyboard([[Markup.button.callback('Telegram', 'p_Telegram'), Markup.button.callback('Facebook', 'p_Facebook')], [Markup.button.callback('Instagram', 'p_Instagram'), Markup.button.callback('TikTok', 'p_TikTok')], [Markup.button.callback('YouTube', 'p_YouTube')]])); 
});

bot.action('back_home', (ctx) => { ctx.deleteMessage(); ctx.reply('🏠 Main Menu', mainKeyboard); });

http.createServer((req, res) => { res.write('Bot Active'); res.end(); }).listen(process.env.PORT || 3000);
bot.launch();
         
