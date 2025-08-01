import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { RedisStore } from 'connect-redis'
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session'
import IORedis from 'ioredis'

import { AppModule } from './app.module'
import { ms, StringValue } from './shared/utils/ms.util'
import { parseBoolean } from './shared/utils/parse-boolean.util'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)

	const redis = new IORedis({
		host: config.getOrThrow<string>('REDIS_HOST'),
		password: config.getOrThrow<string>('REDIS_PASSWORD'),
		port: config.getOrThrow<number>('REDIS_PORT')
	})

	app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	)

	app.use(
		session({
			secret: config.getOrThrow<string>('SESSION_SECRET'),
			name: config.getOrThrow<string>('SESSION_NAME'),
			resave: true,
			saveUninitialized: false,
			cookie: {
				domain: config.getOrThrow<string>('SESSION_DOMAIN'),
				maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
				httpOnly: parseBoolean(
					config.getOrThrow<string>('SESSION_HTTP_ONLY')
				),
				secure: parseBoolean(
					config.getOrThrow<string>('SESSION_SECURE')
				),
				sameSite: 'lax'
			},
			store: new RedisStore({
				client: redis,
				prefix: config.getOrThrow<string>('SESSION_FOLDER')
			})
		})
	)
	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
		credentials: true,
		exposedHeader: ['set-cookie']
	})

	await app.listen(config.getOrThrow<number>('APPLICATION_PORT'), () => {
		console.log(
			`API started from port: ${config.getOrThrow<number>('APPLICATION_PORT')}`
		)
	})
}
bootstrap().catch(e => console.log(e))
