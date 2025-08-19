import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JsonDbModule } from './common/json-db.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [JsonDbModule.forRoot({ path: 'data' }), UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
