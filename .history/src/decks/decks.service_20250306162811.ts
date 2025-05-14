import { Injectable } from '@nestjs/common';

@Injectable()
export class DecksService {
    private deck: any[];

    constructor() {
        this.initializeDeck();
    }

    public initializeDeck(): void {
        // Crée un nouveau deck de 52 cartes
        const colors = ['Heart', 'Diamond', 'Clover', 'Spade'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.deck = [];
        
        let index = 0;
        for (const suit of colors) {
            for (const value of values) {
                this.deck.push({ index, value, suit });
                index++;
            }
        }
        this.shuffle();
    }
  
    public shuffle(): void {
        this.deck.forEach((_: any, i: any, deck: any) => {
            const shuffled = Math.floor(Math.random() * deck.length);
            [deck[i], deck[shuffled]] = [deck[shuffled], deck[i]];
        });
    }

    private drawCard(): any {
        // Tire une carte du deck
        if (this.deck.length === 0) {
            throw new Error('Deck vide');
        }
        const drawnCard = this.deck.shift();
        console.log('Carte pioché:', drawnCard);
        return drawnCard;
    }

    private burn(): void {
        // Retire une carte du deck
        this.drawCard(); 
    }

    public dealFlop(): any[] {
        // Tire 3 cartes pour le flop
        this.burn();
        const flop = [];
        for (let i = 0; i < 3; i++) {
            flop.push(this.drawCard());
        }
        return flop;
    }

    public dealTurn(): any {
        // Tire 1 carte pour le turn
        this.burn();
        return this.drawCard();
    }

    public dealRiver(): any {
        // Tire 1 carte pour la river
        this.burn();
        return this.drawCard();
    }

    public distribute(players: any[]): void {
        // Distribue 2 cartes à chaque joueur
        players.forEach(player => {
            player.hand = [this.drawCard(), this.drawCard()];
        });
    }
}
