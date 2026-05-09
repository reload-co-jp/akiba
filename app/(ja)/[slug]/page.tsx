import { redirect } from "next/navigation"
import { getAllSlugs } from "lib/articles"

type Props = {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () => {
  return getAllSlugs().map((slug) => ({ slug }))
}

const Page = async ({ params }: Props) => {
  const { slug } = await params
  redirect(`/articles/${slug}/`)
}

export default Page
