import { Injectable } from '@nestjs/common';
import { DecksService } from '../decks/decks.service';
import { PlayersService } from '../players/players.service';
import { PlayersActionsService } from '../players-actions/players-actions.service';

@Injectable()
export class GameLogicService {
    constructor(
        private readonly decksService: DecksService,
        private readonly playersService: PlayersService,
        private readonly playersActionsService: PlayersActionsService,
    ) {}

    initializeGame(table: any): any {
        table.pot = 0;
        this.assignPlayerPositions(table);
        this.assignFirstDealer(table);
        
        this.decksService.shuffle();
        this.decksService.distribute(table.players);
        
        table.round = 1;
        table.turn = 1;
        
        return this.evaluateGameState(table);
    }

    evaluateGameState(table: any): any {
        //check si les conditions de fin de round sont remplies
        //check si les conditions de fin de tour sont remplies
        //check qui est le joueur qui doit jouer,
        //définit la derniere action du joueur précédent
        //appel la logic de l'action du joueur précédent -> renvoie les actions possibles au joueur qui doit jouer -> si c'est un joueur avec uns statut d'IA -> appel la logic de l'IA et reboucle sur evaluateGameState 
        //si non IA renvoie les actionePlayers possible au joueur qui doit jouer 
        //renvoie les actionPlayers possible au joueur qui est la small blind + les infos du jeu en cours
    }

    evaluateEndRound(table: any): any {
        //check si les conditions de fin de round sont remplies
        //répartie les gains
        //incremente le round
        //remet le turn à 1
        //check si les joueurs non IA sont toujours dans la table/ont l'argent pour jouer - si non -> retire le joueur de la table
        //check si il reste des joueurs non IA sur la table -> si non -> fin de la partie
        //check si des joueurs IA sont a 0 en bank -> retire le joueur de la table
        //check si il reste des joueurs IA sur la table -> si non -> fin de la partie
        //check si il reste des joueurs sur la table -> si non -> fin de la partie
    }

    evaluateEndTurn(table: any): any {
        //check si les conditions de fin de tour sont remplies
        //increment le turn
        //lance le tour suivant -> turn 2 / turn 3 / turn 4
    }

    turnTwo(table: any): any {
        this.decksService.burn();
        table.river = this.decksService.dealFlop();
        this.rotateRole(table);
        return this.evaluateGameState(table);
    }

    turnThree(table: any): any {
        //regle du tour 3
        //deck->burn->deal 1 card to river
        //appel rotateRole
        //appel evaluateGameState
    }

    turnFour(table: any): any {
        //regle du tour 4
        //deck->burn->deal 1 card to river
        //appel rotateRole
        //appel evaluateGameState
    }

    assignPlayerPositions(table: any): any {
        //défini la position des joueurs sur la table en fonction du nombre de joueurs
    }

    assignFirstDealer(table: any): any {
        //défini le dealer sur un math.random et associe les joueurs +1 et +2 a small et big blind
    }

    rotateRole(table: any): any {
        //deplace de 1 la position du dealer de la small blind et de la big blind
        //remet la actual blind a la small blind
        //défini le joueur qui doit jouer a celui qui est la small blind
    }

}
