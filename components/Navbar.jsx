import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Navbar(){
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <motion.header className="nav" initial={{ y: -40, opacity: 0 }} animate={{ y:0, opacity:1 }} transition={{ duration: .45 }}>
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <img
            src="/logo-transparent.png"
            alt="EKG Logistics and transport"
            style={{
              width:64,
              height:64,
              objectFit:'contain',
              background:'transparent',
              display:'block',
              transform:'scale(1.6)',
              transformOrigin:'center center'
            }}
          />
          <div>
            <div className="brand">EKG<span>Logistics and transport</span></div>
            <div style={{color:'var(--muted)',fontSize:12,lineHeight:1}}>Luxury Electric Vehicles</div>
          </div>
        </div>
      </Link>
      <nav style={{display:'flex',alignItems:'center'}}>
        <div className="links" aria-hidden={open}>
          <Link href="/" className={router.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link href="/about" className={router.pathname === '/about' ? 'active' : ''}>About</Link>
          <Link href="/models" className={router.pathname === '/models' ? 'active' : ''}>Fleet</Link>
          <Link href="/mission" className={router.pathname === '/mission' ? 'active' : ''}>Mission</Link>
          
          <Link href="/contact" className="cta">Contact</Link>
        </div>

        <button className="nav-toggle" aria-expanded={open} onClick={()=>setOpen(v=>!v)} aria-label="Toggle menu">☰</button>
        {open && (
          <motion.div className="mobile-menu" initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <Link href="/" onClick={()=>setOpen(false)}>Home</Link>
            <Link href="/models" onClick={()=>setOpen(false)}>Models</Link>
            <Link href="/about" onClick={()=>setOpen(false)}>About</Link>
            
            <Link href="/contact" onClick={()=>setOpen(false)} className="cta">Contact</Link>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}
