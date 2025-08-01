import { ConfigService } from '@nestjs/config'

export const isDev = (configService: ConfigService) =>
	configService.getOrThrow('NODE_ENV') === 'development'

export const IS_DEV_ENV = process.env.NODE_ENV === 'development'
