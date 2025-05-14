
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsString, Length, Min } from "class-validator";

export class CreateUserDto {
    //gerer la singularité des infos : pas deux users avec le meme mail/nom
    //auto implementation de l'id ???
    //uuid? Date.start/Date.now/ Date.quelquechose?? => voir doc surement lol
    @ApiProperty()
    @IsString({always:true})
    @Length(2,8)
    pseudo: string;

    // @IsInt()
    // @Min(0)
    // bank: number = 10;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString({always:true})
    @Length(6, 20)
    password: string;

}
