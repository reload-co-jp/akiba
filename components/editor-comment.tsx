import { getEditorCommentAuthor, type EditorComment } from "lib/editor-comment"

type Props = {
  comment: EditorComment
}

/** 記事・スポット詳細ページ共通の「編集部コメント」表示ブロック。 */
export const EditorCommentBlock = ({ comment }: Props) => {
  const author = getEditorCommentAuthor(comment)

  return (
    <div
      style={{
        margin: "1.5rem 0",
        padding: "1rem 1.25rem",
        background: "#fff7ec",
        border: "1px solid #eadfce",
        borderRadius: "8px",
      }}
    >
      <p
        style={{
          margin: "0 0 .5rem",
          fontSize: ".8125rem",
          fontWeight: "bold",
          color: "#b94a3a",
        }}
      >
        編集部コメント{author && `（${author.name}）`}
      </p>
      <p style={{ margin: 0, color: "#24312f", whiteSpace: "pre-wrap" }}>{comment.text}</p>
    </div>
  )
}
