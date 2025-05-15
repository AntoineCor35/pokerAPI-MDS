export interface ActionDto {
  name: string;
  description: string;
  isAvailable?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

export interface ActionRequestDto {
  name: string;
  playerId: number;
  amount?: number;
}

export interface ActionResponseDto {
  success: boolean;
  message: string;
  action?: ActionDto;
} 