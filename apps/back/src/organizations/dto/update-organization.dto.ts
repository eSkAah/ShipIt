import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name cannot be empty').max(100).optional(),
});

export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;
