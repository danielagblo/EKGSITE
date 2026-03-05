import React, { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import IMAGES from '../data/images'
import Link from 'next/link'

export default function Products({ limit }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // If no admin models exist, inject a few fallback/placeholders to keep the layout pretty
          if (data.length === 0) {
            setItems([
              { id: 'lux', name: 'EKG Luxe', desc: 'Executive sedan', image: IMAGES.featured1, range: '420 km', price: '$200/day', specs: { seats: 5 } },
              { id: 'sport', name: 'EKG Sport', desc: 'Performance coupe', image: IMAGES.featured2, range: '370 km', price: '$260/day', specs: { seats: 4 } },
              { id: 'tour', name: 'EKG Tour', desc: 'Comfort MPV', image: IMAGES.featured3, range: '500 km', price: '$300/day', specs: { seats: 7 } }
            ])
          } else {
            setItems(data)
          }
        }
      })
      .catch(e => console.error('Failed to load fleet', e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section style={{ padding: '100px 20px', maxWidth: 1440, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading fleet...</p>
      </section>
    )
  }

  const displayedItems = limit ? items.slice(0, limit) : items

  return (
    <section style={{ padding: '80px 20px', maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontSize: 42, color: '#fff', marginBottom: 16 }}>The Fleet</h2>
        <p style={{ color: 'var(--muted)', fontSize: 18 }}>Explore our curated collection of executive vehicles</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
        {displayedItems.map(i => <ProductCard key={i.id} item={i} />)}
      </div>
      {limit && items.length > limit && (
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link
            href="/models"
            style={{
              display: 'inline-flex',
              padding: '16px 40px',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: 999,
              color: '#D4AF37',
              fontSize: 14,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.3s ease',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'; e.currentTarget.style.borderColor = '#D4AF37' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)' }}>
            
              View Full Fleet
            
          </Link>
        </div>
      )}
    </section>
  );
}
