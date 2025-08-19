import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JsonDbModule } from 'src/common/json-db.module';
import { UserEntity } from 'src/entity/user.entity';
import { BoardEntity } from 'src/entity/board.entity';

@Module({
  imports: [JsonDbModule.forFeature([UserEntity, BoardEntity])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
