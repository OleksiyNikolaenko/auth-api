import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from '@nestjs/common'

import { CreateUserDTO } from './dto/create.dto'
import { UpdateUserDTO } from './dto/update.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get(':id')
	async findById(@Param() { id }: { id: string }) {
		return await this.userService.findById(id)
	}

	@Get('/')
	async getAllUsers() {
		return await this.userService.getAllUsers()
	}

	@Delete('/delete/:id')
	async delete(@Param() { id }: { id: string }) {
		return await this.userService.delete(id)
	}

	@Patch('/update/:id')
	async update(@Param() { id }: { id: string }, @Body() dto: UpdateUserDTO) {
		return await this.userService.update(id, dto)
	}
}
