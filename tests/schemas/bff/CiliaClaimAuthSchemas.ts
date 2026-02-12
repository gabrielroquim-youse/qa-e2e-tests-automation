import * as z from 'zod';

export const CiliaClaimAuthSchema = z.array(
  z.object({
    product: z.string(),
    number: z.string(),
    partner_id: z.string().nullable(),
    coverages: z.array(
      z.object({
        uid: z.string(),
        name: z.string(),
        has_active_claim: z.boolean(),
      }),
    ),
    vehicle: z.object({
      make: z.string(),
      model: z.string(),
      version: z.string(),
      license_plate: z.string(),
      vin: z.string(),
      fuel_type: z.string(),
    }),
    insured_person: z.object({
      email: z.string(),
      name: z.string(),
      phone: z.string(),
    }),
    main_driver: z.object({
      name: z.string(),
    }),
  }),
);
