const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// Updated with your new bot token
const bot = new Telegraf('8255693337:AAEOHh2xoiOwoR-K3ndLGtui8dmbGcgVlJ0');

// Initial setup with your primary account as global supervisor
let admins = [7488161246]; 
let adminState = {};
const ADMIN_GROUP_ID = -1003893464734; // Your Dedicated Admin Verification Group ID

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
    'Telegram': "🔵 𝗧𝗘𝗟𝗘𝗚𝗥𝗔ม\n\n👁️ 1K Views — 1 Taka\n❤️ 1K Reacts — 8 Taka\n👥 1K Members — 15 Taka",
    'Facebook': "🔷 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞\n\n🎥 1K Video Views — 5 Tk\n👤 1K Followers — 30 Taka\n😍 1K Reactions — 15 TK",
    'Instagram': "🟣 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠\n\n👁️ 1K Views — 1 Taka\n❤️ 1K Likes — 20 Taka\n⭐ 1K Followers — 45 Taka",
    'TikTok': "⚫ 𝗧𝗜𝗞𝗧𝗢𝗞\n\n👁️ 1K Views — 3 Taka\n👍 1K Likes — 10 Taka\n⭐ 1K Followers — 150 Tk",
    'YouTube': "🔴 𝗬𝗢𝗨𝗧𝗨𝗕𝗘\n\n👍 1K Likes — 60 Taka\n🔔 1K Subscribers — 140 Tk\n▶️ 1K Views — 120 Taka"
};

// 1K Dynamic Base Rate Configuration Mapping (For precise per-unit deduction)
const serviceRates = {
    'TG_Views': 1.0, 'TG_Reacts': 8.0, 'TG_Members': 15.0, 'TG_Combo': 10.0,
    'FB_Views': 5.0, 'FB_Followers': 30.0, 'FB_Reacts': 15.0, 'fbreact_love': 15.0, 'fbreact_like': 15.0,
    'IG_Views': 1.0, 'IG_Likes': 20.0, 'IG_Followers': 45.0,
    'TT_Views': 3.0, 'TT_Likes': 10.0, 'TT_Followers': 150.0,
    'YT_Views': 120.0, 'YT_Likes': 60.0, 'YT_Subs': 140.0
};

// --- CORE SYSTEM DASHBOARD KEYBOARD LAYOUTS ---
const mainKeyboard = Markup.keyboard([
    ['Order'],
    ['Deposit', 'Balance'],
    ['Support', 'Price & Info'],
    ['Premium service']
]).resize();

const platformKeyboard = Markup.keyboard([
    ['TikTok Services', 'Telegram Services'],
    ['YouTube Services', 'FaceBook Services'],
    ['InstaGram Services', '🌐 Premium service'],
    ['↩️ Return Dashboard']
]).resize();

const tiktokKeyboard = Markup.keyboard([
    ['✅ TikTok Views 📈', '✅ TikTok Likes ❤️'],
    ['✅ TikTok Followers 👥'],
    ['↩️ Back to Category']
]).resize();

const telegramKeyboard = Markup.keyboard([
    ['✅ Telegram Members 👥', '✅ Telegram Views 👁️'],
    ['✅ Telegram Reactions 😍', 'Telegram Combo Pack 🎁'],
    ['↩️ Back to Category']
]).resize();

const youtubeKeyboard = Markup.keyboard([
    ['✅ YouTube Views 📈', '✅ YouTube Likes 👍'],
    ['✅ YouTube Subscribers 👥'],
    ['↩️ Back to Category']
]).resize();

const facebookKeyboard = Markup.keyboard([
    ['✅ Facebook Reacts ❤️', '✅ Facebook Followers 👥'],
    ['✅ Facebook Views 📈'],
    ['↩️ Back to Category']
]).resize();

