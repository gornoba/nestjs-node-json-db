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
    return await this.userDb.findOne(key);
  }

  async saveData(key: string, data: UserEntity) {
    return await this.userDb.saveData(key, data);
  }
}
