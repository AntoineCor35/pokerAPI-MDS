import { Player } from '../../players/entities/players.entities';
import { ApiProperty } from '@nestjs/swagger';

export class CardDto {
  suit: string;
  value: string;
  rank: number;
}

export class TableDto {
  @ApiProperty({ description: 'The unique identifier of the table', example: 1 })
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
  river: CardDto[];
  players: Player[];
  maxPlayers: number;
  minPlayers: number;
  lastWinner?: number;
  winningHand?: CardDto[];
}

export class TableJoinResponseDto {
  success: boolean;
  table?: TableDto;
  error?: string;
}

export class TableActionResponseDto {
  success: boolean;
  table?: TableDto;
  error?: string;
} 