const instagramKeyboard = Markup.keyboard([
    ['✅ Instagram Likes ❤️', '✅ Instagram Followers 👥'],
    ['✅ Instagram Views 👁️'],
    ['↩️ Back to Category']
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

    const balanceMsg = `💳 ▬▬▬▬▬▬▬▬▬▬\n     **অ্যাকাউন্ট ব্যালেন্স**\n▬▬▬▬▬▬▬▬▬▬▬\n\n👤 **নাম :** ${name}\n💰 **বর্তমান ব্যালেন্স :** ${parseFloat(stats.balance).toFixed(2)} টাকা\n📦 **Total Orders :** ${stats.orders}\n💵 **Total Spent :** ${parseFloat(stats.spent).toFixed(2)} টাকা\n\n▬▬▬▬▬▬▬▬▬▬▬`;

    ctx.reply(balanceMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('💸 ডিপোজিট করুন', 'go_deposit')]])
    });
});

// --- 3. DYNAMIC DASHBOARD REPLACEMENT SWITCHES ---
bot.hears('Order', (ctx) => {
    ctx.reply('🏠 **Select your platform category below:**', platformKeyboard);
});

bot.hears('↩️ Return Dashboard', (ctx) => {
    ctx.reply('🏠 **Main Dashboard Menu:**', mainKeyboard);
});

bot.hears('↩️ Back to Category', (ctx) => {
    ctx.reply('🏠 **Select your platform category below:**', platformKeyboard);
});

bot.hears('TikTok Services', (ctx) => {
    ctx.reply('🔥 **TikTok Services Menu:**', tiktokKeyboard);
});

bot.hears('Telegram Services', (ctx) => {
    ctx.reply('🔥 **Telegram Services Menu:**', telegramKeyboard);
});

bot.hears('YouTube Services', (ctx) => {
    ctx.reply('🔥 **YouTube Services Menu:**', youtubeKeyboard);
});

bot.hears('FaceBook Services', (ctx) => {
    ctx.reply('🔥 **FaceBook Services Menu:**', facebookKeyboard);
});

bot.hears('InstaGram Services', (ctx) => {
    ctx.reply('🔥 **InstaGram Services Menu:**', instagramKeyboard);
});

bot.hears('🌐 Premium service', (ctx) => {
    ctx.reply('Premium service ekhono available noy!');
});

// --- CORE INTERNAL ROUTING VIA TEXT INTERCEPT ---
function triggerOrderFlow(ctx, serviceLabel, subCat, promptMsg) {
    const userId = ctx.from.id;
    adminState[userId] = { step: 'waiting_order_link', serviceName: serviceLabel, serviceKey: subCat };
    ctx.reply(promptMsg);
}

// Service Action Mappings for physical keyboard buttons
bot.hears('✅ TikTok Views 📈', (ctx) => triggerOrderFlow(ctx, 'TikTok Views', 'TT_Views', '❯ Enter Your Post Link'));
bot.hears('✅ TikTok Likes ❤️', (ctx) => triggerOrderFlow(ctx, 'TikTok Likes', 'TT_Likes', '❯ Enter Your Post Link'));
bot.hears('✅ TikTok Followers 👥', (ctx) => triggerOrderFlow(ctx, 'TikTok Followers', 'TT_Followers', '❯ Enter Your Profile Link'));

bot.hears('✅ Telegram Members 👥', (ctx) => triggerOrderFlow(ctx, 'Telegram Members', 'TG_Members', '❯ Enter Your Channel Or Group Link'));
bot.hears('✅ Telegram Views 👁️', (ctx) => triggerOrderFlow(ctx, 'Telegram Views', 'TG_Views', '❯ Enter Your Post Link'));
bot.hears('✅ Telegram Reactions 😍', (ctx) => triggerOrderFlow(ctx, 'Telegram Reactions', 'TG_Reacts', '❯ Enter Your Post Link'));
bot.hears('Telegram Combo Pack 🎁', (ctx) => triggerOrderFlow(ctx, 'Telegram Combo Pack', 'TG_Combo', 'Reacts+Views 1k 10 Taka (Life Time) Super Fast service 💥\n\n❯ আপনার পোস্ট লিঙ্ক দেন 👇🏻'));

