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
	avatar: null,
	role: 'REGULAR',
	isVerified: true,
	isTwoFactorEnabled: true,
	createdAt: expect.any(Date),
	updatedAt: expect.any(Date)
}

const prisma = {
	user: {
		findUniqueOrThrow: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn()
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

	describe('getById', () => {
		it('should return BadRequestException if id does not uuid', async () => {
			await expect(service.findById('id')).rejects.toThrow(
				BadRequestException
			)
		})

		it('should throw NotFoundException if user by id does not exist', async () => {
			prisma.user.findUniqueOrThrow.mockRejectedValue(
				new Prisma.PrismaClientKnownRequestError('Record not found', {
					code: 'P2025',
					clientVersion: ''
				})
			)

			await expect(service.findById(id)).rejects.toThrow(
				NotFoundException
			)
		})

		it('should return user', async () => {
			prisma.user.findUniqueOrThrow.mockResolvedValue(user)

			await expect(service.findById(id)).resolves.toEqual(user)
		})
	})

	describe('getAllUsers', () => {
		const users = [user]

		it('should return an array of users', async () => {
			prisma.user.findMany.mockResolvedValue(users)

			await expect(service.getAllUsers()).resolves.toEqual(users)
		})

		it('should return an empty array if users not found', async () => {
			prisma.user.findMany.mockResolvedValue([])

			await expect(service.getAllUsers()).resolves.toEqual([])
		})
	})

	describe('create', () => {
		const createUserDTO = {
			name: 'User1',
			email: 'user1@example.com',
			password: 'supersecret'
		}

		it('should return user after create', async () => {
			prisma.user.create.mockResolvedValue(user)

			await expect(service.create(createUserDTO)).resolves.toEqual(user)
		})

		it('should return ConflictException if email is already taken', async () => {
			prisma.user.create.mockRejectedValue(
				new Prisma.PrismaClientKnownRequestError('Record not found', {
					code: 'P2002',
					clientVersion: ''
				})
			)

			await expect(service.create(createUserDTO)).rejects.toThrow(
				'Користувач з таким email вже існує'
			)
		})
	})

	describe('update', () => {
		const updatedUser = {
			...user,
			name: 'User2'
		}

		it('should return updated user by name', async () => {
			const updateUserDTO = {
				name: 'User2'
			}

			prisma.user.update.mockResolvedValue(updatedUser)

			await expect(service.update(id, updateUserDTO)).resolves.toEqual(
				updatedUser
			)
		})

		it('should return ConflictException if email is already takes', async () => {
			prisma.user.update.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('ConflictException', {
					code: 'P2002',
					clientVersion: ''
				}))

				await expect(service.update(id,updatedUser)).rejects.toThrow(
				'Користувач з таким email вже існує'
			)
		})
	})


	describe('delete', () => {

		it('should return a message if deleting is successul', async () =>{
			prisma.user.delete.mockResolvedValue({message:'Користувача видалено.'})

			await expect(service.delete(id)).resolves.toEqual({message:'Користувача видалено.'})
		})

		it('should return a NotFoundException if user is does not exist', async () => {
			prisma.user.delete.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('ConflictException', {
					code: 'P2025',
					clientVersion: ''
				}))

				await expect(service.delete(id)).rejects.toThrow(NotFoundException)
		})


	})
})
