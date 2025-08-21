import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Config, JsonDB } from 'node-json-db';
import { TmpDatabaseModule } from './tmp-database.module';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  FindOptionsRelations,
  TmpEntityOptions,
  TmpPrimaryKeyOptions,
} from './tmp-database.type';

@Injectable()
export class TmpEntityManagerService {
  private dbPath: string;

  constructor() {
    const { path } = Reflect.getMetadata(
      'TMP_DATABASE_PATH',
      TmpDatabaseModule,
    );
    this.dbPath = path;
  }

  async find<T>(
    entity: new () => T,
    options?: {
      callback?: (a: T) => boolean;
      releation?: FindOptionsRelations<T>;
    },
  ): Promise<T[]> {
    const { callback, releation } = options || {};
    const { db, name, manyToOne, oneToMany, primaryKey } = this.getDb(entity);

    const exists = await db.exists(`data/${name}`);

    if (!exists) {
      return [];
    }

    if (callback) {
      const data = await db.filter(`data/${name}`, callback);
      return data as T[];
    }

    const data = await db.getData(`data/${name}`);

    if (releation) {
      if (oneToMany && oneToMany.length) {
        for (const item of oneToMany) {
          const isReleation = Object.entries(releation).every(
            ([key, value]) => {
              if (key === item.propertyName) {
                return value;
              }
              return false;
            },
          );

          if (isReleation) {
            const joinEntity = item.entity();
            const { primaryKey: JoinPrimaryKey } = this.getDb(joinEntity);
            const isObject = this.isObject(releation[item.propertyName]);

            for (const dataItem of data) {
              const joinData = await this.find(joinEntity, {
                callback: (a) =>
                  a[JoinPrimaryKey.propertyName] ===
                  dataItem[primaryKey.propertyName],
                ...(isObject && { releation: releation[item.propertyName] }),
              });
              dataItem[item.propertyName] = joinData;
            }
          }
        }
      }

      if (manyToOne && manyToOne.length) {
        for (const item of manyToOne) {
          const isReleation = Object.entries(releation).every(
            ([key, value]) => {
              if (key === item.propertyName) {
                return value;
              }
              return false;
            },
          );

          if (isReleation) {
            const entity = item.entity();
            const { primaryKey: JoinPrimaryKey } = this.getDb(entity);
            const isObject = this.isObject(releation[item.propertyName]);

            for (const dataItem of data) {
              const joinKey = dataItem[item.joinId];
              const joinData = await this.findOne(entity, {
                callback: (a) => a[JoinPrimaryKey.propertyName] === joinKey,
                ...(isObject && { releation: releation[item.propertyName] }),
              });
              dataItem[item.propertyName] = joinData;
            }
          }
        }
      }
    }

    return data as T[];
  }

  async findOne<T>(
    entity: new () => T,
    options?: {
      callback: (a: T) => boolean;
      releation?: FindOptionsRelations<T>;
    },
  ): Promise<T> {
    const { callback, releation } = options || {};
    const { db, name, manyToOne, oneToMany, primaryKey } = this.getDb(entity);

    const exists = await db.exists(`data/${name}`);

    if (!exists) {
      return null;
    }

    const data = await db.find(`data/${name}`, callback);

    if (releation) {
      if (oneToMany && oneToMany.length) {
        for (const item of oneToMany) {
          const isReleation = Object.entries(releation).every(
            ([key, value]) => {
              if (key === item.propertyName) {
                return value;
              }
              return false;
            },
          );

          if (isReleation) {
            const joinEntity = item.entity();
            const { primaryKey: JoinPrimaryKey } = this.getDb(joinEntity);
            const isObject = this.isObject(releation[item.propertyName]);

            const joinData = await this.find(joinEntity, {
              callback: (a) =>
                a[JoinPrimaryKey.propertyName] ===
                data[primaryKey.propertyName],
              ...(isObject && { releation: releation[item.propertyName] }),
            });
            data[item.propertyName] = joinData;
          }
        }
      }

      if (manyToOne && manyToOne.length) {
        for (const item of manyToOne) {
          const isReleation = Object.entries(releation).every(
            ([key, value]) => {
              if (key === item.propertyName) {
                return value;
              }
              return false;
            },
          );

          if (isReleation) {
            const entity = item.entity();
            const { primaryKey: JoinPrimaryKey } = this.getDb(entity);
            const isObject = this.isObject(releation[item.propertyName]);

            const joinKey = data[item.joinId];
            const joinData = await this.findOne(entity, {
              callback: (a) => a[JoinPrimaryKey.propertyName] === joinKey,
              ...(isObject && { releation: releation[item.propertyName] }),
            });
            data[item.propertyName] = joinData;
          }
        }
      }
    }

    return data as T;
  }

