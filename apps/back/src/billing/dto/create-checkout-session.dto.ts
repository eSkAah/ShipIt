import {
  createCheckoutSessionSchema,
  CreateCheckoutSessionDto as CreateCheckoutSessionDtoType,
} from '@shipit/validators';

export class CreateCheckoutSessionDto implements CreateCheckoutSessionDtoType {
  priceId!: string;
}

export { createCheckoutSessionSchema };
