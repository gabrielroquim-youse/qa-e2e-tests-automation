import * as z from 'zod';

export const TestUtilsClaimDataSchema = z.object({
  claim_number: z.string(),
  protocol_number: z.string(),
  policy_number: z.string(),
  email: z.string(),
  password: z.string(),
});

export const TestUtilsCustomerDataSchema = z.object({
  email: z.string(),
  password: z.string(),
});

z.object({});

export const TestUtilsPolicyDataSchema = z.object({
  policy_number: z.string(),
  email: z.string(),
  password: z.string(),
});

export const TestUtilsCiDataSchema = z.object({
  number: z.string(),
});

export type TestUtilsClaimData = z.infer<typeof TestUtilsClaimDataSchema>;
export type TestUtilsCustomerData = z.infer<typeof TestUtilsCustomerDataSchema>;
export type TestUtilsPolicyData = z.infer<typeof TestUtilsPolicyDataSchema>;
export type TestUtilsCiData = z.infer<typeof TestUtilsCiDataSchema>;

export type TestUtilsProtocolData = {
  flow: string;
  protocol_number: string;
  status: string;
  data: TestUtilsPolicyData | TestUtilsCustomerData | TestUtilsClaimData | TestUtilsCiData;
  failure_reasons: string[];
};
