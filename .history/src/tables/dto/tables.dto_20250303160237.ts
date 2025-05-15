import { Player } from '../../players/entities/players.entities';

export interface Card {
  suit: string;
  value: string;
  rank: number;
}

export interface Table {
  id: number;
  name: string;
  status: 'Waiting' | 'Ongoing' | 'Finished';
  round: number;
  turn: number;
  currentBlind: number;
  smallBlind: number;
  bigBlind: number;
  currentBet: number;
  pot: number;
  dealerPosition: number;
  river: Card[];
  players: Player[];
  maxPlayers: number;
  minPlayers: number;
  lastWinner?: number;
  winningHand?: Card[];
}

export interface TableJoinResponse {
  success: boolean;
  table?: Table;
  error?: string;
}

export interface TableActionResponse {
  success: boolean;
  table?: Table;
  error?: string;
} 