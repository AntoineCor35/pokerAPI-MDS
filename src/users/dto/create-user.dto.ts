
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {

    @ApiProperty()
    @IsString({always:true})
    @Length(2,25)
    pseudo: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString({always:true})
    @Length(6, 20)
    password: string;

}
