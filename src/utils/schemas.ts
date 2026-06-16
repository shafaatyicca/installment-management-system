import * as z from "zod";

export const customerSchema = z.object({
  name: z.string().min(3, "Naam kam az kam 3 huroof ka hona chahiye"),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, "CNIC format galat hai (xxxxx-xxxxxxx-x)"),
  mobile: z.string().min(11, "Mobile number kam az kam 11 digits ka ho").max(12),
  address: z.string().min(10, "Mukammal pata (Address) lazmi hai"),
  guarantorName: z.string().optional(),
  guarantorMobile: z.string().optional(),
  guarantorCnic: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "Product ka naam kam az kam 2 huroof ka ho"),
  costPrice: z.coerce.number().min(1, "Khareed qeemat (Cost Price) 0 se zyada honi chahiye"),
  stock: z.string().or(z.number()).transform((val) => Number(val)).optional(),
  brand: z.string().optional(),
  modelNumber: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;