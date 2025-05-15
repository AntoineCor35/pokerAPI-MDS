import { Player } from '../../players/entities/players.entities';
import { ApiProperty } from '@nestjs/swagger';

export class GameLogEntry {
  timestamp: Date;
  type: 'action' | 'turn' | 'round' | 'cards' | 'pot';
  message: string;
  data?: any;
}

export class CardDto {
  suit: string;
  value: string;
  rank: number;
}

export class TableDto {
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
  gameLog: GameLogEntry[];
}

export class TableJoinResponseDto {
  success: boolean;
  error?: string;
  table?: TableDto;
  currentPlayer?: any;
  possibleActions?: any;
}

export class TableActionResponseDto {
  @ApiProperty({ description: 'Whether the action was successful' })
  success: boolean;

  @ApiProperty({ description: 'Message about the action result' })
  message?: string;

  @ApiProperty({ description: 'Error message', type: String, required: false })
  error?: string;

  @ApiProperty({ description: 'Updated table data', type: Object, required: false })
  table?: any;

  @ApiProperty({ description: 'Current player', type: Object, required: false })
  currentPlayer?: any;

  @ApiProperty({ description: 'Possible actions', type: [String], required: false })
  possibleActions?: string[];
} 