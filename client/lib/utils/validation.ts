import Joi from 'joi';
import mongoose from 'mongoose';

export const objectIdValidator = Joi.string()
  .trim()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }, 'ObjectId validation')
  .messages({ 'any.invalid': 'Invalid ID format' });

export const itemValidationSchema = Joi.object({
  CultureName: Joi.string().min(3).max(100).required(),
  CultureDescription: Joi.string().min(10).max(500).required(),
  Region: Joi.string().min(3).max(100).required(),
  Significance: Joi.string().min(10).max(500).required(),
  created_by: objectIdValidator.required(),
});

export const updateValidationSchema = itemValidationSchema.fork(
  'created_by',
  (schema) => schema.optional()
);

export function validateObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function sanitizeId(value: any): string {
  return typeof value === 'string' ? value.trim() : value;
}
