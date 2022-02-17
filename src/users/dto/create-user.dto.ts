export class CreateUserDto {
  readonly names: string;
  readonly email: string;
  readonly phone: string;
  readonly username: string;
  password: string;
}

export class LoginDto {
  readonly email: string;
  readonly password: string;
}
