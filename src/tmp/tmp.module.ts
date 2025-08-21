import { Module } from '@nestjs/common';
import { TmpService } from './tmp.service';
import { TmpDatabaseModule } from 'src/common/tmp-database/tmp-database.module';
import { Tmp1Entity } from 'src/entity/tmp1.entity';
import { TmpController } from './tmp.controller';

@Module({
  // imports: [TmpDatabaseModule.forFeature([Tmp1Entity])],
  controllers: [TmpController],
  providers: [TmpService],
})
export class TmpModule {}
