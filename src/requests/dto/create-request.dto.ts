import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({
    description: 'offered skill ID',
    example: 1,
  })
  @IsNumber()
  offeredSkillId: string;

  @ApiProperty({
    description: 'requested skill ID',
    example: 2,
  })
  @IsNumber()
  requestedSkillId: string;
}
