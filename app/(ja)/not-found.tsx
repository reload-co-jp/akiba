import Link from "next/link"

export const metadata = {
  title: "ページが見つかりません",
}

const NotFound = () => {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "60dvh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          color: "#b94a3a",
          fontSize: "6rem",
          fontWeight: "800",
          lineHeight: "1",
          margin: "0 0 1rem",
        }}
      >
        404
      </p>
      <h1
        style={{
          color: "#24312f",
          fontSize: "1.5rem",
          fontWeight: "700",
          margin: "0 0 0.75rem",
        }}
      >
        ページが見つかりません
      </h1>
      <p
        style={{
          color: "#5f6f69",
          fontSize: "0.9375rem",
          lineHeight: "1.7",
          margin: "0 0 2rem",
          maxWidth: "24rem",
        }}
      >
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/"
        style={{
          background: "#b94a3a",
          borderRadius: "999px",
          color: "#fff",
          fontSize: "0.875rem",
          fontWeight: "700",
          padding: "0.75rem 1.5rem",
          textDecoration: "none",
        }}
      >
        トップページへ戻る
      </Link>
    </div>
  )
}

export default NotFound
