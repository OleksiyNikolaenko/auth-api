import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env'
		})
	],
	controllers: [],
	providers: []
})
export class AppModule {}
