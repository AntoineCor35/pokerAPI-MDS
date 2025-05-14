import { Injectable } from '@nestjs/common';

@Injectable()
export class GameLogicService {
    initializeGame(table: any): any {
        //récupère la table (info des joueurs, status, bigblind, smallblind)
        //Définit le pot à 0
        //Définit la place des joueurs sur la table en fonction du nombre de joueurs
        //Définit le dealer sur un math.random et associe les joueurs +1 et +2 a small et big blind
        //new Deck -> Shuffle -> Deal 2 cards to each player
        //initialise le round à 1
        //initiale le turn à 1
        //démarre le tour et appel ->evaluateGameState
    }

    evaluateGameState(table: any): any {
        //check si les conditions de fin de round sont remplies
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

}
