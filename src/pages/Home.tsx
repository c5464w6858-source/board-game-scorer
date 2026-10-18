import { useSearchParams } from 'react-router-dom'
import { ErrorNote, Loading } from '../components/ui'
import { HomeCourse } from './home/HomeCourse'
import { HomeFresh } from './home/HomeFresh'
import { HomeLime } from './home/HomeLime'
import { useHomeData } from './home/useHomeData'

// Three layouts to choose between, at /?home=1, /?home=2 and /?home=3.
// Once one is picked, the others and this switch go.
const layouts = { '1': HomeFresh, '2': HomeCourse, '3': HomeLime } as const

export function Home() {
  const d = useHomeData()
  const [params] = useSearchParams()
  const Layout = layouts[(params.get('home') as keyof typeof layouts) ?? '1'] ?? HomeFresh
  if (d.loading) return <Loading />
  if (d.error) return <ErrorNote message={d.error} />
  return <Layout d={d} />
}
