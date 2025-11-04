import { Injectable } from '@nestjs/common';
import { Context, SessionFlavor, InlineKeyboard } from 'grammy';
import { ExpenseService } from 'src/api/expense/expense.service';
import { IncomeService } from 'src/api/income/income.service';
import { UserService } from 'src/api/user/user.service';
import { CategoryService } from 'src/api/category/category.service';
import { LimitService } from 'src/api/limit/limit.service';
import { ReportService } from 'src/api/report/report.service';

interface MySession {
  state?:
  | 'expense_title'
  | 'expense_category'
  | 'expense_amount'
  | 'income_source'
  | 'income_amount'
  | 'category_name'
  | 'category_icon'
  | 'limit_amount'
  | 'limit_category'
  | 'currency_select'
  | null;
  temp?: {
    title?: string;
    amount?: number;
    source?: string;
    category_id?: string;
    category_name?: string;
    icon?: string;
    limit_amount?: number;
    currency?: string;
    action?: string;
  };
}

type MyContext = Context & SessionFlavor<MySession>;

@Injectable()
export class BotUpdate {
  constructor(
    private readonly userService: UserService,
    private readonly expenseService: ExpenseService,
    private readonly incomeService: IncomeService,
    private readonly categoryService: CategoryService,
    private readonly limitService: LimitService,
    private readonly reportService: ReportService,
  ) { }

  // ============================================
  // 🏠 START KOMANDASI
  // ============================================
  async onStart(ctx: MyContext) {
    const from = ctx.from;
    await this.userService.createOrFindUser({
      telegram_id: String(from.id),
      first_name: from.first_name,
      last_name: from.last_name,
      username: from.username,
    });

    ctx.session.state = null;
    ctx.session.temp = {};

    const keyboard = new InlineKeyboard()
      .text('💸 Xarajat qo\'shish', 'add_expense')
      .text('💰 Daromad qo\'shish', 'add_income').row()
      .text('📊 Balans', 'balance')
      .text('📈 Hisobot', 'report').row()
      .text('📂 Kategoriyalar', 'categories')
      .text('⚙️ Sozlamalar', 'settings');

    await ctx.reply(
      `🎉 Salom, ${from.first_name}!\n\n` +
      `💼 Shaxsiy moliyaviy menejer botiga xush kelibsiz!\n\n` +
      `Bu bot sizga:\n` +
      `✅ Xarajatlaringizni kuzatishda\n` +
      `✅ Daromadlaringizni hisobga olishda\n` +
      `✅ Byudjetingizni boshqarishda yordam beradi\n\n` +
      `🔽 Quyidagi tugmalardan birini tanlang:`,
      { reply_markup: keyboard }
    );
  }

  // ============================================
  // 💸 XARAJAT QO'SHISH
  // ============================================
  async onAddExpense(ctx: MyContext) {
    ctx.session.state = 'expense_title';
    ctx.session.temp = {};

    const keyboard = new InlineKeyboard()
      .text('🔙 Orqaga', 'cancel');

    await ctx.reply(
      '💸 *Xarajat qo\'shish*\n\n' +
      '📝 Xarajat nomini kiriting:\n' +
      '_(Masalan: Sabzi, Taksi, Restoran)_',
      { reply_markup: keyboard, parse_mode: 'Markdown' }
    );
  }

  // ============================================
  // 💰 DAROMAD QO'SHISH
  // ============================================
  async onAddIncome(ctx: MyContext) {
    ctx.session.state = 'income_source';
    ctx.session.temp = {};

    const keyboard = new InlineKeyboard()
      .text('💼 Ish haqi', 'income_salary')
      .text('💵 Freelance', 'income_freelance').row()
      .text('🎁 Sovg\'a', 'income_gift')
      .text('📈 Investitsiya', 'income_investment').row()
      .text('✍️ Boshqa', 'income_other')
      .text('🔙 Orqaga', 'cancel');

    await ctx.reply(
      '💰 *Daromad qo\'shish*\n\n' +
      '📌 Daromad manbasini tanlang yoki yozing:',
      { reply_markup: keyboard, parse_mode: 'Markdown' }
    );
  }

