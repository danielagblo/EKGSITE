import React from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { saveOrder } from '../../lib/orders'
import { getModels } from '../../lib/modelsApi'

export default function OrderPage() {
  const router = useRouter()
  const { id } = router.query || {}
  const navigate = (to) => {
    if (typeof to === 'number') return router.back()
    return router.push(to)
  }
  const [models, setModels] = React.useState([])
  const [modelsLoading, setModelsLoading] = React.useState(true)
  const model = models.find(m => m.id === id)

  const [form, setForm] = React.useState({ name: '', email: '', phone: '', start: '', end: '', location: '', note: '' })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [orderSuccess, setOrderSuccess] = React.useState(null)
  const [selectedImage, setSelectedImage] = React.useState(0)
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
          setModelsLoading(false)
        }
      })()
    return () => { mounted = false }
  }, [])

  if (modelsLoading) {
    return (
      <section style={{ padding: 60 }}>
        <h2>Loading model...</h2>
      </section>
    )
  }

  if (!model) {
    return (
      <section style={{ padding: 60 }}>
        <h2>Model not found</h2>
        <button onClick={() => navigate('/models')}>Back to Models</button>
      </section>
    )
  }

  const allImages = [model.image, ...(model.gallery || [])]

  function update(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.start || !form.end) {
      setError('Please fill in your name, email, start date, and end date')
      return
    }
    setLoading(true)
    const order = saveOrder({
      productId: model.id,
      productName: model.name,
      price: model.price,
      rate: model.rate,
      ...form,
      createdAt: new Date().toISOString()
    })
    setLoading(false)
    setOrderSuccess(order)
  }

  if (orderSuccess) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40
        }}
      >
        <div style={{
          maxWidth: 600,
          textAlign: 'center',
          background: 'rgba(255,255,255,0.02)',
          padding: 60,
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{
            width: 80,
            height: 80,
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, var(--accent), #ff4444)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40
          }}>✓</div>
          <h2 style={{ marginBottom: 16 }}>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.6 }}>
            Your rental order <strong style={{ color: 'var(--accent-2)' }}>#{orderSuccess.id}</strong> for the <strong>{model.name}</strong> has been confirmed.
          </p>
          <p style={{ color: 'var(--muted)', marginTop: 12, fontSize: 15 }}>
            We will contact you at <strong style={{ color: '#fff' }}>{orderSuccess.email}</strong> within 24 hours to finalize the details.
          </p>
          <div style={{
            background: 'rgba(212, 178, 106, 0.1)',
            padding: 16,
            borderRadius: 12,
            marginTop: 24,
            fontSize: 14,
            color: 'var(--muted)'
          }}>
            <strong style={{ color: 'var(--accent-2)' }}>Payment Notice:</strong> Payment will be collected upon vehicle delivery — no online payment required.
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'center' }}>
            <button className="small" onClick={() => navigate('/orders')}>View All Orders</button>
            <button className="primary" onClick={() => navigate('/models')}>Browse More Models</button>
          </div>
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ minHeight: '100vh' }}
    >
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        height: isMobile ? '50vh' : '70vh',
        minHeight: isMobile ? 350 : 500,
        background: `linear-gradient(rgba(0,0,0,0.65), rgba(16,24,40,0.92)), url(${model.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Back Button - Floating */}
        <button
          className="small"
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: isMobile ? 20 : 40,
            left: isMobile ? 20 : 60,
            padding: isMobile ? '8px 16px' : '10px 20px',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            zIndex: 10,
            color: '#ffffff',
            fontWeight: 600,
            fontSize: isMobile ? 14 : 16
          }}
        >
          ← Back
        </button>

        {/* Hero Content */}
        <div style={{
          maxWidth: 1400,
          width: '100%',
          padding: isMobile ? '0 20px' : '0 60px',
          textAlign: 'center',
          zIndex: 2
        }}>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              background: 'rgba(212, 178, 106, 0.3)',
              border: '1px solid rgba(212, 178, 106, 0.6)',
              borderRadius: 999,
              marginBottom: 20,
              fontSize: 14,
              fontWeight: 700,
              color: '#f4e5c0',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              {model.category}
            </div>

            <h1 style={{
              fontSize: isMobile ? 36 : 72,
              fontWeight: 900,
              marginBottom: 16,
              textShadow: '0 4px 30px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.8)',
              letterSpacing: '-0.02em',
              color: '#ffffff'
            }}>
              {model.name}
            </h1>

            <p style={{
              fontSize: isMobile ? 16 : 20,
              color: '#ffffff',
              marginBottom: 32,
              maxWidth: 600,
              margin: '0 auto 32px',
              textShadow: '0 2px 15px rgba(0,0,0,0.9)',
              fontWeight: 500
            }}>
              {model.desc}
            </p>

            {/* Quick Stats */}
            <div style={{
              display: 'flex',
              gap: 40,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 40
            }}>
              <div style={{
                padding: '16px 28px',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#f4d56f', marginBottom: 4, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {model.range}
                </div>
                <div style={{ fontSize: 13, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  Range
                </div>
              </div>
              <div style={{
                padding: '16px 28px',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#f4d56f', marginBottom: 4, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {model.zeroToSixty}
                </div>
                <div style={{ fontSize: 13, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  0–60 mph
                </div>
              </div>
              <div style={{
                padding: '16px 28px',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#f4d56f', marginBottom: 4, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {model.topSpeed}
                </div>
                <div style={{ fontSize: 13, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  Top Speed
                </div>
              </div>
              <div style={{
                padding: '16px 28px',
                background: 'rgba(212, 178, 106, 0.4)',
                backdropFilter: 'blur(20px)',
                borderRadius: 16,
                border: '1px solid rgba(212, 178, 106, 0.6)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#f4d56f', marginBottom: 4, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {model.rate}
                </div>
                <div style={{ fontSize: 13, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                  Daily Rate
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 24,
            color: 'rgba(255,255,255,0.6)'
          }}
        >
          ↓
        </motion.div>
      </div>

      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: isMobile ? '40px 20px 60px' : '60px 60px 80px',
        background: 'var(--bg)'
      }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
          gap: isMobile ? 32 : 40
        }}>
          {/* Left Column - Vehicle Details */}
          <div>
            {/* Main Image */}
            <motion.div
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                marginBottom: 20,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img
                src={allImages[selectedImage]}
                alt={model.name}
                style={{
                  width: '100%',
                  height: isMobile ? 280 : 480,
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </motion.div>

            {/* Image Gallery */}
            {allImages.length > 1 && (
              <div style={{
                display: 'flex',
                gap: 12,
                overflowX: 'auto',
                paddingBottom: 8
              }}>
                {allImages.map((img, idx) => (
                  <motion.div
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: selectedImage === idx ? '3px solid var(--accent)' : '3px solid transparent',
                      transition: 'border 0.2s'
                    }}
                  >
                    <img
                      src={img}
                      alt={`${model.name} view ${idx + 1}`}
                      style={{
                        width: 120,
                        height: 80,
                        objectFit: 'cover',
                        display: 'block',
                        opacity: selectedImage === idx ? 1 : 0.6
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Vehicle Description */}
            <div style={{
              marginTop: 32,
              padding: 24,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <h3 style={{ marginBottom: 12 }}>About This Vehicle</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 15 }}>
                {model.desc}
              </p>
            </div>

            {/* Features & Specifications */}
            <div style={{
              marginTop: 24,
              padding: 24,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <h3 style={{ marginBottom: 16 }}>Features & Specifications</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(212, 178, 106, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18
                  }}>🔋</div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>Battery</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{model.specs.battery}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(212, 178, 106, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18
                  }}>⚙️</div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>Drive System</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{model.specs.drive}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(212, 178, 106, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18
                  }}>👥</div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>Seating</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{model.specs.seats} Seats</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(212, 178, 106, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18
                  }}>⚡</div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>Fast Charging</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{model.specs.charging}</div>
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ marginBottom: 12, fontSize: 15 }}>Included Features</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 10,
                  color: 'var(--muted)',
                  fontSize: 14
                }}>
                  {model.features && Array.isArray(model.features) && model.features.length > 0 ? (
                    model.features.map((feature, i) => (
                      <div key={i}>✓ {feature}</div>
                    ))
                  ) : (
                    <>
                      <div>✓ Autopilot</div>
                      <div>✓ Premium Audio</div>
                      <div>✓ Climate Control</div>
                      <div>✓ Navigation System</div>
                      <div>✓ Leather Interior</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div style={{ position: 'sticky', top: 40, height: 'fit-content' }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              padding: 32,
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                paddingBottom: 20,
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: 4 }}>Rental Details</h3>
                  <div style={{ color: 'var(--muted)', fontSize: 14 }}>Complete the form below</div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, var(--accent), #ff4444)',
                  padding: '10px 16px',
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: 18
                }}>
                  {model.rate}
                </div>
              </div>

              <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
                {/* Personal Information */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                    Full Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={update}
                    placeholder="John Doe"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.03)',
                      fontSize: 15
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                      Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={update}
                      placeholder="john@example.com"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        fontSize: 15
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                      Phone
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={update}
                      placeholder="+1 (555) 000-0000"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        fontSize: 15
                      }}
                    />
                  </div>
                </div>

                {/* Rental Period */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                      Start Date *
                    </label>
                    <input
                      name="start"
                      type="date"
                      value={form.start}
                      onChange={update}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        fontSize: 15
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                      End Date *
                    </label>
                    <input
                      name="end"
                      type="date"
                      value={form.end}
                      onChange={update}
                      required
                      min={form.start || new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)',
                        fontSize: 15
                      }}
                    />
                  </div>
                </div>

                {/* Pickup Location */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                    Pickup Location
                  </label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={update}
                    placeholder="e.g., Accra Airport, Downtown location"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.03)',
                      fontSize: 15
                    }}
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                    Additional Notes
                  </label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={update}
                    placeholder="Any special requests or requirements?"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.03)',
                      fontSize: 15,
                      resize: 'vertical'
                    }}
                  />
                </div>

                {error && (
                  <div style={{
                    padding: 12,
                    background: 'rgba(255, 80, 80, 0.1)',
                    border: '1px solid rgba(255, 80, 80, 0.3)',
                    borderRadius: 10,
                    color: '#ff8080',
                    fontSize: 14
                  }}>
                    {error}
                  </div>
                )}

                {/* Payment Notice */}
                <div style={{
                  padding: 14,
                  background: 'rgba(212, 178, 106, 0.1)',
                  borderRadius: 10,
                  fontSize: 13,
                  color: 'var(--muted)',
                  lineHeight: 1.6
                }}>
                  <strong style={{ color: 'var(--accent-2)' }}>💳 Payment:</strong> Payment will be collected upon vehicle delivery. No online payment required at this time.
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="primary"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: 16,
                    fontWeight: 700,
                    borderRadius: 12,
                    background: loading
                      ? 'rgba(100,100,100,0.3)'
                      : 'linear-gradient(90deg, var(--accent), #ff4444)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: 8
                  }}
                >
                  {loading ? 'Processing...' : 'Confirm Rental Order'}
                </button>
              </form>
            </div>

            {/* Rental Terms & Information */}
            <div style={{
              marginTop: 24,
              padding: 24,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <h4 style={{ fontSize: 16, marginBottom: 16, color: 'var(--accent-2)' }}>📋 Rental Terms & Information</h4>
              <div style={{ display: 'grid', gap: 12, fontSize: 14, color: 'var(--muted)' }}>
                <div style={{ padding: 12, background: 'rgba(212, 178, 106, 0.05)', borderRadius: 8 }}>
                  <strong style={{ color: 'var(--accent-2)', display: 'block', marginBottom: 6 }}>⏰ Service Hours</strong>
                  <div>Min: 6 hours | Max: 12 hours per day</div>
                  <div>Additional hours charged per vehicle type</div>
                </div>
                <div style={{ padding: 12, background: 'rgba(212, 178, 106, 0.05)', borderRadius: 8 }}>
                  <strong style={{ color: 'var(--accent-2)', display: 'block', marginBottom: 6 }}>💰 Chauffeur Allowances</strong>
                  <div>Outside Accra (day): $10 | Overnight: $20</div>
                  <div>Outside Ghana: $35 per night</div>
                </div>
                <div style={{ padding: 12, background: 'rgba(255, 80, 80, 0.08)', borderRadius: 8, border: '1px solid rgba(255, 80, 80, 0.15)' }}>
                  <strong style={{ color: '#ff8080', display: 'block', marginBottom: 6 }}>🚨 Emergency Breakdown</strong>
                  <div>Call: +233 (0)501 326 989</div>
                  <div style={{ fontSize: 12, marginTop: 4, color: 'rgba(255,255,255,0.5)' }}>No unauthorized repairs allowed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information Section - Full Width Below */}
        <div style={{ marginTop: 60 }}>
          <h3 style={{ fontSize: 28, marginBottom: 32, textAlign: 'center' }}>Important Rental Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {/* Chauffeur Service */}
            <div style={{ padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👨‍✈️</div>
              <h4 style={{ fontSize: 18, marginBottom: 16 }}>Chauffeur-Driven Service</h4>
              <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--muted)' }}>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Service Hours:</strong>
                  <div>• Minimum: 6 hours/day</div>
                  <div>• Maximum: 12 hours/day</div>
                  <div>• Break: 12 noon - 2 PM</div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong style={{ color: 'var(--text)' }}>Additional Hours:</strong>
                  <div>Charged per hour based on vehicle type</div>
                </div>
              </div>
            </div>

            {/* Allowances */}
            <div style={{ padding: 24, background: 'rgba(212, 178, 106, 0.08)', borderRadius: 16, border: '1px solid rgba(212, 178, 106, 0.2)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💵</div>
              <h4 style={{ fontSize: 18, marginBottom: 16 }}>Driver Allowances</h4>
              <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--muted)' }}>
                <div>
                  <strong style={{ color: 'var(--text)' }}>Outside Accra:</strong>
                  <div>• Day trip: $10.00</div>
                  <div>• Overnight: $20.00</div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong style={{ color: 'var(--text)' }}>Outside Ghana:</strong>
                  <div>$35.00 per night (accommodation)</div>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, fontStyle: 'italic' }}>
                  Paid in addition to vehicle rental fees
                </div>
              </div>
            </div>

            {/* Emergency Protocol */}
            <div style={{ padding: 24, background: 'rgba(255, 80, 80, 0.08)', borderRadius: 16, border: '1px solid rgba(255, 80, 80, 0.2)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🚨</div>
              <h4 style={{ fontSize: 18, marginBottom: 16 }}>Emergency Breakdown</h4>
              <div style={{ display: 'grid', gap: 10, fontSize: 14, color: 'var(--muted)' }}>
                <div>
                  <strong style={{ color: '#ff8080' }}>Call Immediately:</strong>
                  <div style={{ marginTop: 4 }}>
                    <a href="tel:+233501326989" style={{ color: 'var(--accent-2)', textDecoration: 'none' }}>+233 (0)501 326 989</a>
                  </div>
                  <div>
                    <a href="tel:+233204001146" style={{ color: 'var(--accent-2)', textDecoration: 'none' }}>+233 (0)204 001 146</a>
                  </div>
                </div>
                <div style={{ marginTop: 8, padding: 10, background: 'rgba(255, 80, 80, 0.1)', borderRadius: 6 }}>
                  <strong style={{ color: '#ff8080', fontSize: 13 }}>⚠️ Important:</strong>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Do NOT allow unauthorized repairs. Only EKG-approved workshops.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Terms */}
          <div style={{
            marginTop: 32,
            padding: 32,
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h4 style={{ fontSize: 20, marginBottom: 20, textAlign: 'center' }}>Rental Conditions</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, fontSize: 14, color: 'var(--muted)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                <div>All vehicles comprehensively insured with valid licenses</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                <div>24-hour monitored tracking device in all vehicles</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                <div>Clients must sign log sheets and verify fuel levels daily</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                <div>Quick vehicle replacement during maintenance or breakdowns</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                <div>Unlimited mileage per day with log sheet documentation</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                <div>Flexible payment options: daily, monthly, or quarterly</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
