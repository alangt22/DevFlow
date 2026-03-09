import { z } from "zod";

export const createCardSchema = z.object({
  listId: z.string().nonempty("ID da list é obrigatório"),
  title: z
    .string()
    .min(3, "Título muito curto")
    .nonempty("Título é obrigatório")
    .max(50, "Título muito longo"),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
