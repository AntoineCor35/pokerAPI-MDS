import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor( 
    private jwtService: JwtService,
    @InjectRepository(User) 
    private userRepository: Repository<User>,
  ) {}

  async signIn(username: string, pass: string): Promise<{ access_token: string, user: any }> {
    const user = await this.userRepository.findOne({ where: { pseudo: username } });
    if (!user) {
      throw new UnauthorizedException("le user n'existe pas");
    }   

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
        throw new UnauthorizedException('password invalide');
    }
    
    const payload = { 
      pseudo: user.pseudo, 
      id: user.id, 
      bank: user.bank, 
      victoryStats: user.victoryStats 
    };
    
    const { password, ...userWithoutPassword } = user;
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: userWithoutPassword
    };
  }

  async verifyToken(token: string) {
    try {
        const payload = this.jwtService.verify(token);
        const user = await this.userRepository.findOne({ where: { id: payload.id } });
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return { valid: true, user: userWithoutPassword };
        }
        return { valid: true, user: payload };
    } catch (error) {
        return { valid: false, error: error.message };
    }
  }
}
