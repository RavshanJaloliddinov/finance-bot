import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot, session } from 'grammy';
import { BotUpdate } from './bot.update';
import { MyContext, MySession } from './bot.context';
import { config } from 'src/config';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Bot<MyContext>;

  constructor(
    private readonly botUpdate: BotUpdate,
  ) {
    const token = config.BOT_TOKEN;
    this.bot = new Bot<MyContext>(token);
  }

  async onModuleInit() {
    // Sessiya middleware
    this.bot.use(
      session<MySession, MyContext>({
        initial: () => ({
          state: null,
          temp: {},
        }),
      }),
    );

    // Xato handler
    this.bot.catch((err) => {
      console.error('Bot xatosi:', err);
    });

    // ============================================
    // KOMANDALAR
    // ============================================

    // Start
    this.bot.command('start', async (ctx) => {
      await this.botUpdate.onStart(ctx);
    });

    // Xarajat qo'shish
    this.bot.command('add_expense', async (ctx) => {
      await this.botUpdate.onAddExpense(ctx);
    });

    // Daromad qo'shish
    this.bot.command('add_income', async (ctx) => {
      await this.botUpdate.onAddIncome(ctx);
    });

    // Balans
    this.bot.command('balance', async (ctx) => {
      await this.botUpdate.onBalance(ctx);
    });

    // Hisobot
    this.bot.command('report', async (ctx) => {
      await this.botUpdate.onReport(ctx);
    });

    // Kategoriyalar
    this.bot.command('categories', async (ctx) => {
      await this.botUpdate.onCategories(ctx);
    });

    // Sozlamalar
    this.bot.command('settings', async (ctx) => {
      await this.botUpdate.onSettings(ctx);
    });

    // Yordam
    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        '📚 *YORDAM*\n\n' +
        '*Asosiy komandalar:*\n' +
        '/start - Botni ishga tushirish\n' +
        '/add_expense - Xarajat qo\'shish\n' +
        '/add_income - Daromad qo\'shish\n' +
        '/balance - Balansni ko\'rish\n' +
        '/report - Hisobot olish\n' +
        '/categories - Kategoriyalar\n' +
        '/settings - Sozlamalar\n\n' +
        '*Qo\'shimcha:*\n' +
        '💡 Telegram tugmalaridan foydalaning\n' +
        '💡 Summa kiritganda faqat raqam yozing\n' +
        '💡 Limit belgilash orqali xarajatni nazorat qiling',
        { parse_mode: 'Markdown' }
      );
    });

    // Bekor qilish
    this.bot.command('cancel', async (ctx) => {
      ctx.session.state = null;
      ctx.session.temp = {};
      await ctx.reply('❌ Jarayon bekor qilindi');
      await this.botUpdate.onStart(ctx);
    });

    // ============================================
    // CALLBACK QUERY (tugmalar)
    // ============================================
    this.bot.on('callback_query:data', async (ctx) => {
      await this.botUpdate.onCallbackQuery(ctx);
    });

    // ============================================
    // MATN HANDLER
    // ============================================
    this.bot.on('message:text', async (ctx) => {
      await this.botUpdate.onText(ctx);
    });

    // ============================================
    // BOT MENYU SOZLASH
    // ============================================
    await this.bot.api.setMyCommands([
      { command: 'start', description: 'Botni ishga tushirish' },
      { command: 'add_expense', description: 'Xarajat qo\'shish' },
      { command: 'add_income', description: 'Daromad qo\'shish' },
      { command: 'balance', description: 'Balansni ko\'rish' },
      { command: 'report', description: 'Hisobot olish' },
      { command: 'categories', description: 'Kategoriyalar' },
      { command: 'settings', description: 'Sozlamalar' },
      { command: 'help', description: 'Yordam' },
      { command: 'cancel', description: 'Bekor qilish' },
    ]);

    // ============================================
    // BOT TAVSIFI
    // ============================================
    await this.bot.api.setMyDescription(
      '💰 Shaxsiy moliyaviy menejer boti\n\n' +
      '✅ Xarajatlar va daromadlarni boshqaring\n' +
      '✅ Byudjetingizni nazorat qiling\n' +
      '✅ Batafsil hisobotlar oling\n\n' +
      '/start - Boshlash uchun'
    );

    await this.bot.api.setMyShortDescription(
      '💰 Moliyaviy menejer boti - xarajat va daromadlarni boshqarish'
    );

    // Botni ishga tushirish
    await this.bot.start({
      onStart: (botInfo) => {
        console.log(`✅ Bot ishga tushdi: @${botInfo.username}`);
      },
    });

    console.log('🤖 Bot tayyor!');
  }

  getBot(): Bot<MyContext> {
    return this.bot;
  }

  async sendNotification(telegramId: string, message: string) {
    try {
      await this.bot.api.sendMessage(telegramId, message, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Bildirishnoma xatosi:', error);
    }
  }
}