  // ============================================
  // 📊 BALANS
  // ============================================
  async onBalance(ctx: MyContext) {
    const user = await this.userService.findByTelegramId(String(ctx.from.id));
    const totalIncome = await this.incomeService.getTotalIncome(user.id);
    const totalExpense = await this.expenseService.getTotalExpenses(user.id);
    const balance = totalIncome - totalExpense;

    const balanceIcon = balance >= 0 ? '💚' : '❌';
    const trend = balance >= 0 ? '📈' : '📉';

    const keyboard = new InlineKeyboard()
      .text('💸 Xarajat qo\'shish', 'add_expense')
      .text('💰 Daromad qo\'shish', 'add_income').row()
      .text('📈 Batafsil hisobot', 'report')
      .text('🏠 Bosh sahifa', 'start');

    await ctx.reply(
      `${balanceIcon} *BALANS MA'LUMOTI*\n\n` +
      `💵 Umumiy daromad: *${this.formatMoney(totalIncome)}*\n` +
      `💸 Umumiy xarajat: *${this.formatMoney(totalExpense)}*\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `${trend} Sof balans: *${this.formatMoney(balance)}*\n\n` +
      `📅 Hozirgi oy: ${this.getCurrentMonth()}`,
      { reply_markup: keyboard, parse_mode: 'Markdown' }
    );
  }

  // ============================================
  // 📈 HISOBOT
  // ============================================
  async onReport(ctx: MyContext) {
    const keyboard = new InlineKeyboard()
      .text('📅 Bugungi', 'report_today')
      .text('📆 Haftalik', 'report_week').row()
      .text('📊 Oylik', 'report_month')
      .text('📈 Yillik', 'report_year').row()
      .text('🏠 Bosh sahifa', 'start');

    await ctx.reply(
      '📈 *HISOBOT TURI*\n\n' +
      'Qaysi davr uchun hisobot olmoqchisiz?',
      { reply_markup: keyboard, parse_mode: 'Markdown' }
    );
  }

  async generateReport(ctx: MyContext, period: 'today' | 'week' | 'month' | 'year') {
    const user = await this.userService.findByTelegramId(String(ctx.from.id));
    const report = await this.reportService.generateReport(user.id, period);

    let periodName = {
      today: '🌅 Bugungi kun',
      week: '📆 Bu hafta',
      month: '📊 Bu oy',
      year: '📈 Bu yil'
    }[period];

    let message = `${periodName} *HISOBOT*\n\n`;
    message += `💰 Daromad: *${this.formatMoney(report.totalIncome)}*\n`;
    message += `💸 Xarajat: *${this.formatMoney(report.totalExpense)}*\n`;
    message += `━━━━━━━━━━━━━━━━━\n`;
    message += `💵 Sof: *${this.formatMoney(report.balance)}*\n\n`;

    if (report.expensesByCategory.length > 0) {
      message += `📂 *KATEGORIYALAR BO'YICHA:*\n\n`;
      report.expensesByCategory.forEach(cat => {
        const percentage = ((cat.total / report.totalExpense) * 100).toFixed(1);
        message += `${cat.icon || '📌'} ${cat.name}: ${this.formatMoney(cat.total)} (${percentage}%)\n`;
      });
    }

    const keyboard = new InlineKeyboard()
      .text('📥 Excel yuklash', `export_excel_${period}`)
      .text('🔙 Orqaga', 'report');

    await ctx.reply(message, {
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    });
  }

  // ============================================
  // 📂 KATEGORIYALAR
  // ============================================
  async onCategories(ctx: MyContext) {
    const user = await this.userService.findByTelegramId(String(ctx.from.id));
    const categories = await this.categoryService.findAll(user.id);

    const keyboard = new InlineKeyboard();

    categories.forEach(cat => {
      keyboard.text(`${cat.icon || '📌'} ${cat.name}`, `cat_${cat.id}`).row();
    });

    keyboard.text('➕ Yangi kategoriya', 'add_category')
      .text('🔙 Orqaga', 'start');

    await ctx.reply(
      '📂 *KATEGORIYALAR*\n\n' +
      'Kategoriyani tanlang yoki yangisini qo\'shing:',
      { reply_markup: keyboard, parse_mode: 'Markdown' }
    );
  }

  async onAddCategory(ctx: MyContext) {
    ctx.session.state = 'category_name';
    ctx.session.temp = {};

    const keyboard = new InlineKeyboard()
      .text('🔙 Orqaga', 'categories');

    await ctx.reply(
      '➕ *YANGI KATEGORIYA*\n\n' +
      '📝 Kategoriya nomini kiriting:',
      { reply_markup: keyboard, parse_mode: 'Markdown' }
    );
  }

