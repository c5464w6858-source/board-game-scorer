import { useSearchParams } from 'react-router-dom'
import { ErrorNote, Loading } from '../components/ui'
import { HomeFullPhoto } from './home/HomeFullPhoto'
import { HomePhotoCard } from './home/HomePhotoCard'
import { HomePhotoHeader } from './home/HomePhotoHeader'
import { useHomeData } from './home/useHomeData'

// Three layouts to choose between, at /?home=1, /?home=2 and /?home=3.
// Once one is picked, the others and this switch go.
const layouts = { '1': HomePhotoHeader, '2': HomeFullPhoto, '3': HomePhotoCard } as const

export function Home() {
  const d = useHomeData()
  const [params] = useSearchParams()
  const Layout = layouts[(params.get('home') as keyof typeof layouts) ?? '1'] ?? HomePhotoHeader
  if (d.loading) return <Loading />
  if (d.error) return <ErrorNote message={d.error} />
  return <Layout d={d} />
}
