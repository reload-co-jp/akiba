import { getAuthorById } from "./authors"

/** 記事・スポット詳細ページに表示する編集部コメント。authorId で authors.json の担当者と紐付く。 */
export type EditorComment = {
  text: string
  authorId?: number
}

export const getEditorCommentAuthor = (comment: EditorComment) =>
  comment.authorId != null ? getAuthorById(comment.authorId) : undefined