  // ============================================
  // ⚙️ SOZLAMALAR
  // ============================================
  async onSettings(ctx: MyContext) {
    const user = await this.userService.findByTelegramId(String(ctx.from.id));

    const keyboard = new InlineKeyboard()
      .text('🚨 Limit belgilash', 'set_limit')
      .text('💱 Valyuta', 'change_currency').row()
      .text('🗑 Ma\'lumotlarni tozalash', 'clear_data')
      .text('🔙 Orqaga', 'start');

    await ctx.reply(
      '⚙️ *SOZLAMALAR*\n\n' +
      `👤 Foydalanuvchi: ${user.first_name}\n` +
      `💱 Valyuta: ${user.currency || 'UZS'}\n\n` +
      'Kerakli sozlamani tanlang:',
      { reply_markup: keyboard, parse_mode: 'Markdown' }
    );
  }



  // ============================================
  // 🚨 LIMIT TIZIMI
  // ============================================
  async onSetLimit(ctx: MyContext) {
    const user = await this.userService.findByTelegramId(String(ctx.from.id));
    const categories = await this.categoryService.findAll(user.id);

    const keyboard = new InlineKeyboard();

    categories.forEach(cat => {
      keyboard.text(`${cat.icon || '📌'} ${cat.name}`, `limit_cat_${cat.id}`).row();
    });

    keyboard.text('💰 Umumiy limit', 'limit_total')
      .text('🔙 Orqaga', 'settings');

    await ctx.reply(
      '🚨 *XARAJAT LIMITI*\n\n' +
      'Qaysi kategoriya uchun limit belgilaysiz?',
      { reply_markup: keyboard, parse_mode: 'Markdown' }
    );
  }

  async checkLimit(userId: string, categoryId: string, amount: number) {
    const limit = await this.limitService.getLimit(userId, categoryId);
    if (!limit) return null;

    const currentExpenses = await this.expenseService.getTotalExpensesByCategory(
      userId,
      categoryId
    );

    const newTotal = currentExpenses + amount;
    const percentage = (newTotal / limit.amount) * 100;

    if (percentage >= 100) {
      return {
        type: 'exceeded',
        message: `🚨 *OGOHLANTIRISH!*\n\nSiz belgilangan limitni oshirdingiz!\n\n` +
          `💰 Limit: ${this.formatMoney(limit.amount)}\n` +
          `💸 Xarajat: ${this.formatMoney(newTotal)}\n` +
          `❌ Oshiq: ${this.formatMoney(newTotal - limit.amount)}`
      };
    } else if (percentage >= 80) {
      return {
        type: 'warning',
        message: `⚠️ *DIQQAT!*\n\nSiz limitning ${percentage.toFixed(0)}% dan foydalandingiz!\n\n` +
          `💰 Limit: ${this.formatMoney(limit.amount)}\n` +
          `💸 Xarajat: ${this.formatMoney(newTotal)}\n` +
          `✅ Qolgan: ${this.formatMoney(limit.amount - newTotal)}`
      };
    }

    return null;
  }

