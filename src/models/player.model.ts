import { IsHexColor, IsNotEmpty, IsString } from 'class-validator';

export class Player {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsHexColor()
  color: string;
}
