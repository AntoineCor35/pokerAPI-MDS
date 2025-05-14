import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { DecksService } from '../decks/decks.service';
import { PlayersService } from '../players/players.service';
import { ActionsService } from '../actions/actions.service';
import { Player } from '../players/entities/players.entities';
import { TableDto } from '../tables/dto/tables.dto';

@Injectable()
export class GameLogicService {
    constructor(
        private readonly decksService: DecksService,
        private readonly playersService: PlayersService,
        @Inject(forwardRef(() => ActionsService))
        private readonly actionsService: ActionsService,
    ) {}

    initializeGame(table: TableDto): any {
        table.pot = 0;
        this.assignPlayerPositions(table);
        this.assignFirstDealer(table);
        this.startNewRound(table);
        return this.evaluateGameState(table);
    }

    startNewRound(table: TableDto): void {
        this.decksService.shuffle();
        this.decksService.distribute(table.players);
        
        // Réinitialiser les cartes communes et l'état de la table
        table.river = [];
        table.round = 1;
        table.turn = 0;
        table.currentBet = table.bigBlind;
        table.pot = 0;
        
        // Réinitialiser les joueurs
        table.players.forEach((player: Player) => {
            player.hasFolded = false;
            player.hasPlayed = false;
            player.currentBet = 0;
        });
        
        this.assignBlindPositions(table);
    }

    evaluateGameState(table: TableDto): any {
        // Vérifier si le joueur courant a fold
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

        if (!currentPlayer) return { table, message: 'No active players' };

        if (currentPlayer.isAI && !currentPlayer.hasFolded) {
            return this.handleAIAction(currentPlayer, table);
        }
        
        return { 
            table, 
            currentPlayer, 
            possibleActions: this.actionsService.getPossibleActions(currentPlayer, table) 
        };
    }

    isRoundComplete(table: TableDto): boolean {
        const activePlayers = table.players.filter((p: Player) => !p.hasFolded);
        return activePlayers.length === 1 || (table.turn === 3 && this.isTurnComplete(table));
    }

    isTurnComplete(table: TableDto): boolean {
        const activePlayers = table.players.filter((p: Player) => !p.hasFolded);
        if (activePlayers.length <= 1) return true;
        
        return activePlayers.every((p: Player) => p.hasPlayed && p.currentBet === table.currentBet);
    }

    handleAIAction(player: Player, table: TableDto): any {
        const action = this.getAIAction(player, table);
        this.actionsService.executeAction(player, action.type, table, action.amount);
        player.hasPlayed = true;
        
        // Réinitialiser hasPlayed pour les autres joueurs en cas de raise
        if (action.type === 'raise') {
            table.players.forEach((p: Player) => {
                if (p.id !== player.id && !p.hasFolded) {
                    p.hasPlayed = false;
                }
            });
        }
        
        this.moveToNextPlayer(table);
        return this.evaluateGameState(table);
    }

    evaluateEndRound(table: TableDto): any {
        const activePlayers = table.players.filter((p: Player) => !p.hasFolded);
        
        if (activePlayers.length === 1) {
            const winner = activePlayers[0];
            winner.chips += table.pot;
            table.lastWinner = winner.id;
            table.winningHand = null;
            
            // Vérifier si le jeu est terminé
            const humanPlayers = table.players.filter((p: Player) => !p.isAI && p.chips > 0);
            const aiPlayers = table.players.filter((p: Player) => p.isAI && p.chips > 0);
            
            if (humanPlayers.length === 0 || aiPlayers.length === 0 || table.players.length < 2) {
                table.status = 'Finished';
                return {
                    table,
                    gameOver: true,
                    message: 'Game Over'
                };
            }
            
            // Préparer le prochain round
            this.rotateDealer(table);
            this.startNewRound(table);
            
            return this.evaluateGameState(table);
        } else {
            return this.determineWinner(table);
        }
    }

