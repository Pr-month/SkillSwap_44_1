import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSkillDto {

  @ApiProperty({
    description: 'Name of the skill',
    example: 'Игра на гитаре',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;


  @ApiProperty({
    description: 'Describes the skill',
    example: 'Играю рок музыку',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Category of the skill',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiProperty({
    description: 'Shows the image of the skill',
    example: ['image.png', 'image1.png'],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayNotEmpty()
  @IsString({ each: true })
  images?: string[];
}
