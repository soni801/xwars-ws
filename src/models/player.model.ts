import {
  IsBoolean,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class Player {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsHexColor()
  color: string;

  @IsString()
  @IsOptional()
  socketId?: string;

  @IsBoolean()
  @IsOptional()
  ready?: boolean;
}