  async save<T>(
    entity: T,
    options?: { override?: boolean; reload?: boolean },
  ): Promise<T>;
  async save<T>(
    entity: T[],
    options?: { override?: boolean; reload?: boolean },
  ): Promise<T[]>;
  async save<T>(
    entity: T | T[],
    options?: { override?: boolean; reload?: boolean },
  ): Promise<T | T[]> {
    const { db, name, primaryKey } = this.getDb(entity[0] || entity);
    const { override = false, reload = true } = options || {};
    const { propertyName } = primaryKey;
    const totalCount = await this.getTotalCount(db, `data/${name}`);
    const exists = await db.exists(`data/${name}`);

    if (Array.isArray(entity)) {
      let index = 0;
      const result: T[] = [];
      for (const item of entity) {
        if (!item[propertyName]) {
          const itemResult = (await this.insert(
            db,
            name,
            item,
            override,
            primaryKey,
            totalCount + index,
            reload,
          )) as T;
          itemResult && result.push(itemResult);
          index++;
        } else {
          const itemResult = (await this.update(
            db,
            name,
            item,
            propertyName,
            override,
            reload,
          )) as T;
          itemResult && result.push(itemResult);
        }
      }
      return reload ? (result as T[]) : [];
    }

    if (!entity[propertyName]) {
      const result = await this.insert(
        db,
        name,
        entity,
        override,
        primaryKey,
        totalCount,
        reload,
      );

      return reload ? (result as T) : null;
    }

    if (!exists) {
      throw new InternalServerErrorException(
        `[${name}] 데이터가 존재하지 않습니다.`,
      );
    }

    const updateResult = await this.update(
      db,
      name,
      entity,
      propertyName,
      override,
      reload,
    );

    return updateResult as T;
  }

  async detete<T>(entity: new () => T, primaryKeyValue: number | string) {
    const { db, name, primaryKey } = this.getDb(entity);
    const { propertyName } = primaryKey;
    const findDataIndex = await db.getIndex(
      `data/${name}`,
      primaryKeyValue,
      propertyName,
    );

    if (findDataIndex === -1) {
      throw new InternalServerErrorException(
        `[${name}] 데이터가 존재하지 않습니다.`,
      );
    }

    await db.delete(`data/${name}[${findDataIndex}]`);
    return true;
  }

  private async update<T>(
    db: JsonDB,
    name: string,
    entity: T,
    propertyName: string,
    override: boolean,
    reload: boolean,
  ) {
    const [findDataIndex, findData] = await Promise.all([
      db.getIndex(`data/${name}`, entity[propertyName], propertyName),
      db.find(
        `data/${name}`,
        (item) => item[propertyName] === entity[propertyName],
      ),
    ]);

    if (findData) {
      Object.assign(findData, entity);
      await Promise.all([
        db.push(`data/${name}`, [findData], override || false),
        db.delete(`data/${name}[${findDataIndex}]`),
      ]);

      const result = await db.find(
        `data/${name}`,
        (item) => item[propertyName] === entity[propertyName],
      );
      return reload ? result : null;
    }

    return null;
  }

  private async insert<T>(
    db: JsonDB,
    name: string,
    entity: T,
    override: boolean,
    primaryKey: TmpPrimaryKeyOptions,
    totalCount: number,
    reload: boolean,
  ) {
    this.generateId(entity, primaryKey, totalCount);
    await db.push(`data/${name}`, [entity], override || false);

    if (reload) {
      const result = await db.find(
        `data/${name}`,
        (item) =>
          item[primaryKey.propertyName] === entity[primaryKey.propertyName],
      );
      return result;
    }
    return null;
  }

  private async getTotalCount(db: JsonDB, path: string) {
    try {
      const totalCount = await db.count(path);
      return totalCount;
    } catch (error) {
      return 0;
    }
  }

  private getDb<T>(entity: new () => T) {
    const constructorName =
      entity.constructor.name === 'Function'
        ? entity.name
        : entity.constructor.name;
    const target =
      entity.constructor.name === 'Function' ? entity : entity.constructor;

    const tmpInfo = Reflect.getMetadata(
      `${constructorName}:class`,
      target,
    ) as TmpEntityOptions;
    const { name, path, primaryKey, manyToOne, oneToMany } = tmpInfo;
    const tmpPath = path ? join(this.dbPath, path) : this.dbPath;
    const db = new JsonDB(new Config(join(tmpPath, name), true, false, '/'));
    return { db, name, primaryKey, manyToOne, oneToMany };
  }

  private generateId<T>(
    entity: T,
    primaryKey: TmpPrimaryKeyOptions,
    totalCount?: number,
  ) {
    const { type, propertyName } = primaryKey;
    if (type === 'increment') {
      entity[propertyName] = totalCount + 1;
    } else {
      entity[propertyName] = uuidv4();
    }
  }

  private isObject(value: any) {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
  }
}
