import { Injectable } from '@nestjs/common';

@Injectable()
export class ActionsService {
    private readonly actions = [
        {
            name: 'fold',
            description: 'Abandon the current hand'
        },
        {
            name: 'check',
            description: 'Pass the action to next player without betting'
        },
        {
            name: 'call',
            description: 'Match the current bet amount'
        },
        {
            name: 'raise',
            description: 'Increase the current bet amount'
        },
        {
            name: 'all-in',
            description: 'Bet all remaining chips'
        }
    ];

    getActions(): any[] {
        return this.actions;
    }

    
}