  // ============================================
  // 📝 TEXT HANDLER
  // ============================================
  async onText(ctx: MyContext) {
    const state = ctx.session.state;
    if (!state) return;

    const user = await this.userService.findByTelegramId(String(ctx.from.id));
    const text = ctx.message?.text || '';

    try {
      switch (state) {
        // XARAJAT TITLE
        case 'expense_title':
          ctx.session.temp.title = text;
          ctx.session.state = 'expense_category';

          const categories = await this.categoryService.findAll(user.id);

          // ✅ Keyboard ni avval yaratib olamiz
          const categoryKeyboard = new InlineKeyboard();

          // ✅ Massiv bo'lishini tekshiramiz
          if (categories && categories.length > 0) {
            categories.slice(0, 12).forEach((cat, i) => {
              categoryKeyboard.text(`${cat.icon || '📌'} ${cat.name}`, `exp_cat_${cat.id}`);
              if ((i + 1) % 2 === 0) categoryKeyboard.row();
            });
          } else {
            // ✅ Agar kategoriyalar bo'lmasa
            categoryKeyboard.text('➕ Yangi kategoriya', 'add_category_inline');
          }

          categoryKeyboard.text('🔙 Bekor qilish', 'cancel');

          await ctx.reply(
            `📂 Kategoriya tanlang:\n\n` +
            `📝 Xarajat: *${text}*`,
            { reply_markup: categoryKeyboard, parse_mode: 'Markdown' }
          );
          break;

        // XARAJAT AMOUNT
        case 'expense_amount':
          const amount = Number(text.replace(/\s/g, ''));

          if (isNaN(amount) || amount <= 0) {
            await ctx.reply(
              '❌ Noto\'g\'ri summa!\n\n' +
              '💡 Iltimos, faqat raqam kiriting:\n' +
              '✅ To\'g\'ri: 50000\n' +
              '❌ Noto\'g\'ri: 50 ming'
            );
            return;
          }

          const { title, category_id } = ctx.session.temp;

          // Limit tekshirish
          const limitCheck = await this.checkLimit(user.id, category_id!, amount);

          await this.expenseService.createExpense({
            title: title!,
            amount,
            userId: user.id,
            category_id: category_id!,
          });

          const category = await this.categoryService.findOne(category_id!, user.id);

          let successMsg = `✅ *XARAJAT QO'SHILDI*\n\n` +
            `📝 Nom: ${title}\n` +
            `💸 Summa: ${this.formatMoney(amount)}\n` +
            `📂 Kategoriya: ${category.icon || '📌'} ${category.name}\n` +
            `📅 Sana: ${this.formatDate(new Date())}`;

          if (limitCheck) {
            successMsg += `\n\n${limitCheck.message}`;
          }

          const keyboard = new InlineKeyboard()
            .text('➕ Yana qo\'shish', 'add_expense')
            .text('📊 Balans', 'balance').row()
            .text('🏠 Bosh sahifa', 'start');

          await ctx.reply(successMsg, {
            reply_markup: keyboard,
            parse_mode: 'Markdown'
          });

          ctx.session.state = null;
          ctx.session.temp = {};
          break;

        // DAROMAD AMOUNT
        case 'income_amount':
          const incomeAmount = Number(text.replace(/\s/g, ''));

          if (isNaN(incomeAmount) || incomeAmount <= 0) {
            await ctx.reply('❌ Noto\'g\'ri summa! Iltimos, faqat raqam kiriting.');
            return;
          }

          const source = ctx.session.temp.source!;
          await this.incomeService.createIncome({
            source,
            amount: String(incomeAmount),
            userId: user.id,
          });

          const incomeKeyboard = new InlineKeyboard()
            .text('➕ Yana qo\'shish', 'add_income')
            .text('📊 Balans', 'balance').row()
            .text('🏠 Bosh sahifa', 'start');

          await ctx.reply(
            `✅ *DAROMAD QO'SHILDI*\n\n` +
            `💼 Manba: ${source}\n` +
            `💰 Summa: ${this.formatMoney(incomeAmount)}\n` +
            `📅 Sana: ${this.formatDate(new Date())}`,
            { reply_markup: incomeKeyboard, parse_mode: 'Markdown' }
          );

          ctx.session.state = null;
          ctx.session.temp = {};
          break;

        // KATEGORIYA NAME
        case 'category_name':
          ctx.session.temp.category_name = text;
          ctx.session.state = 'category_icon';

          const iconKeyboard = new InlineKeyboard()
            .text('🍔', 'icon_🍔').text('🚗', 'icon_🚗').text('🏠', 'icon_🏠').row()
            .text('💊', 'icon_💊').text('🎓', 'icon_🎓').text('🎮', 'icon_🎮').row()
            .text('👕', 'icon_👕').text('✈️', 'icon_✈️').text('💰', 'icon_💰').row()
            .text('⏭ O\'tkazib yuborish', 'icon_skip');

          await ctx.reply(
            `📂 Kategoriya: *${text}*\n\n` +
            `🎨 Ikon tanlang:`,
            { reply_markup: iconKeyboard, parse_mode: 'Markdown' }
          );
          break;

        // LIMIT AMOUNT
        case 'limit_amount':
          const limitAmount = Number(text.replace(/\s/g, ''));

          if (isNaN(limitAmount) || limitAmount <= 0) {
            await ctx.reply('❌ Noto\'g\'ri summa! Iltimos, faqat raqam kiriting.');
            return;
          }

          await this.limitService.setLimit({
            userId: user.id,
            category_id: ctx.session.temp.category_id,
            amount: limitAmount,
          });

          await ctx.reply(
            `✅ *LIMIT BELGILANDI*\n\n` +
            `💰 Summa: ${this.formatMoney(limitAmount)}\n\n` +
            `🚨 Limitdan 80% dan oshganda ogohlantiramiz!`,
            { parse_mode: 'Markdown' }
          );

          ctx.session.state = null;
          ctx.session.temp = {};
          break;
      }
    } catch (error) {
      console.error('Error in onText:', error);
      await ctx.reply(
        '❌ Xatolik yuz berdi!\n\n' +
        'Iltimos, qaytadan urinib ko\'ring yoki /start bosing.'
      );
      ctx.session.state = null;
      ctx.session.temp = {};
    }
  }

