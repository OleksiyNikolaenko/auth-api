import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateUserDTO {
	@IsString({ message: "Ім'я користувача має бути рядком." })
	@MinLength(4, { message: "Мінімальна довжина ім'я 4 символи." })
	@MaxLength(50, { message: "Максимальна довжина ім'я 50 символів." })
	name: string

	@IsEmail(
		{},
		{
			message: 'Не вірний формат електроної пошти.'
		}
	)
	email: string

	@MinLength(4, { message: 'Мінімальна довжина пароля 4 символи.' })
	@MaxLength(50, { message: 'Максимальна довжина пароля 50 символів.' })
	password: string
}
1
