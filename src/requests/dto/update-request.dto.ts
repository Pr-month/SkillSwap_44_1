import { IsIn } from 'class-validator';
import { Status } from '../enum/status.enum';

export class UpdateRequestDto {
  @IsIn([Status.ACCEPTED, Status.REJECTED])
  status: Status.ACCEPTED | Status.REJECTED;
}