bot.hears('✅ YouTube Views 📈', (ctx) => triggerOrderFlow(ctx, 'YouTube Views', 'YT_Views', '❯ Enter Your Post Link'));
bot.hears('✅ YouTube Likes 👍', (ctx) => triggerOrderFlow(ctx, 'YouTube Likes', 'YT_Likes', '❯ Enter Your Post Link'));
bot.hears('✅ YouTube Subscribers 👥', (ctx) => triggerOrderFlow(ctx, 'YouTube Subscribers', 'YT_Subs', '❯ Enter Your Channel Link'));

bot.hears('✅ Facebook Followers 👥', (ctx) => triggerOrderFlow(ctx, 'Facebook Followers', 'FB_Followers', '❯ Enter Your Profile/Page Link'));
bot.hears('✅ Facebook Views 📈', (ctx) => triggerOrderFlow(ctx, 'Facebook Views', 'FB_Views', '❯ Enter Your Post Link'));
bot.hears('✅ Facebook Reacts ❤️', (ctx) => {
    ctx.reply('🎭 **Select Reaction Type:**', Markup.inlineKeyboard([
        [Markup.button.callback('1. love💖', 'fbreact_love'), Markup.button.callback('2. like👍', 'fbreact_like')],
        [Markup.button.callback('↩️ Return Dashboard', 'back_home_inline')]
    ]));
});

bot.hears('✅ Instagram Likes ❤️', (ctx) => triggerOrderFlow(ctx, 'Instagram Likes', 'IG_Likes', '❯ Enter Your Post Link'));
bot.hears('✅ Instagram Followers 👥', (ctx) => triggerOrderFlow(ctx, 'Instagram Followers', 'IG_Followers', '❯ Enter Your Profile Link'));
bot.hears('✅ Instagram Views 👁️', (ctx) => triggerOrderFlow(ctx, 'Instagram Views', 'IG_Views', '❯ Enter Your Post Link'));

// Facebook React Inline Interceptors
bot.action('fbreact_love', (ctx) => {
    adminState[ctx.from.id] = { step: 'waiting_order_link', serviceName: 'FB Reacts (Love💖)', serviceKey: 'fbreact_love' };
    ctx.reply('❯ Enter Your Post Link');
});
bot.action('fbreact_like', (ctx) => {
    adminState[ctx.from.id] = { step: 'waiting_order_link', serviceName: 'FB Reacts (Like👍)', serviceKey: 'fbreact_like' };
    ctx.reply('❯ Enter Your Post Link');
});
bot.action('back_home_inline', (ctx) => { ctx.deleteMessage(); });

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

