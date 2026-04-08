import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import CldOptimizedImage from './CldOptimizedImage'
import ProductModal from './ProductModal'
import IMAGES from '../data/images'

export default function ProductCard({ item }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.article
        className="card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ translateY: -6 }}
        transition={{ type: 'spring', stiffness: 220 }}
        onClick={() => router.push(`/order/${item.id}`)}
        style={{ cursor: 'pointer' }}
      >
        <div className="thumb" style={{ position: 'relative' }}>
          <CldOptimizedImage
            width={600}
            height={400}
            src={item.image}
            alt={item.name}
            className="card-img"
          />

          {/* Badges Overlays */}
          <div style={{ position: 'absolute', inset: 0, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none' }}>
            {item.category && (
              <div style={{
                background: 'rgba(212, 175, 55, 0.9)',
                color: '#000',
                padding: '4px 12px',
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
              }}>
                {item.category}
              </div>
            )}
            {item.range && (
              <div style={{
                background: 'rgba(10,10,10,0.7)',
                backdropFilter: 'blur(8px)',
                color: '#D4AF37',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '4px 12px',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                {item.range}{item.rangeUnit && !String(item.range).includes(item.rangeUnit) ? ` ${item.rangeUnit}` : ''}
              </div>
            )}
          </div>
        </div>
        <div className="card-body">
          <h3 style={{ marginBottom: 12, color: 'var(--text)', fontSize: 24 }}>{item.name}</h3>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: 15, lineHeight: 1.5 }}>{item.desc}</p>
          <div className="card-footer">
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: '#D4AF37', fontSize: 20 }}>
                {item.price || item.rate} GHS
                <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.6, marginLeft: 4 }}>/day</span>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8, display: 'flex', flexWrap: 'wrap', columnGap: 16, rowGap: 6 }}>
                <span>{item.specs?.seats || '-'} Seats</span>
                <span>{item.specs?.transmission || 'Automatic'}</span>
                <span>{item.specs?.fuelType || 'Electric'}</span>
              </div>
            </div>
            <div style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #E30613, #ff4444)',
              color: '#fff',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: '0 8px 24px rgba(227, 6, 19, 0.4)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              flexShrink: 0,
              textAlign: 'center'
            }}>Book Now</div>
          </div>
        </div>
      </motion.article>
      {open && <ProductModal item={item} onClose={() => setOpen(false)} />}
    </>
  )
}