    evaluateEndTurn(table: TableDto): any {
        table.turn += 1;
        
        // Réinitialiser les statuts des joueurs
        table.players.forEach((player: Player) => {
            if (!player.hasFolded) {
                player.hasPlayed = false;
            }
        });
        
        // Distribuer les cartes communes selon le tour
        if (table.turn === 1) {
            table.river = this.decksService.dealFlop();
        } else if (table.turn === 2) {
            table.river.push(this.decksService.dealTurn());
        } else if (table.turn === 3) {
            table.river.push(this.decksService.dealRiver());
        }
        
        return this.evaluateGameState(table);
    }

    getCurrentPlayer(table: TableDto): Player {
        return table.players.find((p: Player) => p.isCurrentPlayer);
    }

    getAIAction(player: Player, table: TableDto): { type: string, amount: number } {
        const possibleActions = this.actionsService.getPossibleActions(player, table);
        
        const randomActionType = possibleActions[Math.floor(Math.random() * possibleActions.length)];
        
        let amount = 0;
        if (randomActionType === 'raise') {
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
        
        return { type: randomActionType, amount };
    }

    determineWinner(table: TableDto): any {
        // Si vous avez un système d'évaluation des mains
        const bestHand = this.playersService.evaluateHands(table.players.filter(p => !p.hasFolded), table.river);
        bestHand.winner.chips += table.pot;
        table.lastWinner = bestHand.winner.id;
        table.winningHand = bestHand.hand;
        
        // Préparer le prochain round
        this.rotateDealer(table);
        this.startNewRound(table);
        
        return { 
            table, 
            winner: bestHand.winner, 
            message: 'Hand showdown' 
        };
    }

    assignBlindPositions(table: TableDto): void {
        table.players.forEach((p: Player) => { 
            p.isDealer = false; 
            p.isSmallBlind = false; 
            p.isBigBlind = false; 
            p.isCurrentPlayer = false; 
        });
        
        table.players[table.dealerPosition].isDealer = true;
        
        const smallBlindPos = (table.dealerPosition + 1) % table.players.length;
        const bigBlindPos = (table.dealerPosition + 2) % table.players.length;
        
        table.players[smallBlindPos].isSmallBlind = true;
        table.players[bigBlindPos].isBigBlind = true;
        
        this.playersService.placeBet(table.players[smallBlindPos], table.smallBlind, table);
        this.playersService.placeBet(table.players[bigBlindPos], table.bigBlind, table);
        
        table.currentBet = table.bigBlind;
        
        const nextPlayerPos = (bigBlindPos + 1) % table.players.length;
        table.players[nextPlayerPos].isCurrentPlayer = true;
    }

    rotateDealer(table: TableDto): void {
        let newDealerPos = (table.dealerPosition + 1) % table.players.length;
        table.dealerPosition = newDealerPos;
    }

    assignPlayerPositions(table: TableDto): void {
        table.players.forEach((player: Player, index: number) => {
            player.position = index;
        });
    }

    assignFirstDealer(table: TableDto): void {
        const randomIndex = Math.floor(Math.random() * table.players.length);
        table.dealerPosition = randomIndex;
    }

    moveToNextPlayer(table: TableDto): void {
        const currentPlayer = this.getCurrentPlayer(table);
        
        if (!currentPlayer) {
            console.error('No current player found');
            return;
        }
        
        currentPlayer.isCurrentPlayer = false;
        
        let nextPlayerPos = (currentPlayer.position + 1) % table.players.length;
        
        // Sauter les joueurs qui ont fold
        while (table.players[nextPlayerPos].hasFolded) {
            nextPlayerPos = (nextPlayerPos + 1) % table.players.length;
            // Protection contre une boucle infinie si tous les joueurs ont fold
            if (nextPlayerPos === currentPlayer.position) {
                break;
            }
        }
        
        table.players[nextPlayerPos].isCurrentPlayer = true;
    }

    executeAction(player: Player, action: string, table: TableDto, amount?: number): any {
        this.actionsService.executeAction(player, action, table, amount);
        player.hasPlayed = true;
        
        // Réinitialiser hasPlayed pour les autres joueurs en cas de raise
        if (action === 'raise') {
            table.players.forEach((p: Player) => {
                if (p.id !== player.id && !p.hasFolded) {
                    p.hasPlayed = false;
                }
            });
        }
        
        this.moveToNextPlayer(table);
        return this.evaluateGameState(table);
    }
}
