import {
  TmpEntity,
  TmpPrimaryKey,
} from '../common/tmp-database/decorators/tmp.decorator';

// 클래스 수준 데코레이터 적용
@TmpEntity({ name: 'tmp1' })
// @TmpFactoryDecorator('advanced')
export class Tmp1Entity {
  // 속성 수준 데코레이터 적용
  // @TmpPropertyDecorator({ required: true, minLength: 2, maxLength: 50 })
  // id: number;
  @TmpPrimaryKey({ type: 'increment' })
  id: number;

  // @TmpPropertyDecorator({
  //   required: true,
  //   minLength: 1,
  //   maxLength: 100,
  //   pattern: /^[a-zA-Z가-힣\s]+$/,
  // })
  name: string;

  // 메서드 수준 데코레이터 적용
  // @TmpMethodDecorator({ log: true, cache: true })
  // getDisplayName(): string {
  //   return `${this.id}: ${this.name}`;
  // }

  // @TmpMethodDecorator({ log: true })
  // updateName(
  //   @TmpParameterDecorator({
  //     validate: true,
  //     type: 'string',
  //     description: '새로운 이름',
  //   })
  //   newName: string,
  // ): void {
  //   this.name = newName;
  // }

  // 정적 메서드에도 데코레이터 적용 가능
  // @TmpMethodDecorator({ log: true })
  // static create(id: number, name: string): Tmp1Entity {
  //   const entity = new Tmp1Entity();
  //   entity.id = id;
  //   entity.name = name;
  //   return entity;
  // }
}
