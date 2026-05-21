import Link from "next/link"
import { EventsMap } from "components/events-map"
import { getArticleImage, getOngoingEvents, getTagById } from "lib/articles"

export const metadata = {
  title: "開催中のイベント",
  description: "秋葉原で現在開催中のイベント一覧",
  alternates: { canonical: "/events/" },
  openGraph: {
    title: "開催中のイベント | アキバLive",
    description: "秋葉原で現在開催中のイベント一覧",
    url: "/events/",
    type: "website",
  },
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)
  const events = getOngoingEvents(today)

  return (
    <section className="events-page">
      <div className="events-page__header">
        <p className="events-page__kicker">Ongoing events</p>
        <h1 className="events-page__title">
          開催中のイベント
        </h1>
      </div>

      {events.length === 0 ? (
        <p className="events-page__empty">現在開催中のイベントはありません。</p>
      ) : (
        <div className="events-page__grid">
          <EventsMap events={events} />
          <ul className="events-list">
            {events.map((article) => (
              <li key={article.id}>
                <Link href={`/articles/${article.slug}/`} className="events-card-link">
                  <article
                    className="events-card events-card--with-image"
                  >
                    <img
                      className="events-card__image"
                      src={getArticleImage(article).src}
                      alt={getArticleImage(article).alt}
                    />
                    <div>
                      <div className="events-card__tags">
                        {article.tagIds.map((tid) => {
                          const t = getTagById(tid)
                          return t ? <span key={tid} className="events-card__tag">{t.name}</span> : null
                        })}
                      </div>
                      <h2 className="events-card__title">{article.title}</h2>
                      {article.event && (
                        <dl className="events-card__meta">
                          <dt>会場</dt>
                          <dd>{article.event.venue}</dd>
                          <dt>期間</dt>
                          <dd>
                            {article.event.startDate} 〜 {article.event.endDate}
                          </dd>
                          <dt>料金</dt>
                          <dd>{article.event.price}</dd>
                        </dl>
                      )}
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default Page
