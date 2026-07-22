import { IsIn } from 'class-validator';
import { Status } from '../enum/status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRequestDto {
  @ApiProperty({
    description: 'Status',
    enum: [Status.ACCEPTED, Status.REJECTED],
    example: Status.ACCEPTED,
  })
  @IsIn([Status.ACCEPTED, Status.REJECTED])
  status: Status.ACCEPTED | Status.REJECTED;
}
