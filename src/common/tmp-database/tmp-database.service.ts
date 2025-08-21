import { Inject, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { Config, JsonDB } from 'node-json-db';
import { join } from 'path';

@Injectable()
export class TmpDatabaseService<T> {
  private db: JsonDB;
  private basePath: string;

  constructor(
    @Inject('TMP_DB_PATH') private dbPath: string,
    entity: new () => T,
  ) {
    const tmpInfo = Reflect.getMetadata(`${entity.name}:class`, entity);

    if (tmpInfo) {
      const { name, path } = tmpInfo;
      const tmpPath = path ? join(this.dbPath, path) : this.dbPath;

      if (!existsSync(tmpPath)) {
        mkdirSync(tmpPath, { recursive: true });
      }

      const dbFilePath = join(tmpPath, `${name}.json`);
      if (!existsSync(dbFilePath)) {
        writeFileSync(dbFilePath, '{}', { encoding: 'utf8' });
      }

      this.db = new JsonDB(new Config(join(tmpPath, name), true, false, '/'));
      this.basePath = tmpPath;
    }
  }

  async find<T>(key: string): Promise<T[]> {
    const result = await this.db.getData(key);
    return result;
  }
}
