import { Controller, Get, Param, Post, Body, BadRequestException } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TableActionResponseDto } from './dto/tables.dto';
import { Public } from '../auth/decorators/public';


@Controller('tables')
export class TablesController {
    constructor(private readonly tablesService: TablesService) {}

    @Public()
    @Get()
    getTables(): any {
        return this.tablesService.getTables();
    }

    @Public()
    @Get(':id')
    getTableById(@Param('id') id: string): any {
        return this.tablesService.getTableById(id);
    }

    @Post(':id')
    joinOrLeaveTable(@Param('id') id: string, @Body() body: { action: string, playerId?: number }): TableActionResponseDto {
        if (!body.playerId) {
            throw new BadRequestException('playerId is required');
        }
        if (body.action === 'join') {
            return this.tablesService.joinTable(id, body.playerId);
        } else if (body.action === 'leave') {
            return this.tablesService.leaveTable(id, body.playerId);
        }
        throw new BadRequestException('Invalid action. Must be "join" or "leave"');
    }

    @Post(':id/start')
    startGame(@Param('id') id: string, @Body() body: { playerId: number }): TableActionResponseDto {
        if (!body.playerId) {
            throw new BadRequestException('playerId is required');
        }
        return this.tablesService.startGame(id, body.playerId);
    }

    @Post(':id/action')
    performAction(@Param('id') id: string, @Body() body: { playerId: number, action: string, amount?: number }): TableActionResponseDto {
        if (!body.playerId || !body.action) {
            throw new BadRequestException('playerId and action are required');
        }
        return this.tablesService.performAction(id, body.playerId, body.action, body.amount);
    }
}
