import * as z from 'zod';

/** Schema provisório — ajustar ao contrato real do opin-service/BFF. */
export const PlanPriceItemSchema = z.object({
  plan: z.enum(['Essencial', 'Regular', 'Auto 1504']),
  monthly: z.number().positive(),
});

export const PlanPricesResponseSchema = z.object({
  plans: z.array(PlanPriceItemSchema).min(3),
});

export type PlanPricesResponse = z.infer<typeof PlanPricesResponseSchema>;
