type Props = {
  venue: string
  lat: number
  lng: number
  query?: string
  mapLabel?: string
}

const LAT_SPAN = 0.0025
const LNG_SPAN = 0.0035

export const ArticleVenueMap = ({ venue, lat, lng, query, mapLabel }: Props) => {
  const bbox = [lng - LNG_SPAN, lat - LAT_SPAN, lng + LNG_SPAN, lat + LAT_SPAN].join("%2C")
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query ?? venue)}`

  return (
    <div className="article-venue-map">
      <iframe
        title={`${venue}の地図`}
        src={mapUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a href={externalMapUrl} target="_blank" rel="noopener noreferrer">
        {mapLabel ?? "Google Mapsで開く"}
      </a>
    </div>
  )
}
