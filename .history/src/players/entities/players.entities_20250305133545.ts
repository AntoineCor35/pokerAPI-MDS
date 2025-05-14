export class Player {
  id: number;
  name: string;
  chips: number;
  hand: Card[];
  tableId: number;
  position: number;
  hasFolded: boolean;
  hasPlayed: boolean;
  isAllIn: boolean;
  currentBet: number;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  isActive: boolean;
  isAI: boolean;
  isCurrentPlayer: boolean;
  isHuman: boolean;

  constructor(partial: Partial<Player>) {
    Object.assign(this, partial);
    this.hand = [];
    this.hasFolded = false;
    this.hasPlayed = false;
    this.isAllIn = false;
    this.currentBet = 0;
    this.isDealer = false;
    this.isSmallBlind = false;
    this.isBigBlind = false;
    this.isActive = true;
    this.isAI = false;
    this.isCurrentPlayer = false;
    this.isHuman = false;
  }
}

export class Card {
  suit: string; 
  value: string;
  
  constructor(suit: string, value: string) {
    this.suit = suit;
    this.value = value;
  }
}
