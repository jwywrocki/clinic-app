import { z } from 'zod';

// ─── Services ────────────────────────────────────────────────────────────────

export const CreateServiceSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  description: z.string().default(''),
  icon: z.string().default(''),
  is_published: z.boolean().default(false),
  order_position: z.number().int().default(0),
});
export const UpdateServiceSchema = CreateServiceSchema.partial();
export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;

// ─── News ────────────────────────────────────────────────────────────────────

export const CreateNewsSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  slug: z.string().min(1, 'Slug jest wymagany'),
  content: z.string().min(1, 'Treść jest wymagana'),
  image_url: z.string().nullable().default(null),
  excerpt: z.string().nullable().default(null),
  published_at: z.string().nullable().default(null),
  is_published: z.boolean().default(false),
  created_by: z.string().nullable().default(null),
});
export const UpdateNewsSchema = CreateNewsSchema.partial();
export type CreateNewsInput = z.infer<typeof CreateNewsSchema>;
export type UpdateNewsInput = z.infer<typeof UpdateNewsSchema>;

// ─── Pages ───────────────────────────────────────────────────────────────────

export const CreatePageSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  slug: z.string().min(1, 'Slug jest wymagany'),
  content: z.string().min(1, 'Treść jest wymagana'),
  meta_description: z.string().nullable().default(null),
  is_published: z.boolean().default(false),
  survey_id: z.string().nullable().default(null),
  created_by: z.string().nullable().default(null),
  specialization_ids: z.array(z.string()).default([]),
});
export const UpdatePageSchema = CreatePageSchema.partial();
export type CreatePageInput = z.infer<typeof CreatePageSchema>;
export type UpdatePageInput = z.infer<typeof UpdatePageSchema>;

// ─── Menu Items ──────────────────────────────────────────────────────────────

export const CreateMenuItemSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  url: z.string().nullable().default(null),
  order_position: z.number().int().default(0),
  parent_id: z.string().nullable().default(null),
  is_published: z.boolean().default(true),
  created_by: z.string().nullable().default(null),
});
export const UpdateMenuItemSchema = CreateMenuItemSchema.partial();
export type CreateMenuItemInput = z.infer<typeof CreateMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof UpdateMenuItemSchema>;

// ─── Doctors ─────────────────────────────────────────────────────────────────

export const CreateDoctorSchema = z.object({
  first_name: z.string().min(1, 'Imię jest wymagane'),
  last_name: z.string().min(1, 'Nazwisko jest wymagane'),
  specialization: z.string().min(1, 'Specjalizacja jest wymagana'),
  specialization_ids: z.array(z.string()).min(1, 'Wybierz co najmniej jedną specjalizację'),
  bio: z.string().default(''),
  image_url: z.string().default(''),
  schedule: z.string().default(''),
  is_active: z.boolean().default(true),
  order_position: z.number().int().default(1),
});
export const UpdateDoctorSchema = CreateDoctorSchema.partial();
export type CreateDoctorInput = z.infer<typeof CreateDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof UpdateDoctorSchema>;

// ─── Surveys ─────────────────────────────────────────────────────────────────

export const SaveSurveySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Tytuł ankiety jest wymagany'),
  is_published: z.boolean().default(false),
  created_by: z.string().nullable().default(null),
  questions: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().min(1),
        type: z.enum(['single', 'multi', 'text']),
        order_no: z.number().int(),
        options: z
          .array(
            z.object({
              id: z.string().optional(),
              text: z.string().min(1),
              order_no: z.number().int(),
            })
          )
          .default([]),
      })
    )
    .default([]),
});
export type SaveSurveyInput = z.infer<typeof SaveSurveySchema>;

// ─── Contact Groups ──────────────────────────────────────────────────────────

export const CreateContactGroupSchema = z.object({
  label: z.string().min(1, 'Etykieta jest wymagana'),
  in_hero: z.boolean().default(false),
  in_footer: z.boolean().default(true),
  order_position: z.number().int().default(0),
});
export const UpdateContactGroupSchema = CreateContactGroupSchema.partial();
export type CreateContactGroupInput = z.infer<typeof CreateContactGroupSchema>;
export type UpdateContactGroupInput = z.infer<typeof UpdateContactGroupSchema>;

// ─── Contact Details ─────────────────────────────────────────────────────────

const contactDetailTypeEnum = z.enum(['phone', 'email', 'address', 'hours', 'emergency_contact']);

export const CreateContactDetailSchema = z.object({
  type: contactDetailTypeEnum,
  value: z.string().min(1, 'Wartość jest wymagana'),
  group_id: z.string().min(1, 'ID grupy jest wymagane'),
  order_position: z.number().int().default(0),
});
export const UpdateContactDetailSchema = z.object({
  type: contactDetailTypeEnum.optional(),
  value: z.string().min(1).optional(),
  group_id: z.string().min(1).optional(),
  order_position: z.number().int().optional(),
});
export type CreateContactDetailInput = z.infer<typeof CreateContactDetailSchema>;
export type UpdateContactDetailInput = z.infer<typeof UpdateContactDetailSchema>;

// ─── Users ───────────────────────────────────────────────────────────────────

export const CreateUserSchema = z.object({
  username: z.string().min(3, 'Nazwa użytkownika musi mieć co najmniej 3 znaki'),
  password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
  is_active: z.boolean().default(true),
  role: z.string().optional(),
});
export const UpdateUserSchema = z.object({
  username: z.string().min(3).optional(),
  password: z.string().min(8).optional(),
  is_active: z.boolean().optional(),
  role: z.string().optional(),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatZodError(issues: z.ZodIssue[]): string {
  return issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
}
