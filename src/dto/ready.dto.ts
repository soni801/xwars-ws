import { IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Player } from '../models/player.model';

export class ReadyDto {
  @IsBoolean()
  ready: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => Player)
  player: Player;
}
