import { z } from 'zod'

export const postSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  image_url: z.string().url('Enter valid image URL'),
  body: z.string().min(20, 'Post content too short'),
})

export type PostInput = z.infer<typeof postSchema>
