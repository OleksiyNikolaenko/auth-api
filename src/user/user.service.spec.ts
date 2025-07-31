import { Test, TestingModule } from '@nestjs/testing'

import { UserService } from './user.service'
import { PrismaService } from '../prisma/prisma.service'

const db = {
	user:{

	}
}

describe('UserService', () => {
	let service: UserService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UserService,{
				provide:PrismaService,
				useValue:db
			}]
		}).compile()

		service = module.get<UserService>(UserService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})
