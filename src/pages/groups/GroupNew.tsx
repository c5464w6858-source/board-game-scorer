import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionBar, Choice, Field, field as pill } from '../../components/controls'
import { PhotoPage } from '../../components/PhotoPage'
import { Section } from '../../components/Section'
import { glassCard, goldButton, roundButton } from '../../components/surfaces'
import { ErrorNote, Icon } from '../../components/ui'
import { createGroup, groupKinds, type GroupKind } from '../../lib/groups'

const field = `${pill} w-full text-[16px]`

export function GroupNew() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [kind, setKind] = useState<GroupKind>('trip')
  const [location, setLocation] = useState('')
  const [startsOn, setStartsOn] = useState('')
  const [endsOn, setEndsOn] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ok = name.trim().length >= 2 && (!endsOn || !startsOn || endsOn >= startsOn)

  async function create() {
    setBusy(true)
    setError(null)
    try {
      const id = await createGroup({
        name: name.trim(),
        kind,
        location: location.trim() || null,
        starts_on: startsOn || null,
        ends_on: endsOn || startsOn || null,
        description: description.trim() || null,
      })
      navigate(`/groups/${id}`, { replace: true })
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <PhotoPage
      tone="navy"
      header={
        <div className="flex flex-col gap-5">
          <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
            <Icon name="back" size={20} />
          </button>
          <div>
            <span className="text-[12px] font-semibold tracking-[0.08em] text-gold uppercase">Start a group</span>
            <h1 className="m-0 font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">{name.trim() || 'Your society or trip'}</h1>
            <p className="mt-1 mb-0 text-sm text-white/80">You’ll get a code to invite everyone. Nothing is paid in the app.</p>
          </div>
        </div>
      }
    >
      <Section tone="navy" title="What is it?" icon="flag">
        <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-navy`}>
          {groupKinds.map((k) => (
            <Choice key={k.value} name="kind" label={k.label} hint={k.blurb} checked={kind === k.value} onSelect={() => setKind(k.value)} />
          ))}
        </div>
      </Section>

      <Section tone="navy" title="Details" icon="pencil">
        <div className={`${glassCard} divide-y divide-line-soft text-navy`}>
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="e.g. Algarve Lads 2027" className={field} />
          </Field>
          <Field label="Where (optional)">
            <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={80} placeholder="e.g. Vilamoura, Portugal" className={field} />
          </Field>
          <div className="grid grid-cols-2 gap-0 divide-x divide-line-soft">
            <Field label={kind === 'society' ? 'Season starts' : 'From'}>
              <input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} className={`${field} px-3 font-mono text-[15px]`} />
            </Field>
            <Field label={kind === 'society' ? 'Season ends' : 'To'}>
              <input type="date" value={endsOn} min={startsOn || undefined} onChange={(e) => setEndsOn(e.target.value)} className={`${field} px-3 font-mono text-[15px]`} />
            </Field>
          </div>
          <Field label="About it (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Flights, villa, kitty for drinks, dress code…"
              className={`${field.replace('rounded-full', 'rounded-[18px]')} block py-3`}
            />
          </Field>
        </div>
      </Section>

      {error && <div className="relative"><ErrorNote message={error} /></div>}

      <ActionBar tone="navy" title={name.trim() || 'Name your group'} note="You’ll be the organiser">
        <button type="button" disabled={!ok || busy} onClick={create} className={goldButton}>
          {busy ? 'Creating…' : 'Create'}
        </button>
      </ActionBar>
    </PhotoPage>
  )
}