  // ============================================
  // 🔘 CALLBACK QUERY HANDLER
  // ============================================
  async onCallbackQuery(ctx: MyContext) {
    const data = ctx.callbackQuery?.data;
    if (!data) return;

    await ctx.answerCallbackQuery();

    try {
      // Start
      if (data === 'start') {
        await this.onStart(ctx);
      }
      // Add Expense
      else if (data === 'add_expense') {
        await this.onAddExpense(ctx);
      }
      // Add Income
      else if (data === 'add_income') {
        await this.onAddIncome(ctx);
      }
      // Balance
      else if (data === 'balance') {
        await this.onBalance(ctx);
      }
      // Report
      else if (data === 'report') {
        await this.onReport(ctx);
      }
      // Report Types
      else if (data.startsWith('report_')) {
        const period = data.split('_')[1] as 'today' | 'week' | 'month' | 'year';
        await this.generateReport(ctx, period);
      }
      // Categories
      else if (data === 'categories') {
        await this.onCategories(ctx);
      }
      // Add Category
      else if (data === 'add_category') {
        await this.onAddCategory(ctx);
      }
      // Settings
      else if (data === 'settings') {
        await this.onSettings(ctx);
      }
      // Set Limit
      else if (data === 'set_limit') {
        await this.onSetLimit(ctx);
      }
      // Ma'lumotlarni tozalash
      else if (data === 'clear_data') {
        const user = await this.userService.findByTelegramId(String(ctx.from.id));
        if (!user) {
          await ctx.reply('❌ Foydalanuvchi topilmadi.');
          return;
        }

        try {
          await this.expenseService.clearUserExpenses(user.id);
          await this.incomeService.clearUserIncomes(user.id)
          await this.limitService.clearLimits(user.id);
          await this.reportService.clearUserData(user.id);
          await this.categoryService.clearUserCategories(user.id)

          await ctx.reply(
            '✅ Barcha ma\'lumotlaringiz tozalandi!',
            { parse_mode: 'Markdown' }
          );

          await this.onSettings(ctx);
        } catch (error) {
          console.error('Error clearing data:', error);
          await ctx.reply('❌ Ma\'lumotlarni tozalashda xatolik yuz berdi!');
        }
      }

      // Expense Category Selected
      else if (data.startsWith('exp_cat_')) {
        const categoryId = data.replace('exp_cat_', '');
        ctx.session.temp.category_id = categoryId;
        ctx.session.state = 'expense_amount';

        await ctx.reply(
          '💰 Summasini kiriting:\n\n' +
          '💡 Masalan: 50000',
          { parse_mode: 'Markdown' }
        );
      }
      // Income Source Selected
      else if (data.startsWith('income_')) {
        const sources = {
          income_salary: '💼 Ish haqi',
          income_freelance: '💵 Freelance',
          income_gift: '🎁 Sovg\'a',
          income_investment: '📈 Investitsiya',
          income_other: '✍️ Boshqa',
        };

        ctx.session.temp.source = sources[data] || 'Boshqa';
        ctx.session.state = 'income_amount';

        await ctx.reply(
          '💰 Summasini kiriting:\n\n' +
          '💡 Masalan: 5000000'
        );
      }
      // Icon Selected
      else if (data.startsWith('icon_')) {
        const icon = data === 'icon_skip' ? '📌' : data.replace('icon_', '');
        const user = await this.userService.findByTelegramId(String(ctx.from.id));

        await this.categoryService.create(user, {
          name: ctx.session.temp.category_name!,
          icon,
        });

        await ctx.reply(
          `✅ Kategoriya yaratildi!\n\n` +
          `${icon} ${ctx.session.temp.category_name}`,
          { parse_mode: 'Markdown' }
        );

        ctx.session.state = null;
        ctx.session.temp = {};

        await this.onCategories(ctx);
      }
      // Limit Category Selected
      else if (data.startsWith('limit_cat_')) {
        const categoryId = data.replace('limit_cat_', '');
        ctx.session.temp.category_id = categoryId;
        ctx.session.state = 'limit_amount';

        await ctx.reply(
          '💰 Limit summasini kiriting:\n\n' +
          '💡 Masalan: 1000000 (1 million so\'m)'
        );
      }
      // Cancel
      else if (data === 'cancel') {
        ctx.session.state = null;
        ctx.session.temp = {};
        await ctx.reply('❌ Bekor qilindi');
        await this.onStart(ctx);
      }
    } catch (error) {
      console.error('Error in onCallbackQuery:', error);
      await ctx.reply('❌ Xatolik yuz berdi! Iltimos, qaytadan urinib ko\'ring.');
    }
  }

  // ============================================
  // 🛠 HELPER FUNCTIONS
  // ============================================
  private formatMoney(amount: number): string {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('uz-UZ', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private getCurrentMonth(): string {
    return new Intl.DateTimeFormat('uz-UZ', {
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  }
}