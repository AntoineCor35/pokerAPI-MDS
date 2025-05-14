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
    ];

    getActions(): any[] {
        return this.actions;
    }

    makeAction(action: any): any {
        const selectedAction = this.actions.find(a => a.name === action.name);
        if (selectedAction) {
            return selectedAction.description;
        }
        return 'Invalid action';
    }


}
