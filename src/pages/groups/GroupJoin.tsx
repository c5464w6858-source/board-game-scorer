import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorNote, Loading } from '../../components/ui'
import { joinGroup } from '../../lib/groups'

// Opened from an invite link: join the group, then go to it.
export function GroupJoin() {
  const { code = '' } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    joinGroup(code).then(
      (id) => navigate(`/groups/${id}`, { replace: true }),
      (e: Error) => setError(e.message),
    )
  }, [code, navigate])

  if (!error) return <Loading />
  return (
    <div className="flex flex-col gap-3 pt-10">
      <ErrorNote message={error} />
      <Link to="/groups" className="font-semibold text-green">Go to your groups</Link>
    </div>
  )
}
