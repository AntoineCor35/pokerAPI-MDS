import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { DecksService } from '../decks/decks.service';
import { PlayersService } from '../players/players.service';
import { ActionsService } from '../actions/actions.service';

@Injectable()
export class GameLogicService {
    constructor(
        private readonly decksService: DecksService,
        private readonly playersService: PlayersService,
        @Inject(forwardRef(() => ActionsService))
        private readonly actionsService: ActionsService,
    ) {}

    initializeGame(table: any): any {
        table.pot = 0;
        this.assignPlayerPositions(table);
        this.assignFirstDealer(table);
        
        this.decksService.shuffle();
        this.decksService.distribute(table.players);
        
        table.round = 1;
        table.turn = 1;
        
        table.currentBet = table.bigBlind;
        
        return this.evaluateGameState(table);
    }

    evaluateGameState(table: any): any {
        const currentPlayer = this.getCurrentPlayer(table);
        if (currentPlayer && currentPlayer.hasFolded) {
            this.moveToNextPlayer(table);
            return this.evaluateGameState(table);
        }

        if (this.isRoundComplete(table)) {
            return this.evaluateEndRound(table);
        }

        if (this.isTurnComplete(table)) {
            return this.evaluateEndTurn(table);
        }
        
        if (currentPlayer.isAI && !currentPlayer.hasFolded) {
            const action = this.getAIAction(currentPlayer, table);
            console.log('AI player play', action);
            this.actionsService.executeAction(currentPlayer, action.type, table, action.amount);
            currentPlayer.hasPlayed = true;
            this.moveToNextPlayer(table);
            return this.evaluateGameState(table);
        }

        if (currentPlayer.isHuman && !currentPlayer.hasFolded) {
            console.log('Human have to play ?');
            const possibleActions = this.actionsService.getPossibleActions(currentPlayer, table);
            console.log('possibleActions', possibleActions);
            return {
                table,
                currentPlayer,
                possibleActions
            };
        }
    }

    private isRoundComplete(table: any): boolean {
        const activePlayers = table.players.filter((p: any) => !p.hasFolded);
        if (activePlayers.length === 1) {
            table.currentBet = table.bigBlind;
            return true;
        }
        
        const allBetsEqual = activePlayers.every((p: any) => p.currentBet === table.currentBet);
        if (allBetsEqual && table.turn === 4) {
            table.currentBet = 0;
            return true;
        }
        
        return false;
    }

    private isTurnComplete(table: any): boolean {
        const activePlayers = table.players.filter((p: any) => !p.hasFolded);
        
        if (activePlayers.length <= 1) {
            return true;
        }   
        
        const allPlayersHavePlayed = activePlayers.every((p: any) => p.hasPlayed);
        const allBetsEqual = activePlayers.every((p: any) => p.currentBet === table.currentBet);
        
        return allPlayersHavePlayed && allBetsEqual;
    }

    private getCurrentPlayer(table: any): any {
        return table.players.find((p: any) => p.isCurrentPlayer);
    }

    private evaluateEndRound(table: any): any {
        const activePlayers = table.players.filter((p: any) => !p.hasFolded);
        
        if (activePlayers.length === 1) {
            const winner = activePlayers[0];
            winner.bank += table.pot;
            table.lastWinner = winner.id;
            table.winningHand = null;
        } else {
            const winner = this.determineWinner(activePlayers);
            winner.bank += table.pot;
            table.lastWinner = winner.id;
            table.winningHand = winner.hand;
        }
        
        table.pot = 0;
        table.round += 1;
        table.turn = 1;
        table.river = [];
        table.currentBet = table.bigBlind;
        
        table.players.forEach((player: any) => {
            player.cards = [];
            player.hasFolded = false;
            player.currentBet = 0;
        });
        
        table.players = table.players.filter((player: any) => player.bank > 0);
        
        const humanPlayers = table.players.filter((p: any) => !p.isAI);
        const aiPlayers = table.players.filter((p: any) => p.isAI);
        
        if (humanPlayers.length === 0 || aiPlayers.length === 0 || table.players.length < 3) {
            return {
                table,
                gameOver: true,
                message: 'Game Over'
            };
        }
        
        this.rotateDealer(table);
        this.decksService.shuffle();
        this.decksService.distribute(table.players);
        
        return this.evaluateGameState(table);
    }

    private evaluateEndTurn(table: any): any {
        table.turn += 1;
        
        table.players.forEach((player: any) => {
            if (!player.hasFolded) {
                player.hasPlayed = false;
            }
        });
        
        switch (table.turn) {
            case 2:
                return this.turnTwo(table);
            case 3:
                return this.turnThree(table);
            case 4:
                return this.turnFour(table);
            default:
                return this.evaluateGameState(table);
        }
    }

    private getAIAction(player: any, table: any): { type: string, amount: number } {
        const possibleActions = this.actionsService.getPossibleActions(player, table);
        
        const randomActionType = possibleActions[Math.floor(Math.random() * possibleActions.length)];
        
        let amount = 0;
        if (randomActionType === 'raise') {
            player.hasAlreadyRaise = true;
            const minRaise = table.currentBet + table.currentBlind;
            const maxRaise = Math.min(player.bank, table.currentBet * 3);
            if (maxRaise >= minRaise) {
                amount = Math.floor(Math.random() * (maxRaise - minRaise + 1)) + minRaise;
            } else {
                amount = minRaise;
            }
        } else if (randomActionType === 'call') {
            amount = table.currentBet - player.currentBet;
        }
        
        return { type: randomActionType, amount };
    }

