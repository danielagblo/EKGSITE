import React from 'react'
import { useRouter } from 'next/router'
import { getModels } from '../../lib/modelsApi'

export default function ModelDetail() {
  const router = useRouter()
  const { id } = router.query || {}
  const navigate = (to) => router.push(to)
  const [models, setModels] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' && window.innerWidth <= 768)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  React.useEffect(() => {
    let mounted = true
      ; (async () => {
        const data = await getModels()
        if (mounted) {
          setModels(data)
          setLoading(false)
        }
      })()
    return () => { mounted = false }
  }, [])

  const model = models.find(m => String(m.id) === String(id))

  if (loading) return <section style={{ padding: 60 }}>Loading model...</section>

  if (!model) return <section style={{ padding: 60 }}>Model not found</section>

  return (
    <section style={{ padding: isMobile ? 20 : 60, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 420px', gap: isMobile ? 20 : 28 }}>
      <div>
        <h2>{model.name}</h2>
        <p style={{ color: 'var(--muted)' }}>{model.desc}</p>

        <div style={{ display: 'flex', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
          <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{model.range}{model.rangeUnit && !String(model.range).includes(model.rangeUnit) ? ` ${model.rangeUnit}` : ''}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Range</div>
          </div>
          <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{model.topSpeed}{model.topSpeedUnit && !String(model.topSpeed).includes(model.topSpeedUnit) ? ` ${model.topSpeedUnit}` : ''}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Top speed</div>
          </div>
          <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{model.zeroToSixty}{model.zeroToSixtyUnit && !String(model.zeroToSixty).includes(model.zeroToSixtyUnit) ? `${model.zeroToSixtyUnit}` : ''}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>0–60</div>
          </div>
        </div>

        <h3 style={{ marginTop: 22 }}>Specifications</h3>
        <ul style={{ color: 'var(--muted)' }}>
          <li>Battery: {model.specs.battery}</li>
          <li>Drive: {model.specs.drive}</li>
          <li>Seats: {model.specs.seats}</li>
          <li>Charging: {model.specs.charging}</li>
        </ul>

        <h3 style={{ marginTop: 18 }}>Gallery</h3>
        <div style={{ display: 'flex', gap: 10, marginTop: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {model.gallery.map((g, i) => (
            <img key={i} src={g} style={{ width: isMobile ? 120 : 160, height: isMobile ? 80 : 100, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} alt={`${model.name} ${i}`} />
          ))}
        </div>
      </div>

      <aside>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 18, borderRadius: 12 }}>
          <img src={model.image} alt={model.name} style={{ width: '100%', borderRadius: 10, objectFit: 'cover' }} />
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{model.name}</div>
              <div style={{ color: 'var(--muted)' }}>{model.price}</div>
            </div>
            <div>
              <button className="primary" onClick={() => navigate(`/order/${model.id}`)} style={{
                padding: '12px 24px',
                fontSize: 15,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(184, 144, 51, 0.3)'
              }}>
                Book Now →
              </button>
            </div>
          </div>
        </div>
      </aside>
    </section>
  )
}
