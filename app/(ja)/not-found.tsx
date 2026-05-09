import Link from "next/link"

export const metadata = {
  title: "ページが見つかりません",
}

const NotFound = () => {
  return (
    <div className="not-found-page">
      <p className="not-found-page__code">404</p>
      <h1 className="not-found-page__title">ページが見つかりません</h1>
      <p className="not-found-page__message">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link href="/" className="not-found-page__link">
        トップページへ戻る
      </Link>
    </div>
  )
}

export default NotFound
