import { Controller, Get, Param, Post, Body, BadRequestException, Req, UseGuards } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TableActionResponseDto } from './dto/tables.dto';
import { Public } from '../auth/decorators/public';
import { UsersService } from '../users/users.service'; 
import { User } from 'src/users/entities/user.entity';
import { GetUser } from '../auth/decorators/user.decorator';
import { 
    ApiTags, 
    ApiOperation, 
    ApiParam, 
    ApiBody, 
    ApiResponse,
    ApiBearerAuth
} from '@nestjs/swagger';

@ApiTags('tables')
@Controller('tables')
export class TablesController {
    
    constructor(
        private readonly tablesService: TablesService,
        private readonly UsersService : UsersService
    ) {}

    @ApiOperation({ summary: 'Get all tables', description: 'Returns a list of all available poker tables' })
    @ApiResponse({ status: 200, description: 'List of tables retrieved successfully', type: [Object] })
    @Public()
    @Get()
    getTables(): any {
        return this.tablesService.getTables();
    }

    @ApiOperation({ summary: 'Get table by ID', description: 'Returns details of a specific table' })
    @ApiParam({ name: 'id', description: 'Table ID' })
    @ApiResponse({ status: 200, description: 'Table retrieved successfully', type: Object })
    @ApiResponse({ status: 404, description: 'Table not found' })
    @Public()
    @Get(':id')
    getTableById(@Param('id') id: string): any {
        return this.tablesService.getTableById(id);
    }

    @ApiOperation({ summary: 'Join or leave a table', description: 'Join or leave a specific poker table as the authenticated user' })
    @ApiParam({ name: 'id', description: 'Table ID' })
    @ApiBody({ 
        schema: {
            type: 'object',
            properties: {
                action: { 
                    type: 'string',
                    enum: ['join', 'leave'],
                    description: 'Action to perform' 
                }
            },
            required: ['action']
        } 
    })
    @ApiResponse({ status: 200, description: 'Action performed successfully', type: TableActionResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid request or action' })
    @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
    @ApiBearerAuth()
    @UseGuards()
    @Post(':id')
    async joinOrLeaveTable(
        @GetUser() user: User,
        @Param('id') id: string,
        @Body() body: { action: string }
    ): Promise<TableActionResponseDto>{
        let userCurrent = await this.UsersService.getUserById(user.id);

        console.log("userCurrent : ", userCurrent);

        if (!userCurrent) {
            throw new BadRequestException('le user est undefined');
        }
        
        if (body.action === 'join') {
            return this.tablesService.joinTable(id, userCurrent);
        } else if (body.action === 'leave') {
            return this.tablesService.leaveTable(id, userCurrent);
        }
         throw new BadRequestException('Invalid action. Must be "join" or "leave"');
    }
    
    @ApiOperation({ summary: 'Start a game', description: 'Start a new game at the specified table' })
    @ApiParam({ name: 'id', description: 'Table ID' })
    @ApiResponse({ status: 200, description: 'Game started successfully', type: TableActionResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid request or user not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
    @ApiResponse({ status: 403, description: 'Forbidden - User not allowed to start the game' })
    @ApiBearerAuth()
    @UseGuards()
    @Post(':id/start')
    startGame(
        @GetUser()user: User,
        @Param('id') id: string,
    ): TableActionResponseDto {
        console.log(user);
        if (!user) {
            throw new BadRequestException('user is undefined');
        }
        return this.tablesService.startGame(id, user);
    }

    @ApiOperation({ summary: 'Perform game action', description: 'Perform an action during the game (call, fold, raise, etc.)' })
    @ApiParam({ name: 'id', description: 'Table ID' })
    @ApiBody({ 
        schema: {
            type: 'object',
            properties: {
                action: { 
                    type: 'string',
                    description: 'Action to perform (call, fold, raise, etc.)' 
                },
                amount: { 
                    type: 'number',
                    description: 'Amount to bet (required for raise/bet actions)' 
                }
            },
            required: ['action']
        } 
    })
    @ApiResponse({ status: 200, description: 'Action performed successfully', type: TableActionResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid request, action, or amount' })
    @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not your turn or invalid action' })
    @ApiBearerAuth()
    @UseGuards()
    @Post(':id/action')
    performAction(
        @Param('id') id: string,
        @GetUser() user: User,
        @Body() body: {action: string, amount?: number }
    ): TableActionResponseDto {
        if (!user) {
            throw new BadRequestException('playerId is required');
        }
        if (!body.action) {
            throw new BadRequestException('Action is required');
        }
        return this.tablesService.performAction(id, user, body.action, body.amount);
    }

    @ApiOperation({ summary: 'Get table status for current player', description: 'Returns the current state of the table and possible actions for the authenticated player' })
    @ApiParam({ name: 'id', description: 'Table ID' })
    @ApiResponse({ status: 200, description: 'Table status retrieved successfully', type: TableActionResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid request or user not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
    @ApiBearerAuth()
    @UseGuards()
    @Get(':id/status')
    getTableStatus(
        @GetUser() user: User,
        @Param('id') id: string
    ): TableActionResponseDto {
        return this.tablesService.getTableStatus(id, user);
    }
}
