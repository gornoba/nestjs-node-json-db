import { Injectable } from '@nestjs/common';
import { TmpEntityManagerService } from 'src/common/tmp-database/tmp-entity-manager.service';
import {
  InjectTmpEntityManager,
  TmpRepository,
} from 'src/common/tmp-database/tmp-database.module';
import { TmpDatabaseService } from 'src/common/tmp-database/tmp-database.service';
import { Tmp1Entity } from 'src/entity/tmp1.entity';
import { Tmp2Entity } from 'src/entity/tmp2.entity';

@Injectable()
export class TmpService {
  constructor(
    // @TmpRepository(Tmp1Entity)
    // private readonly tmp1Repository: TmpDatabaseService<Tmp1Entity>,
    @InjectTmpEntityManager()
    private readonly jsonDb: TmpEntityManagerService,
  ) {}

  async create() {
    const tmp1 = new Tmp1Entity();
    tmp1.name = '11111';
    const data = await this.jsonDb.save(tmp1);

    const tmp2 = new Tmp2Entity();
    tmp2.name = '22222';
    tmp2.tmp1Id = data.id;
    const data2 = await this.jsonDb.save(tmp2);

    return {
      data,
      data2,
    };
  }

  async find() {
    const data1 = await this.jsonDb.find(Tmp2Entity, {
      releation: {
        tmp1: {
          tmp2: true,
        },
      },
    });
    const data2 = await this.jsonDb.find(Tmp1Entity, {
      releation: {
        tmp2: true,
      },
    });
    // const data3 = await this.tmp1Repository.find('data/tmp1');
    // console.log('🚀 ~ TmpService ~ find ~ data3:', data3);
    return {
      data1,
      data2,
    };
  }
}
