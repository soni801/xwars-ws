import { IsBoolean, IsNumber } from 'class-validator';

export class TakeTileDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsBoolean()
  largeTile: boolean;
}
