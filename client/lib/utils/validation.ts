import Joi from 'joi';

// PostgreSQL ID validation (numeric IDs)
export const objectIdValidator = Joi.alternatives()
  .try(
    Joi.number().integer().positive(),
    Joi.string().trim().pattern(/^\d+$/).custom((value) => parseInt(value, 10))
  )
  .messages({ 'any.invalid': 'Invalid ID format' });

export const postValidationSchema = Joi.object({
  caption: Joi.string().min(1).max(2200).required(),
  location: Joi.string().max(100).allow('').optional(),
  tags: Joi.string().max(200).allow('').optional(),
  created_by: objectIdValidator.required(),
});

export const updateValidationSchema = postValidationSchema.fork(
  'created_by',
  (schema) => schema.optional()
);

export function validateObjectId(id: string | number): boolean {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return !isNaN(numId) && numId > 0;
}

export function sanitizeId(value: any): string {
  return typeof value === 'string' ? value.trim() : value.toString();
}
