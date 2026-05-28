import { PipeTransform, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ValidationPipe.name);

  async transform(value: any, metadata: any) {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => ({
          field: error.property,
          messages: Object.values(error.constraints || {}),
        }))
        .flat();

      this.logger.warn(`Validation failed: ${JSON.stringify(errorMessages)}`);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
