import { Context, SessionFlavor } from 'grammy';

export type BotState =
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

export interface MySession {
    state: BotState;
    temp: Record<string, any>;
}

export type MyContext = Context & SessionFlavor<MySession>;