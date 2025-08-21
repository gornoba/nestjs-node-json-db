import { TmpDatabaseModule } from './tmp-database.module';

const { entity } = Reflect.getMetadata('TMP_DATABASE_PATH', TmpDatabaseModule);

// 기존 TmpEntity 타입
export type TmpEntity = (typeof entity)[number];

export interface TmpPrimaryKeyOptions {
  propertyName: string;
  type: 'increment' | 'uuid';
  classsName: string;
}

export interface TmpEntityOptions {
  name?: string;
  path?: string;
  className: string;
  primaryKey?: TmpPrimaryKeyOptions;
}
