import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv'

dotenv.config()

export type ConfigType = {
	PORT: number;
	DB_URL: string;
	BOT_TOKEN: string;
}

const requiredVariables = [
	'PORT',
	'DEV_DB_URL',
	'PROD_DB_URL',
	'BOT_TOKEN',
]

const missingVariables = requiredVariables.filter((variable => {
	const value = process.env[variable];
	return !value || value.trim() === "";
}))

if (missingVariables.length > 0) {
	Logger.error(`Missing or empty required environment variables: ${missingVariables.join(", ")}`)
	process.exit()
}

export const config: ConfigType = {
	PORT: parseInt(process.env.PORT!),
	DB_URL: process.env.NODE_ENV === 'dev'
		? (process.env.DEV_DB_URL!)
		: (process.env.PROD_DB_URL!),
	BOT_TOKEN: process.env.BOT_TOKEN!,
}