import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { SkillsRepository } from './skills.repository';
import { Skill } from './entities/skill.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Skill]), UsersModule],
  controllers: [SkillsController],
  providers: [SkillsService, SkillsRepository],
  exports: [SkillsService],
})
export class SkillsModule {}
