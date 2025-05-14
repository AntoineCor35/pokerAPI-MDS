import { Controller, Get, Post, Body, Param, Query, Injectable } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { Action, ActionRequest, ActionResponse } from './action.interface';

@Controller('actions')
export class ActionsController {
    constructor(private readonly actionsService: ActionsService) {}

    @Get()
    getActions(): Action[] {
        return this.actionsService.getActions();
    }

    @Get('available')
    getAvailableActions(
        @Query('playerId') playerId: string,
        @Query('tableId') tableId: string
    ): Action[] {
        return this.actionsService.getAvailableActions(
            parseInt(playerId, 10),
            parseInt(tableId, 10)
        );
    }

    @Post()
    makeAction(@Body() actionRequest: ActionRequest): ActionResponse {
        return this.actionsService.makeAction(actionRequest);
    }
}
