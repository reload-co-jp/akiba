// Rakuten widget relies on document.write, so isolate it in an iframe.
const widgetHtml = `<body style="margin:0"><script type="text/javascript">rakuten_design="slide";rakuten_affiliateId="0e4f63ed.d66ef999.0e4f63ee.87f3126b";rakuten_items="ctsmatch";rakuten_genreId="0";rakuten_size="468x160";rakuten_target="_blank";rakuten_theme="gray";rakuten_border="off";rakuten_auto_mode="on";rakuten_genre_title="off";rakuten_recommend="on";rakuten_ts="1791055530617";</script><script type="text/javascript" src="https://xml.affiliate.rakuten.co.jp/widget/js/rakuten_widget.js?20230106"></script></body>`

const RakutenWidget = () => (
  <iframe
    title="楽天市場"
    srcDoc={widgetHtml}
    width={468}
    height={160}
    loading="lazy"
    style={{ border: 0, maxWidth: "100%", display: "block", margin: "1.5rem auto" }}
  />
)

export default RakutenWidget
