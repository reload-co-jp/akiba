import { createTranslatedArticlePage } from "components/translated-article-page"

const { generateStaticParams, generateMetadata, Page } =
  createTranslatedArticlePage("en")

export { generateStaticParams, generateMetadata }
export default Page
