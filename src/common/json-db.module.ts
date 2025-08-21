import { DynamicModule, Global, Module } from '@nestjs/common';
import { JsonDbService } from './json-db.service';
import { Entity } from 'src/entity/entity.type';

@Global()
@Module({})
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
    };
  }

  static forFeature(entities: Entity[]): DynamicModule {
    const providers = entities.map((entity) => ({
      provide: entity,
      useFactory: (path: { path: string }) => {
        const tmp = new JsonDbService<typeof entity>(path, entity);
        return tmp;
      },
      inject: ['DB_PATH'],
    }));

    return {
      module: JsonDbModule,
      providers,
      exports: entities,
    };
  }
}
