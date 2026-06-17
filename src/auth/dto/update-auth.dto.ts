import { PartialType } from '@nestjs/mapped-types';
import { RegisterRequestDto } from './register-request.dto';

export class UpdateAuthDto extends PartialType(RegisterRequestDto) {}
