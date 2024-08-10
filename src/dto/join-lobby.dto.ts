import { Player } from '../models/player.model';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class JoinLobbyDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Player)
  player: Player;
}
