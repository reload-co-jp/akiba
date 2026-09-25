import JaLayout from "./(ja)/layout"
import JaNotFound from "./(ja)/not-found"

export const metadata = {
  title: "ページが見つかりません | アキバLive",
  robots: { index: false },
}

const NotFound = () => (
  <JaLayout>
    <JaNotFound />
  </JaLayout>
)

export default NotFound
