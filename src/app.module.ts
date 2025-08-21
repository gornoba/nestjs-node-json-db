import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TmpDatabaseModule } from './common/tmp-database/tmp-database.module';
import { Tmp1Entity } from './entity/tmp1.entity';
import { Tmp2Entity } from './entity/tmp2.entity';
import { TmpModule } from './tmp/tmp.module';
// import { JsonDbModule } from './common/json-db.module';

@Module({
  imports: [
    // JsonDbModule.forRoot({ path: 'data' })
    TmpDatabaseModule.forRoot({
      entity: [Tmp1Entity, Tmp2Entity],
      path: 'data',
    }),
    TmpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
