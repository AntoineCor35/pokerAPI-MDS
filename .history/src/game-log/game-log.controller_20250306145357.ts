import { Controller, Get, Param } from '@nestjs/common';
import { GameLogService } from './game-log.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('game-logs')
@Controller('game-logs')
export class GameLogController {
    constructor(private readonly gameLogService: GameLogService) {}

    @ApiOperation({ summary: 'Get game logs by table ID' })
    @ApiParam({ name: 'tableId', description: 'Table ID' })
    @Get('table/:tableId')
    async getLogsByTableId(@Param('tableId') tableId: string) {
        return this.gameLogService.getLogsByTableId(+tableId);
    }
} 