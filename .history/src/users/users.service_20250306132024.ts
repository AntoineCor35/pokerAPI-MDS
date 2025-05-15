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

  async findOne(email: string): Promise<User | null> {
    return this.repo.findOneBy({"email": email});
  }

  async updateUserBank(userId: number, amount: number): Promise<User | null> {
    const user = await this.repo.findOneBy({ id: userId });
    
    if (!user) {
      return null;
    }
    
    user.bank += amount;
    
    // S'assurer que la banque ne descend pas en dessous de 0
    if (user.bank < 0) {
      user.bank = 0;
    }
    
    return this.repo.save(user);
  }
}
}