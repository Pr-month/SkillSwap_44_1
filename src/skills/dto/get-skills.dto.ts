import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetSkillsQueryDto {

  @ApiProperty({
    description: 'Number of the page of the skill',
    example: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of skills per page',
    example: 2,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: 'Search for the skill',
    example: 'Игра на гитаре',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string = '';

  @ApiProperty({
    description: 'Category of the skill',
    example: 'Музыка',
    required: false
  })
  @IsOptional()
  @IsString()
  category?: string = '';
}
