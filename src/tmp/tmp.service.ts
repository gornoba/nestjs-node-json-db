import { Injectable } from '@nestjs/common';
import { TmpEntityManagerService } from 'src/common/tmp-database/tmp-entity-manager.service';
import {
  InjectTmpEntityManager,
  TmpRepository,
} from 'src/common/tmp-database/tmp-database.module';
import { TmpDatabaseService } from 'src/common/tmp-database/tmp-database.service';
import { Tmp1Entity } from 'src/entity/tmp1.entity';

@Injectable()
export class TmpService {
  constructor(
    @TmpRepository(Tmp1Entity)
    private readonly tmp1Repository: TmpDatabaseService<Tmp1Entity>,
    @InjectTmpEntityManager()
    private readonly jsonDb: TmpEntityManagerService,
  ) {}

  async create() {
    const tmp1 = new Tmp1Entity();
    tmp1.name = '33333';
    const data = await this.jsonDb.save(tmp1);
    return data;
  }

  async find() {
    const data = await this.jsonDb.find(Tmp1Entity, (a) => a.id === 3);
    return data;
  }
}
