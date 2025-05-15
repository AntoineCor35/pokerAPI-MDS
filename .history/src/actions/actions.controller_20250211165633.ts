import { Controller, Get, Post, Body } from '@nestjs/common';
import { ActionsService } from './actions.service';

@Controller('actions')
export class ActionsController {
    constructor(private readonly actionsService: ActionsService) {}

    @Get()
    getActions(): any[] {
        return this.actionsService.getActions();
    }

    @Post()
    makeAction(@Body() body: any): any {
        return this.actionsService.makeAction(body);
    }
}
