import { Player } from '../models/player.model';

export class JoinLobbyDto {
  code: string;
  player: Player;
}
