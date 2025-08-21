import {
  TmpEntity,
  TmpManyToOne,
  TmpPrimaryKey,
} from 'src/common/tmp-database/decorators/tmp.decorator';
import { Tmp1Entity } from './tmp1.entity';

@TmpEntity({ name: 'tmp2' })
export class Tmp2Entity {
  @TmpPrimaryKey({ type: 'increment' })
  id: number;
  name: string;

  @TmpManyToOne(() => Tmp1Entity, (tmp1) => tmp1.tmp2, 'tmp1Id')
  tmp1: Tmp1Entity;

  tmp1Id: number;
}
