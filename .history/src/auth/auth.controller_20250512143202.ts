import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
    UseGuards
  } from '@nestjs/common';
  import { AuthGuard } from './auth.guard';
  import { AuthService } from './auth.service';
import { Public } from './decorators/public';
import { GetUser } from './decorators/user.decorator';
import { UsersService } from '../users/users.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}
  
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Authentifier un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur authentifié avec succès' })
  @ApiResponse({ status: 401, description: 'Authentification échouée' })
  async signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.pseudo, signInDto.password);
  }
  
  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer le profil de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil récupéré avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getProfile(@GetUser() user) { 
    // Récupérer les informations complètes de l'utilisateur depuis la base de données
    const userProfile = await this.usersService.getUserById(user.id);
    if (!userProfile) {
      return user; // Fallback au payload JWT si l'utilisateur n'est pas trouvé
    }
    
    // Exclure le mot de passe des données retournées
    const { password, ...userWithoutPassword } = userProfile;
    return userWithoutPassword;
  }

  @Public()
  @Post('verify-token')
  @ApiOperation({ summary: 'Vérifier la validité d\'un token JWT' })
  @ApiResponse({ status: 200, description: 'Résultat de la vérification' })
  verifyToken(@Body() body: { token: string }) {
    return this.authService.verifyToken(body.token);
  }
}
  