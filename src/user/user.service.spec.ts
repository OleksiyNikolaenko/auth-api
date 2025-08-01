import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuid } from 'uuid'

import { Prisma } from '../../generated/prisma'
import { PrismaService } from '../prisma/prisma.service'

import { UserService } from './user.service'

const id = uuid()

const user = {
	id,
	name: 'User1',
	email: 'user1@example.com',
	avatar: '',
	role: 'REGULAR',
	isVerified: true,
	isTwoFactorEnabled: true,
	createdAt: expect.any(Date),
	updatedAt: expect.any(Date)
}

const prisma = {
	user: {
		findUniqueOrThrow: jest.fn()
	}
}

describe('UserService', () => {
	let service: UserService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: PrismaService,
					useValue: prisma
				}
			]
		}).compile()

		service = module.get<UserService>(UserService)

		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('getById', async () => {
		it('should return BadRequestException if id does not uuid', async () => {
			await expect(service.findById('id')).rejects.toThrow(
				BadRequestException
			)
		})

		it('should throw NotFoundException if user by id does not exist', async () => {
			const validUuid = 'b8f4e5a7-1d8e-4e78-b39b-bb43e1d776a2'

			prisma.user.findUniqueOrThrow.mockRejectedValue(
				new Prisma.PrismaClientKnownRequestError('Recors not found', {
					code: 'P2025',
					clientVersion: ''
				})
			)

			await expect(service.findById(validUuid)).rejects.toThrow(
				NotFoundException
			)
		})

		it('should return user', async () => {
			prisma.user.findUniqueOrThrow.mockResolvedValue(user)

			expect(service.findById(id)).resolves.toEqual(user)
		})
	})
})
