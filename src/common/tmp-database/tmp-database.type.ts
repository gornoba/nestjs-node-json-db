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
  entity: new () => any;
  manyToOne?: {
    propertyName: string;
    joinClassName: string;
    joinProperty: string;
    entity: any;
    joinId: string;
  }[];
  oneToMany?: {
    propertyName: string;
    joinClassName: string;
    joinProperty: string;
    entity: any;
  }[];
}
export type FindOptionsRelationsProperty<Property> = Property extends Promise<
  infer I
>
  ? FindOptionsRelationsProperty<NonNullable<I>> | boolean
  : Property extends Array<infer I>
  ? FindOptionsRelationsProperty<NonNullable<I>> | boolean
  : Property extends boolean
  ? never
  : Property extends object
  ? FindOptionsRelations<Property> | boolean
  : boolean;

export type FindOptionsRelations<Entity> = {
  [P in keyof Entity]?: P extends 'toString'
    ? unknown
    : FindOptionsRelationsProperty<NonNullable<Entity[P]>>;
};
