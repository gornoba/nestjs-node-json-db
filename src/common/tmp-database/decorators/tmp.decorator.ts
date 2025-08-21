export function TmpEntity(options?: { name?: string; path?: string }) {
  return function (target: any) {
    const classMetadata = Reflect.getMetadata(`${target.name}:class`, target);

    Reflect.defineMetadata(
      `${target.name}:class`,
      {
        ...(classMetadata || {}),
        name: options?.name || target.name,
        path: options?.path || null,
        className: target.name,
      },
      target,
    );
  };
}

export function TmpPrimaryKey(options?: { type: 'increment' | 'uuid' }) {
  return function (target: any, propertyKey: string) {
    const entityName = target.constructor?.name;
    let classMetadata = Reflect.getMetadata(
      `${entityName}:class`,
      target.constructor,
    );

    if (!classMetadata) {
      classMetadata = {
        name: null,
        path: null,
        className: entityName,
        primaryKey: null,
      };
    }

    classMetadata.primaryKey = {
      propertyName: propertyKey,
      type: options?.type || 'increment',
      classsName: classMetadata.className,
    };

    Reflect.defineMetadata(
      `${entityName}:class`,
      classMetadata,
      target.constructor,
    );
  };
}

// 메서드 수준 데코레이터
export function TmpMethodDecorator(options?: {
  log?: boolean;
  cache?: boolean;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    // 메서드에 메타데이터 추가
    Reflect.defineMetadata(
      'tmp:method',
      {
        methodName: propertyKey,
        log: options?.log || false,
        cache: options?.cache || false,
        decoratedAt: new Date().toISOString(),
      },
      target,
      propertyKey,
    );

    // 메서드 래핑
    descriptor.value = function (...args: any[]) {
      const metadata = Reflect.getMetadata('tmp:method', target, propertyKey);

      if (metadata.log) {
        console.log(`[TmpMethodDecorator] ${propertyKey} 메서드 호출됨`);
        console.log(`[TmpMethodDecorator] 인자:`, args);
      }

      const result = originalMethod.apply(this, args);

      if (metadata.log) {
        console.log(`[TmpMethodDecorator] ${propertyKey} 메서드 결과:`, result);
      }

      return result;
    };

    console.log(
      `[TmpMethodDecorator] 메서드 ${propertyKey}에 데코레이터가 적용되었습니다.`,
    );
  };
}

// 매개변수 수준 데코레이터
export function TmpParameterDecorator(options?: {
  validate?: boolean;
  type?: string;
  description?: string;
}) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // 매개변수에 메타데이터 추가
    Reflect.defineMetadata(
      'tmp:parameter',
      {
        parameterIndex,
        methodName: propertyKey,
        validate: options?.validate || false,
        type: options?.type || 'any',
        description: options?.description || '',
        decoratedAt: new Date().toISOString(),
      },
      target,
      propertyKey,
    );

    console.log(
      `[TmpParameterDecorator] ${propertyKey} 메서드의 ${parameterIndex}번째 매개변수에 데코레이터가 적용되었습니다.`,
    );
  };
}

// 팩토리 데코레이터 (옵션에 따라 다른 동작)
export function TmpFactoryDecorator(
  factoryType: 'simple' | 'advanced' | 'custom',
) {
  return function (target: any) {
    switch (factoryType) {
      case 'simple':
        target.factoryType = 'simple';
        target.createInstance = () => new target();
        break;
      case 'advanced':
        target.factoryType = 'advanced';
        target.createInstance = (config: any) => {
          const instance = new target();
          Object.assign(instance, config);
          return instance;
        };
        break;
      case 'custom':
        target.factoryType = 'custom';
        target.createInstance = (factoryFn: (cls: any) => any) =>
          factoryFn(target);
        break;
    }

    console.log(
      `[TmpFactoryDecorator] ${target.name}에 ${factoryType} 팩토리가 적용되었습니다.`,
    );
  };
}
