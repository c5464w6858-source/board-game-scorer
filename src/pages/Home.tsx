import { ErrorNote, Loading } from '../components/ui'
import { HomePhotoHeader } from './home/HomePhotoHeader'
import { useHomeData } from './home/useHomeData'

export function Home() {
  const d = useHomeData()
  if (d.loading) return <Loading />
  if (d.error) return <ErrorNote message={d.error} />
  return <HomePhotoHeader d={d} />
}
