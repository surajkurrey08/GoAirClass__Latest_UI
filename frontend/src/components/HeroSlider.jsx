// src/components/HeroSlider.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { getHeroImages } from '../services/heroImageService'
import './HeroSlider.css'

const INTERVAL = 4000

export default function HeroSlider({ children }) {
  const [images, setImages]               = useState([])
  const [current, setCurrent]             = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const timerRef                          = useRef(null)

  useEffect(() => {
    getHeroImages().then(imgs => setImages(imgs))
  }, [])

  useEffect(() => {
    if (images.length <= 1) return
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [images.length])

  const handleDotClick = (i) => {
    clearInterval(timerRef.current)
    setCurrent(i)
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, INTERVAL)
  }

  if (images.length === 0) {
    return (
      <div className="hs-skeleton">
        <div className="hs-skeleton__shimmer" />
        <div className="hs-content">{children}</div>
      </div>
    )
  }

  return (
    <div className="hs-root">

      {/* ── Slides ── */}
      <div className="hs-track">
        {images.map((img, i) => (
          <div
            key={img._id ?? img.id ?? i}
            className={`hs-slide ${i === current ? 'hs-slide--active' : ''}`}
          >
            <img
              src={img.url}
              alt={img.title || `Hero ${i + 1}`}
              className="hs-slide__img"
            />
            <div className="hs-slide__overlay" />
          </div>
        ))}

        


      </div>

      {/* ── Content + Dots ── */}
      <div className="hs-content">

        {/* Dots — search bar se bilkul upar */}
        {images.length > 1 && (
          <div className="hs-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`hs-dot ${i === current ? 'hs-dot--active' : ''}`}
                onClick={() => handleDotClick(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Search bar + Tagline */}
        {children}

      </div>

    </div>
  )
}