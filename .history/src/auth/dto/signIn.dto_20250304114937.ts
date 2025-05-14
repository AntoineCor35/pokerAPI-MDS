import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  pseudo: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
