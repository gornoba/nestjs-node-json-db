import { Inject, Injectable } from '@nestjs/common';
import { Config, JsonDB } from 'node-json-db';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
//

@Injectable()
export class JsonDbService<T> {
  public db: JsonDB;

  constructor(
    @Inject('DB_PATH') private dbPath: { path: string },
    entity: any,
  ) {
    const baseDirectoryPath = this.dbPath.path;
    const fileBaseName = entity.name;

    if (!existsSync(baseDirectoryPath)) {
      mkdirSync(baseDirectoryPath, { recursive: true });
    }

    const dbFilePath = join(baseDirectoryPath, `${fileBaseName}.json`);
    if (!existsSync(dbFilePath)) {
      writeFileSync(dbFilePath, '{}', { encoding: 'utf8' });
    }

    this.db = new JsonDB(
      new Config(join(baseDirectoryPath, fileBaseName), true, false, '/'),
    );
  }

  async getData(key: string): Promise<T> {
    return await this.db.getData(key);
  }

  async saveData(key: string, data: T): Promise<void> {
    await this.db.push('/test1', 'super test');

    // When pushing new data for a DataPath that doesn't exist, it automatically creates the hierarchy
    await this.db.push('/test2/my/test', 5);

    // You can also push objects directly
    await this.db.push('/test3', { test: 'test', json: { test: ['test'] } });

    // If you don't want to override the data but to merge them
    // The merge is recursive and works with Object and Array.
    await this.db.push(
      '/test3',
      {
        new: 'cool',
        json: {
          important: 5,
        },
      },
      false,
    );
    await this.db.push('/test2/my/test/', 10, false);
    // for (const [key, value] of Object.entries(data)) {
    //   await this.db.push(`/${key}`, value, true);
    // }
    // await this.db.save()

    const data1 = await this.db.getData('/');
    console.log('🚀 ~ JsonDbService ~ saveData ~ data1:', data1);

    // Or from a particular DataPath
    const data2 = await this.db.getData('/test1');
    console.log('🚀 ~ JsonDbService ~ saveData ~ data2:', data2);

    // If you try to get some data from a DataPath that doesn't exist
    // You'll get an Error
    try {
      const data = await this.db.getData('/test1/test/dont/work');
    } catch (error) {
      // The error will tell you where the DataPath stopped. In this case test1
      // Since /test1/test does't exist.
      console.error(error);
    }
  }

  async getObject<T>(dataPath: string): Promise<T> {
    return await this.db.getObject<T>(dataPath);
  }

  async getObjectDefault<T>(dataPath: string, defaultValue?: T): Promise<T> {
    return await this.db.getObjectDefault<T>(dataPath, defaultValue);
  }

  async filter<T>(
    rootPath: string,
    callback: (entry: any, index: number | string) => boolean,
  ): Promise<T[] | undefined> {
    return await this.db.filter<T>(rootPath, callback);
  }

  async find<T>(
    rootPath: string,
    callback: (entry: any, index: number | string) => boolean,
  ): Promise<T | undefined> {
    return await this.db.find<T>(rootPath, callback);
  }
}
