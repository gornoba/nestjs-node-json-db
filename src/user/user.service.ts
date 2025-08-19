import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/entity/user.entity';
import { JsonDbService } from 'src/common/json-db.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserEntity)
    private readonly userDb: JsonDbService<UserEntity>,
  ) {}

  async getData(key: string) {
    const result = await this.userDb.getData(key);
    return result;
  }

  async saveData(key: string, data: UserEntity) {
    return await this.userDb.saveData(key, data);
  }
}
