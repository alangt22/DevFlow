import { z } from "zod"

export const createBoardSchema = z.object({
  title: z
    .string()
    .min(3, "Título muito curto")
    .nonempty("Título é obrigatório")
    .max(50, "Título muito longo")
})

export type CreateBoardInput = z.infer<typeof createBoardSchema>