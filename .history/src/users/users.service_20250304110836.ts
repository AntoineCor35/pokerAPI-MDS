import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
//import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {

  // users: any[] = [
  //   {
  //     pseudo: "pierre",
  //     bank: 1000,
  //     id: 1,
  //     email: "loliolol@dkjskfj.fr",
  //     password: "string"
  //   },
  //   {
  //     pseudo: "paul",
  //     bank: 1000,
  //     id: 2,
  //      email: "ltest@testj.fr",
  //     password: "lolilol147"
  //   },
  //   {
  //     pseudo: "jacques",
  //     bank: 1000,
  //     id: 3,
  //     email: "loliolccaeeiol@dkjskfj.fr",
  //     password: "test"
  //   },
  // ]

  constructor(@InjectRepository(User) private repo : Repository<User>){}
  
  async getAllUsers(): Promise<User[]> {
    return await this.repo.find();
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.repo.findOne({ where: { id: parseInt(id) } });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const verifyUserEmail = await this.repo.findOne({where: {email: userData.email}});

    if (verifyUserEmail) {
        throw new Error("email déjà utilisé.");
    }

    if(userData.password){
      const saltOrRounds = 10;
      const password = userData.password;
      const hash = await bcrypt.hash(password, saltOrRounds);
      userData.password = hash;
      const newUser = userData;
      let user = this.repo.create(newUser);
      //console.log(newUser);
      return this.repo.save(userData);
    }
    else{
      throw new Error("mot de passe requis.");
    }
  } 
  async findOne(pseudo: string): Promise<User | null> {
    return this.repo.findOneBy({"pseudo":pseudo});
  }
  
  // async findOne(username: string): Promise<User | undefined> {
  //   return this.users.find(user => user.username === username);
  // }
  // create(createUserDto: CreateUserDto) {
    
  //   const newUser = createUserDto;
  //   this.users.push(newUser);
  //   return newUser;
  // }

  // updatebank(userId: number, bank: number) { 
  // }
}