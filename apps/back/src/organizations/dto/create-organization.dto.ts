import {
  createOrganizationSchema,
  CreateOrganizationDto as CreateOrganizationDtoType,
} from '@shipit/validators';

export class CreateOrganizationDto implements CreateOrganizationDtoType {
  name!: string;
}

export { createOrganizationSchema };
