import { z } from 'zod';
import { updateProfileSchema } from '@shipit/validators';

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export { updateProfileSchema };
