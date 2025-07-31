import { Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Module({
	imports:[],
	exports:[PrismaService]
})
export class PrismaModule {}