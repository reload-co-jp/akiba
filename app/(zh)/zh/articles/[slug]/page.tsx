import { createTranslatedArticlePage } from "components/translated-article-page"

const { generateStaticParams, generateMetadata, Page } =
  createTranslatedArticlePage("zh")

export { generateStaticParams, generateMetadata }
export default Page
