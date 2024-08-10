import { IsHexColor, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class Player {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsHexColor()
  color: string;

  @IsOptional()
  socketId?: string;
}
