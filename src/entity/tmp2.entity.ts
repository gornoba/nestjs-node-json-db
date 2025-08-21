import { TmpEntity } from 'src/common/tmp-database/decorators/tmp.decorator';

@TmpEntity({ name: 'tmp2' })
export class Tmp2Entity {
  id: number;
  name: string;
}
