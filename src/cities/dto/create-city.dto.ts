import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCityDto {

  @ApiProperty({
    example: 'Москва',
    description: 'City name',
  })
  @IsString()
  name: string;
}
