import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { hash } from 'argon2'
import { isUUID } from 'class-validator'

import { Prisma } from '../../generated/prisma'
import { PrismaService } from '../prisma/prisma.service'

import { CreateUserDTO } from './dto/create.dto'
import { UpdateUserDTO } from './dto/update.dto'

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) {}

	private readonly selectUserData: Prisma.UserSelect = {
		id: true,
		name: true,
		email: true,
		avatar: true,
		role: true,
		isVerified: true,
		isTwoFactorEnabled: true,
		createdAt: true,
		updatedAt: true
	}

	async findById(id: string) {
		if (!isUUID(id, 4)) {
			throw new BadRequestException('Невірний формат id.')
		}

		try {
			const user = await this.prismaService.user.findUniqueOrThrow({
				where: {
					id
				},
				select: this.selectUserData
			})

			return user
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				throw new NotFoundException('Користувач з таким id не існує.')
			}

			throw new Error()
		}
	}

	async getAllUsers() {
		return await this.prismaService.user.findMany({
			select: this.selectUserData
		})
	}

	async create(dto: CreateUserDTO) {
		try {
			return await this.prismaService.user.create({
				data: {
					...dto,
					password: await hash(dto.password),
					isTwoFactorEnabled: false,
					isVerified: false,
					method: 'CREDENTIALS',
					role: 'REGULAR'
				},
				select: this.selectUserData
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ConflictException(
						'Користувач з таким email вже існує'
					)
				}

				throw error
			}
		}
	}

	async update(id: string, dto: UpdateUserDTO) {
		try {
			const user = await this.findById(id)

			const hashedPassword = dto.password && (await hash(dto.password))

			return await this.prismaService.user.update({
				where: {
					id: user.id
				},
				data: {
					...dto,
					...(dto.password ? { password: hashedPassword } : {})
				},
				select: this.selectUserData
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ConflictException(
						'Користувач з таким email вже існує.'
					)
				}

				if (error.code === 'P2016' || error.code === 'P2009') {
					throw new BadRequestException(
						'Під час оновлення користувача виникла помилка.'
					)
				}
			}

			throw error
		}
	}

	async delete(id: string) {
		try {
			const user = await this.findById(id)
			 await this.prismaService.user.delete({
				where: { id: user.id }
			})

			return {message:'Користувача видалено.'}
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new NotFoundException(
						'Користувача з таким id не існує.'
					)
				}
			}
			throw error
		}
	}
}
