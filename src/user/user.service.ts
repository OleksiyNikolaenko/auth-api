import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { isUUID } from 'class-validator'
import { Prisma } from '../../generated/prisma'
import { PrismaService } from '../prisma/prisma.service'

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

	async findById(id: string){

		if(!isUUID(id)){
			throw new BadRequestException('Невірний формат id.');
			
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

			if(error instanceof InternalServerErrorException){
				throw new InternalServerErrorException('Помилка під час пошуку користувача. Будь ласка, спробуйте ще раз.')
			}
		}
	}
}
