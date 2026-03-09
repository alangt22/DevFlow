import { z } from "zod";

export const createListSchema = z.object({
  boardId: z.string().nonempty("ID do board é obrigatório"),
  title: z
    .string()
    .min(3, "Título muito curto")
    .nonempty("Título é obrigatório")
    .max(50, "Título muito longo"),
});

export type CreateListInput = z.infer<typeof createListSchema>;
