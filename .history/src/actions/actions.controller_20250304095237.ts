import { Controller, Get, Post, Body, Param, Query, Injectable } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionDto, ActionRequestDto, ActionResponseDto } from './dto/action.dto';

@Controller('actions')
export class ActionsController {
    constructor(private readonly actionsService: ActionsService) {}

    @Get()
    getActions(): ActionDto[] {
        return this.actionsService.getActions();
    }

    @Get('available')
    getAvailableActions(
        @Query('playerId') playerId: string,
        @Query('tableId') tableId: string
    ): ActionDto[] {
        return this.actionsService.getAvailableActions(
            parseInt(playerId, 10),
            parseInt(tableId, 10)
        );
    }

    @Post()
    makeAction(@Body() actionRequest: ActionRequestDto): ActionResponseDto {
        return this.actionsService.makeAction(actionRequest);
    }
}
