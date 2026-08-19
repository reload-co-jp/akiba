import authorsData from "../data/authors.json"

export type Author = {
  id: number
  name: string
  description?: string
  schemaType?: "Person" | "Organization"
}

export const getAllAuthors = (): Author[] => authorsData as Author[]

export const getAuthorById = (id: number): Author | undefined =>
  (authorsData as Author[]).find((a) => a.id === id)
