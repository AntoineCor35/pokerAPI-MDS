import { IsEmail, IsEnum, IsInt, IsString, Length, Min, Validate } from "class-validator";
import { isBuiltin } from "module";
import { Unique } from "typeorm";

export class CreateUserDto {
    //gerer la singularité des infos : pas deux users avec le meme mail/nom
    //auto implementation de l'id ???
    //uuid? Date.start/Date.now/ Date.quelquechose?? => voir doc surement lol
    @IsString({always:true})
    @Length(2,8)
    pseudo: string;

    @IsInt()
    @Min(0)
    bank: number;

    @IsEmail()
    email: string;

    @IsString({always:true})
    @Length(6, 20)
    password: string;

}
