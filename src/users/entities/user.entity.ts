import { Min, min } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class User{
    @ApiProperty({ description: 'Identifiant unique de l\'utilisateur', example: 1 })
    @PrimaryGeneratedColumn()
    id: number

    @ApiProperty({ description: 'Pseudo de l\'utilisateur', example: 'player1' })
    @Column()
    pseudo: string;

    @ApiProperty({ description: 'Email de l\'utilisateur', example: 'user@example.com' })
    @Column({ unique: true })
    email: string;

    @ApiProperty({ description: 'Mot de passe hashé de l\'utilisateur', example: 'hashedpassword123' })
    @Column()
    password: string;

    @ApiProperty({ description: 'Solde disponible pour les mises', example: 1000, default: 1000 })
    @Column({ default: 1000 }) 
    @Min(0)
    bank: number;

    @ApiProperty({ description: 'Nombre de victoires accumulées', example: 5, default: 0 })
    @Column({ default: 0 })
    @Min(0) 
    victoryStats: number;

}