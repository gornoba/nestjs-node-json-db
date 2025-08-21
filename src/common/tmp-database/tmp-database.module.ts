import { DynamicModule, Global, Inject, Module } from '@nestjs/common';
import { TmpDatabaseService } from './tmp-database.service';
import { TmpEntityManagerService } from './tmp-entity-manager.service';
import { TmpEntity } from './tmp-database.type';

export const INJECT_JSON_DB = 'INJECT_JSON_DB';
export const InjectTmpEntityManager = () => Inject(INJECT_JSON_DB);

export const TmpRepository = (entity: any): ReturnType<typeof Inject> =>
  Inject(entity); // 엔티티 클래스 자체를 토큰으로 사용

@Global()
@Module({})
export class TmpDatabaseModule {
  static forRoot(config: { entity: TmpEntity[]; path: string }): DynamicModule {
    const { entity, path } = config;
    Reflect.defineMetadata(
      'TMP_DATABASE_PATH',
      {
        path,
        entity,
      },
      TmpDatabaseModule,
    );

    if (!path) {
      throw new Error('path is required');
    }

    const coreProviders = [
      {
        provide: 'TMP_DB_PATH',
        useValue: path,
      },
      TmpEntityManagerService,
      {
        provide: INJECT_JSON_DB,
        useClass: TmpEntityManagerService,
      },
    ];

    const entityProviders = entity.length
      ? entity.map((entityClass) => ({
          provide: entityClass,
          useFactory: (path: string) => {
            const tmp = new TmpDatabaseService<typeof entityClass>(
              path,
              entityClass,
            );
            return tmp;
          },
          inject: ['TMP_DB_PATH'],
        }))
      : [];

    const providers = [...coreProviders, ...entityProviders];

    return {
      module: TmpDatabaseModule,
      providers,
      exports: [...providers],
    };
  }

  static forFeature(entities: TmpEntity[]): DynamicModule {
    const providers = entities.map((entity) => ({
      provide: entity,
      useFactory: (path: string) => {
        const tmp = new TmpDatabaseService<typeof entity>(path, entity);
        return tmp;
      },
      inject: ['TMP_DB_PATH'],
    }));

    return {
      module: TmpDatabaseModule,
      providers,
      exports: entities,
    };
  }
}
