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

    private addLogEntry(table: any, type: 'action' | 'turn' | 'round' | 'cards' | 'pot', message: string, data?: any): void {
        if (!table.gameLog) {
            table.gameLog = [];
        }
        
        table.gameLog.push({
            timestamp: new Date(),
            type,
            message,
            data
        });
        
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    initializeGame(table: any): any {
        table.gameLog = [];
        this.addLogEntry(table, 'round', 'Game initialized');
        
        table.pot = 0;
        this.assignPlayerPositions(table);
        this.assignFirstDealer(table);
        
        this.decksService.shuffle();
        this.decksService.distribute(table.players);
        
        table.round = 1;
        table.turn = 1;
        
        table.currentBet = table.bigBlind;
        
        this.addLogEntry(table, 'round', `Round ${table.round} started`, { pot: table.pot });
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
            console.log('AI player' , currentPlayer.id, 'play', action);
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
            winner.chips += table.pot;
            table.lastWinner = winner.id;
            table.winningHand = null;
            this.addLogEntry(table, 'round', `Round ${table.round} ended. ${winner.name} wins by default as last player standing`, { 
                winner: winner.name, 
                amount: table.pot 
            });
        } else {
            const winner = this.determineWinner(activePlayers);
            winner.chips += table.pot;
            table.lastWinner = winner.id;
            table.winningHand = winner.hand;
            this.addLogEntry(table, 'round', `Round ${table.round} ended. ${winner.name} wins with best hand`, { 
                winner: winner.name, 
                amount: table.pot, 
                hand: winner.hand 
            });
        }
        
        table.players = table.players.filter((player: any) => player.chips > 0);
        
        const humanPlayers = table.players.filter((p: any) => !p.isAI);
        const aiPlayers = table.players.filter((p: any) => p.isAI);
        
        if (humanPlayers.length === 0 || aiPlayers.length === 0 || table.players.length < 2) {
            this.addLogEntry(table, 'round', 'Game Over', { 
                remainingPlayers: table.players.length,
                remainingHumans: humanPlayers.length,
                remainingAI: aiPlayers.length
            });
            return {
                table,
                gameOver: true,
                message: 'Game Over'
            };
        }
        
        this.startNextRound(table);
        
        return this.evaluateGameState(table);
    }

    private evaluateEndTurn(table: any): any {
        this.addLogEntry(table, 'turn', `Turn ${table.turn} completed`);
        table.turn += 1;
        
        table.currentBet = 0;
        
        table.players.forEach((player: any) => {
            if (!player.hasFolded) {
                player.hasPlayed = false;
                player.hasAlreadyRaise = false;
                player.currentBet = 0;
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
            const maxRaise = Math.min(player.chips, table.currentBet * 3);
            if (maxRaise >= minRaise) {
                amount = Math.floor(Math.random() * (maxRaise - minRaise + 1)) + minRaise;
            } else {
                amount = minRaise;
            }
        } else if (randomActionType === 'call') {
            amount = table.currentBet - player.currentBet;
        }
        
        this.addLogEntry(table, 'action', `AI player ${player.name} (${player.id}) chose to ${randomActionType}${amount ? ' with ' + amount : ''}`, {
            playerId: player.id,
            playerName: player.name,
            isAI: true,
            action: randomActionType,
            amount: amount,
            currentPot: table.pot
        });
        
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

    turnTwo(table: any): any {
        table.river = this.decksService.dealFlop();
        this.addLogEntry(table, 'cards', 'Flop cards dealt', { 
            flop: table.river, 
            currentPot: table.pot 
        });
        this.rotateRole(table);
        return this.evaluateGameState(table);
    }

    turnThree(table: any): any {
        const turnCard = this.decksService.dealTurn();
        table.river.push(turnCard);
        this.addLogEntry(table, 'cards', 'Turn card dealt', { 
            turnCard: turnCard, 
            river: table.river, 
            currentPot: table.pot 
        });
        this.rotateRole(table);
        return this.evaluateGameState(table);
    }

    turnFour(table: any): any {
        const riverCard = this.decksService.dealRiver();
        table.river.push(riverCard);
        this.addLogEntry(table, 'cards', 'River card dealt', { 
            riverCard: riverCard, 
            river: table.river, 
            currentPot: table.pot 
        });
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
        
        this.playersService.placeBet(table.players[smallBlindPos], table.smallBlind, table);
        this.playersService.placeBet(table.players[bigBlindPos], table.bigBlind, table);
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
        
        this.addLogEntry(table, 'action', `Player ${player.name} (${player.id}) ${action}${amount ? ' with ' + amount : ''}`, {
            playerId: player.id,
            playerName: player.name,
            isAI: player.isAI,
            action: action,
            amount: amount,
            currentPot: table.pot
        });
        
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

    startNextRound(table: any): void {
        table.round += 1;
        
        table.turn = 1;
        table.currentBet = table.bigBlind;
        table.pot = 0;
        
        table.river = [];
        
        table.players.forEach((player: any) => {
            player.hand = [];
            
            player.currentBet = 0;
            player.hasFolded = false;
            player.hasPlayed = false;
            player.isAllIn = false;
            player.isActive = true;
            player.hasAlreadyRaise = false;
        });
        
        this.rotateDealer(table);
        
        this.decksService.shuffle();
        this.decksService.distribute(table.players);
        
        this.addLogEntry(table, 'round', `Round ${table.round} started`, { 
            players: table.players.map((p: any) => ({
                id: p.id,
                name: p.name,
                chips: p.chips,
                isDealer: p.isDealer,
                isSmallBlind: p.isSmallBlind,
                isBigBlind: p.isBigBlind
            }))
        });
    }

}