    private determineWinner(players: any[]): any {
        const randomIndex = Math.floor(Math.random() * players.length);
        return players[randomIndex];
    }

    private rotateDealer(table: any): void {
        if (!table.players || table.players.length === 0) {
            console.error('No players in the table');
            return;
        }
        
        table.dealerPosition = (table.dealerPosition + 1) % table.players.length;
        
        const smallBlindPos = (table.dealerPosition + 1) % table.players.length;
        const bigBlindPos = (table.dealerPosition + 2) % table.players.length;
        
        table.players.forEach((p: any) => {
            p.isDealer = false;
            p.isSmallBlind = false;
            p.isBigBlind = false;
            p.isCurrentPlayer = false;
        });
        
        table.players[table.dealerPosition].isDealer = true;
        table.players[smallBlindPos].isSmallBlind = true;
        table.players[bigBlindPos].isBigBlind = true;
        
        const nextPlayerPos = (bigBlindPos + 1) % table.players.length;
        table.players[nextPlayerPos].isCurrentPlayer = true;
    }

    private assignBlindPositions(table: any): void {
        const smallBlindPos = (table.dealerPosition + 1) % table.players.length;
        const bigBlindPos = (table.dealerPosition + 2) % table.players.length;
        
        table.players.forEach((p: any) => {
            p.isDealer = false;
            p.isSmallBlind = false;
            p.isBigBlind = false;
            p.isCurrentPlayer = false;
        });
        
        table.players[table.dealerPosition].isDealer = true;
        table.players[smallBlindPos].isSmallBlind = true;
        table.players[bigBlindPos].isBigBlind = true;
        
        this.playersService.placeBet(table.players[smallBlindPos], table.currentBlind, table);
        this.playersService.placeBet(table.players[bigBlindPos], table.currentBlind * 2, table);
        table.currentBet = table.currentBlind * 2;
        
        const nextPlayerPos = (bigBlindPos + 1) % table.players.length;
        table.players[nextPlayerPos].isCurrentPlayer = true;
    }

    turnTwo(table: any): any {
        table.river = this.decksService.dealFlop();
        this.rotateRole(table);
        return this.evaluateGameState(table);
    }

    turnThree(table: any): any {
        const turnCard = this.decksService.dealTurn();
        table.river.push(turnCard);
        this.rotateRole(table);
        return this.evaluateGameState(table);
    }

    turnFour(table: any): any {
        const riverCard = this.decksService.dealRiver();
        table.river.push(riverCard);
        this.rotateRole(table);
        return this.evaluateGameState(table);
    }
        

    assignPlayerPositions(table: any): void {
        table.players.forEach((player: any, index: number) => {
            player.position = index;
        });
    }

    assignFirstDealer(table: any): void {
        const randomIndex = Math.floor(Math.random() * table.players.length);
        table.dealerPosition = randomIndex;
        
        table.players[randomIndex].isDealer = true;

        const smallBlindPos = (randomIndex + 1) % table.players.length;
        const bigBlindPos = (randomIndex + 2) % table.players.length;
        
        table.players[smallBlindPos].isSmallBlind = true;
        table.players[bigBlindPos].isBigBlind = true;
        const nextPlayerPos = (bigBlindPos + 1) % table.players.length;
        table.players[nextPlayerPos].isCurrentPlayer = true;
        
        this.playersService.placeBet(table.players[smallBlindPos], table.currentBlind, table);
        this.playersService.placeBet(table.players[bigBlindPos], table.currentBlind * 2, table);
    }

    rotateRole(table: any): void {
        if (!table.players || table.players.length === 0) {
            console.error('No players in the table');
            return;
        }
        
        table.dealerPosition = (table.dealerPosition + 1) % table.players.length;
        
        const smallBlindPos = (table.dealerPosition + 1) % table.players.length;
        const bigBlindPos = (table.dealerPosition + 2) % table.players.length;
        
        table.players.forEach((p: any) => {
            p.isDealer = false;
            p.isSmallBlind = false;
            p.isBigBlind = false;
            p.isCurrentPlayer = false;
        });
        
        table.players[table.dealerPosition].isDealer = true;
        table.players[smallBlindPos].isSmallBlind = true;
        table.players[bigBlindPos].isBigBlind = true;
        
        const nextPlayerPos = (bigBlindPos + 1) % table.players.length;
        table.players[nextPlayerPos].isCurrentPlayer = true;
    }

    moveToNextPlayer(table: any): void {
        const currentPlayer = this.getCurrentPlayer(table);
        
        if (!currentPlayer) {
            console.error('No current player found');
            return;
        }
        
        currentPlayer.isCurrentPlayer = false;
        
        let nextPlayerPos = (currentPlayer.position + 1) % table.players.length;
        
        while (table.players[nextPlayerPos].hasFolded) {
            nextPlayerPos = (nextPlayerPos + 1) % table.players.length;
            if (nextPlayerPos === currentPlayer.position) {
                break;
            }
        }
        
        table.players[nextPlayerPos].isCurrentPlayer = true;
    }

    executeAction(player: any, action: string, table: any, amount?: number): void {
        this.actionsService.executeAction(player, action, table, amount);
        player.hasPlayed = true;
        
        if (action === 'raise') {
            table.players.forEach((p: any) => {
                if (p.id !== player.id && !p.hasFolded) {
                    p.hasPlayed = false;
                }
            });
        }
        
        this.moveToNextPlayer(table);
        const gameState = this.evaluateGameState(table);
        return gameState;
    }

}
