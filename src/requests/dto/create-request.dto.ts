import { IsNumber } from 'class-validator';

export class CreateRequestDto {
  @IsNumber()
  offeredSkillId: string;

  @IsNumber()
  requestedSkillId: string;
}
