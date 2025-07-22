import { Player } from './player.model';

export class Lobby {
  code: string;
  players: Player[];
  inGame: boolean;
  currentPlayer: number;
  startTimeoutId?: NodeJS.Timeout;
}
