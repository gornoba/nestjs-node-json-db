import { DynamicModule, Module } from '@nestjs/common';
import { JsonDbService } from './json-db.service';
import { Entity } from 'src/entity/entity.type';

@Module({
  providers: [],
})
export class JsonDbModule {
  static forRoot(path: { path: string }): DynamicModule {
    return {
      module: JsonDbModule,
      providers: [
        {
          provide: 'DB_PATH',
          useValue: path,
        },
      ],
      exports: ['DB_PATH'],
      global: true, // 전역 모듈로 설정하여 다른 모듈에서 접근 가능하게 함
    };
  }

  static forFeature(entities: Entity[]): DynamicModule {
    const providers = entities.map((entity) => ({
      provide: entity,
      useFactory: (path: { path: string }) => {
        return new JsonDbService<typeof entity>(path, entity);
      },
      inject: ['DB_PATH'],
    }));

    return {
      module: JsonDbModule,
      providers,
      exports: entities, // entity.name 대신 entity 자체를 export
    };
  }
}