// --- 5. TEXT INPUT HANDLER ---
bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    const msg = ctx.message.text;

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

    // Admin state updates processing
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

    // Order Link step -> Proceed to ask Quantity
    if (adminState[userId] && adminState[userId].step === 'waiting_order_link') {
        adminState[userId] = { 
            step: 'waiting_order_quantity', 
            link: msg, 
            serviceName: adminState[userId].serviceName || 'Unknown Service',
            serviceKey: adminState[userId].serviceKey
        };
        return ctx.reply('❯ Enter Quantity (পরিমাণ লিখুন):');
    }

    // Order Quantity step
    if (adminState[userId] && adminState[userId].step === 'waiting_order_quantity') {
        const qty = parseInt(msg);
        if (isNaN(qty)) return ctx.reply('❌ সঠিক পরিমাণ সংখ্যায় লিখুন।');
        if (qty < 100) return ctx.reply('❌ Minimum quantity is 100! Please enter 100 or more.');
        
        const sKey = adminState[userId].serviceKey || 'TG_Views';
        const base1kRate = parseFloat(serviceRates[sKey] || 5.0);
        const structuralCost = parseFloat((base1kRate * qty) / 1000);

        if (!userStats[userId]) userStats[userId] = { balance: 2.00, orders: 0, spent: 0.00 };
        
        let currentBalance = parseFloat(userStats[userId].balance || 0);
        
        if (currentBalance < structuralCost) {
            delete adminState[userId]; 
            return ctx.reply(`❌ Order failed! Insufficient balance.\nRequired: ${structuralCost.toFixed(2)} Tk\nYour Balance: ${currentBalance.toFixed(2)} Tk`);
        }

        // Safe Deduction logic execution 
        userStats[userId].balance = parseFloat((currentBalance - structuralCost).toFixed(4));
        userStats[userId].spent = parseFloat((parseFloat(userStats[userId].spent || 0) + structuralCost).toFixed(4));
        userStats[userId].orders += 1;

        const generatedOrderId = Math.floor(100000 + Math.random() * 900000);

        const orderSuccessMsg = `✅ ❯ Order received. Processing now\n\n🆔 Order ID: ${generatedOrderId}\n📦 Quantity: ${qty}\n📊 Status: ⏳ Processing\n\n━━━━━━━━━━━━━━━━━━\n📢 Join Our Order Channel\n➜ @nhautozone`;
        ctx.reply(orderSuccessMsg);

        const groupPayload = `📦 **NEW INCOMING ORDER**\n━━━━━━━━━━━━━━━━━━\n👤 **User ID:** \`${userId}\`\n🆔 **Order ID:** \`${generatedOrderId}\`\n🔗 **Link:** ${adminState[userId].link}\n📊 **Quantity:** ${qty}\nStatus: ⏳ Pending Verification\n${adminState[userId].serviceName}\n💰 Cost: ${structuralCost.toFixed(2)} Tk`;
        
        bot.telegram.sendMessage(ADMIN_GROUP_ID, groupPayload, Markup.inlineKeyboard([
            [Markup.button.callback('✅ Confirm', `approve_${userId}_${generatedOrderId}`), Markup.button.callback('🚫 Cancel', `reject_${userId}_${generatedOrderId}_cost_${structuralCost.toFixed(4)}`)]
        ])).catch(e => console.log("Group message delivery error:", e.message));

        delete adminState[userId];
        return;
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
        
        const safeAmount = parseFloat(adminState[userId].amount).toFixed(2);
        const depositGroupPayload = `💵 **NEW INCOMING DEPOSIT REQUEST**\n━━━━━━━━━━━━━━━━━━━━━━━━\n👤 **User ID:** \`${userId}\`\n👤 **Name:** ${ctx.from.first_name}\n💰 **Amount:** ${safeAmount} ৳\n🧾 **Invoice ID:** \`${adminState[userId].orderId}\`\n🔑 **Trx ID:** \`${msg}\`\nStatus: ⏳ Waiting Admin Approval`;
        
        bot.telegram.sendMessage(ADMIN_GROUP_ID, depositGroupPayload, Markup.inlineKeyboard([
            [Markup.button.callback('✅ Confirm Deposit', `dpok_${userId}_${safeAmount}`), Markup.button.callback('🚫 Cancel Deposit', `dpno_${userId}`)]
        ])).catch(e => console.log("Deposit group routing error:", e.message));
        
        delete adminState[userId];
        return;
    }
});

// --- INTERCEPTOR FOR ADMIN VALIDATION GROUP ACTIONS ---
bot.action(/approve_(.+)_(.+)/, (ctx) => {
    const targetUserId = ctx.match[1];
    const orderId = ctx.match[2];

    const customerReceipt = `🎉YOUR_ORDER_COMPLETE🎉\n\nORDER_ID: ${orderId}\n\nTHANKS FOR ORDER`;
    bot.telegram.sendMessage(targetUserId, customerReceipt).catch(e => console.log(e.message));

    ctx.editMessageText(`${ctx.callbackQuery.message.text}\n\n📢 **Status:** ✅ Approved / Completed by Admin.`);
    ctx.answerCbQuery('Order successfully confirmed!', { show_alert: false });
});

