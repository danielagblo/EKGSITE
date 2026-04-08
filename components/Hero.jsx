import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { getCldImageUrl } from './CldOptimizedImage'
import React from 'react'
import IMAGES from '../data/images'

const heading = { hidden: { x: -40, opacity: 0 }, show: { x: 0, opacity: 1 } }
const cta = { hidden: { scale: .96, opacity: 0 }, show: { scale: 1, opacity: 1 } }

export default function Hero() {
    const router = useRouter()
    const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' && window.innerWidth <= 768)

    // Generate Cloudinary URL for CSS background
    const heroBgUrl = IMAGES.hero.startsWith('http') || IMAGES.hero.startsWith('/')
        ? IMAGES.hero
        : getCldImageUrl({
            src: IMAGES.hero,
            width: 1920,
            height: 1080,
            crop: 'fill',
            gravity: 'center'
        });

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <section style={{
            position: 'relative',
            minHeight: isMobile ? '74vh' : '90vh',
            padding: isMobile ? '120px 0 96px' : '170px 0 150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Toyota Land Cruiser hero image */}
            <motion.div
                initial={{ scale: 1.02 }}
                animate={{ scale: 1.08 }}
                transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `url(${heroBgUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: isMobile ? '66% center' : 'center',
                    filter: 'brightness(0.98) contrast(1.08) saturate(1.08)',
                    zIndex: 0
                }}></motion.div>

            {/* Dark overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(110deg, rgba(10,10,10,0.42) 0%, rgba(10,10,10,0.6) 45%, rgba(10,10,10,0.76) 100%)',
                zIndex: 1
            }}></div>

            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 68% 22%, rgba(212, 175, 55, 0.1), transparent 40%), radial-gradient(circle at 50% 90%, rgba(227, 6, 19, 0.1), transparent 50%)',
                zIndex: 1
            }}></div>

            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(10,10,10,0.15) 0%, transparent 26%, rgba(10,10,10,0.82) 100%)',
                zIndex: 1
            }}></div>

            <div style={{
                maxWidth: 1400,
                width: '100%',
                padding: isMobile ? '0 20px' : '0 64px',
                textAlign: 'center',
                zIndex: 2
            }}>
                <motion.div
                    variants={heading}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.18, duration: 0.6 }}
                >
                    <div style={{
                        maxWidth: isMobile ? '100%' : 900,
                        margin: '0 auto',
                        padding: isMobile ? '16px 14px' : '28px 28px',
                        borderRadius: isMobile ? 14 : 24,
                        background: 'rgba(10,10,10,0.28)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.12)'
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            borderRadius: 999,
                            padding: isMobile ? '6px 12px' : '8px 16px',
                            marginBottom: isMobile ? 12 : 20,
                            background: 'rgba(212, 175, 55, 0.1)',
                            border: '1px solid rgba(212, 175, 55, 0.2)',
                            color: '#D4AF37',
                            fontSize: isMobile ? 11 : 13,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            fontWeight: 700
                        }}>
                            Private Mobility Collection
                        </div>
                        <motion.h1 style={{
                            fontSize: isMobile ? 34 : 74,
                            fontWeight: 900,
                            lineHeight: 1.1,
                            marginBottom: isMobile ? 14 : 18,
                            textShadow: '0 10px 30px rgba(0,0,0,0.8)',
                            letterSpacing: '-0.02em',
                            color: '#ffffff'
                        }}>
                            Luxury Mobility, <br /><span style={{
                                background: 'linear-gradient(135deg, #D4AF37, #FCEABB)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent',
                                textShadow: 'none'
                            }}>Curated for Leaders</span>
                        </motion.h1>
                    </div>
                </motion.div>

                <motion.p
                    variants={heading}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.32, duration: 0.6 }}
                    style={{
                        fontSize: isMobile ? 15 : 20,
                        color: 'rgba(255,255,255,0.95)',
                        marginBottom: isMobile ? 24 : 32,
                        maxWidth: isMobile ? 560 : 760,
                        margin: isMobile ? '12px auto 24px' : '16px auto 34px',
                        textShadow: '0 4px 18px rgba(0,0,0,0.9)',
                        fontWeight: 500,
                        lineHeight: isMobile ? 1.55 : 1.7
                    }}
                >
                    Featured Toyota Land Cruiser and premium fleet rental, logistics, travel and tour services across Ghana. Experience comfort and safety with comprehensively insured vehicles and professional defensive drivers.
                </motion.p>

                {/* Feature Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        display: 'flex',
                        gap: isMobile ? 12 : 24,
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginTop: isMobile ? 32 : 48
                    }}
                >
                    <div style={{
                        padding: isMobile ? '12px 16px' : '16px 24px',
                        background: 'rgba(10,10,10,0.6)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 16,
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: '#D4AF37', marginBottom: 4 }}>24/7</div>
                        <div style={{ fontSize: isMobile ? 10 : 11, color: '#8A8A8E', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Support Tracking</div>
                    </div>
                    <div style={{
                        padding: isMobile ? '12px 16px' : '16px 24px',
                        background: 'rgba(10,10,10,0.6)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 16,
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: '#D4AF37', marginBottom: 4 }}>Brand New</div>
                        <div style={{ fontSize: isMobile ? 10 : 11, color: '#8A8A8E', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Premium Fleet</div>
                    </div>
                    <div style={{
                        padding: isMobile ? '12px 16px' : '16px 24px',
                        background: 'rgba(212, 175, 55, 0.1)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 16,
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: '#D4AF37', marginBottom: 4 }}>Trained</div>
                        <div style={{ fontSize: isMobile ? 10 : 11, color: '#F5F5F7', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Chauffeurs</div>
                    </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 10 : 14,
                        justifyContent: 'center',
                        alignItems: isMobile ? 'stretch' : 'center',
                        marginTop: isMobile ? 24 : 36,
                        padding: isMobile ? '0 20px' : 0
                    }}
                >
                    <button
                        className="primary"
                        onClick={() => router.push('/models')}
                        style={{
                            padding: isMobile ? '14px 28px' : '16px 36px',
                            fontSize: isMobile ? 15 : 16,
                            fontWeight: 800,
                            borderRadius: 999,
                            background: 'linear-gradient(135deg, #E30613, #ff4444)',
                            border: 0,
                            cursor: 'pointer',
                            letterSpacing: '0.05em',
                            color: '#fff',
                            textTransform: 'uppercase'
                        }}
                    >
                        Explore Collection
                    </button>
                    <button
                        onClick={() => router.push('/contact')}
                        style={{
                            padding: isMobile ? '14px 28px' : '16px 36px',
                            fontSize: isMobile ? 15 : 16,
                            fontWeight: 800,
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}
                    >
                        Reserve a Consultation
                    </button>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            {!isMobile && (
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
            )}

            <svg className="hero-deco" width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                        <stop offset="0%" stopColor="#E30613" />
                        <stop offset="100%" stopColor="#ff4444" />
                    </linearGradient>
                </defs>
                <circle cx="110" cy="110" r="90" stroke="url(#g1)" strokeWidth="6" opacity="0.18" />
            </svg>
        </section>
    )
}