bot.action(/reject_(.+)_(.+)_cost_(.+)/, (ctx) => {
    const targetUserId = ctx.match[1];
    const orderId = ctx.match[2];
    const refundAmount = parseFloat(ctx.match[3] || 0);

    if (!userStats[targetUserId]) userStats[targetUserId] = { balance: 2.00, orders: 0, spent: 0.00 };
    
    let oldBalance = parseFloat(userStats[targetUserId].balance || 0);
    let oldSpent = parseFloat(userStats[targetUserId].spent || 0);
    
    userStats[targetUserId].balance = parseFloat((oldBalance + refundAmount).toFixed(4));
    userStats[targetUserId].spent = parseFloat(Math.max(0, oldSpent - refundAmount).toFixed(4));
    if (userStats[targetUserId].orders > 0) userStats[targetUserId].orders -= 1;

    bot.telegram.sendMessage(targetUserId, `❌ Your Order ID: ${orderId} has been cancelled by administrator.\n💰 ${refundAmount.toFixed(2)} Tk has been refunded back to your account balance!`).catch(e => console.log(e.message));

    ctx.editMessageText(`${ctx.callbackQuery.message.text}\n\n📢 **Status:** 🚫 Cancelled & Balance Refunded by Admin.`);
    ctx.answerCbQuery(`Order cancelled. ${refundAmount.toFixed(2)} Tk refunded!`, { show_alert: true });
});

// --- DEPOSIT SYSTEM ACTION INTERCEPTORS ---
bot.action(/dpok_(.+)_(.+)/, (ctx) => {
    const targetUserId = ctx.match[1];
    const creditAmount = parseFloat(ctx.match[2] || 0);

    if (!userStats[targetUserId]) userStats[targetUserId] = { balance: 2.00, orders: 0, spent: 0.00 };
    
    let currentBalance = parseFloat(userStats[targetUserId].balance || 0);
    userStats[targetUserId].balance = parseFloat((currentBalance + creditAmount).toFixed(4));

    bot.telegram.sendMessage(targetUserId, `💰 **আপনার ডিপোজিট সফল হয়েছে!**\n✅ ${creditAmount.toFixed(2)} টাকা আপনার ব্যালেন্সে যোগ করা হয়েছে।`).catch(e => console.log(e.message));

    ctx.editMessageText(`${ctx.callbackQuery.message.text}\n\n📢 **Deposit Status:** 🟢 Verified & Confirmed by Admin.`);
    ctx.answerCbQuery('Deposit balance credited successfully!', { show_alert: true });
});

bot.action(/dpno_(.+)/, (ctx) => {
    const targetUserId = ctx.match[1];

    bot.telegram.sendMessage(targetUserId, `❌ **আপনার ডিপোজিট রিকোয়েস্ট বাতিল করা হয়েছে!**\nদয়া করে সঠিক ট্রানজেকশন আইডি দিয়ে আবার চেষ্টা করুন বা সাপোর্টে যোগাযোগ করুন।`).catch(e => console.log(e.message));

    ctx.editMessageText(`${ctx.callbackQuery.message.text}\n\n📢 **Deposit Status:** 🔴 Rejected / Invalid Trx by Admin.`);
    ctx.answerCbQuery('Deposit request rejected.', { show_alert: false });
});

// --- 6. ADMIN COMMAND PANEL ---
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

bot.action('back_to_price', (ctx) => { 
    ctx.editMessageText('🐢 **Select category to see price:**', Markup.inlineKeyboard([[Markup.button.callback('Telegram', 'p_Telegram'), Markup.button.callback('Facebook', 'p_Facebook')], [Markup.button.callback('Instagram', 'p_Instagram'), Markup.button.callback('TikTok', 'p_TikTok')], [Markup.button.callback('YouTube', 'p_YouTube')]])); 
});

http.createServer((req, res) => { res.write('Bot Active'); res.end(); }).listen(process.env.PORT || 3000);
bot.launch();
