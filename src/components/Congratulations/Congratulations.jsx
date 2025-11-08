import './Congratulations.css'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function Congratulations({ wordCount, onClose }) {
  const canvasRef = useRef(null)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true 
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    // Firework system
    const fireworks = []
    
    const colors = [
      [0xff0844, 0xffb199], // Red to pink
      [0x00d9ff, 0x0099ff], // Cyan to blue
      [0xffd700, 0xffa500], // Gold to orange
      [0x00ff88, 0x00cc66], // Green
      [0xff00ff, 0xff66ff], // Magenta
      [0xffffff, 0x99ccff], // White to light blue
    ]

    class Firework {
      constructor() {
        const colorPair = colors[Math.floor(Math.random() * colors.length)]
        this.color1 = new THREE.Color(colorPair[0])
        this.color2 = new THREE.Color(colorPair[1])
        
        // Starting position (bottom)
        this.startX = (Math.random() - 0.5) * 6
        this.targetY = 1 + Math.random() * 2
        
        // Rocket phase
        this.rocket = this.createRocket()
        this.rocketVelocity = 0.08
        this.exploded = false
        
        // Explosion particles
        this.particles = []
        this.particleCount = 80 + Math.floor(Math.random() * 40)
        
        scene.add(this.rocket)
      }

      createRocket() {
        const geometry = new THREE.SphereGeometry(0.05, 8, 8)
        const material = new THREE.MeshBasicMaterial({ 
          color: this.color1,
          transparent: true 
        })
        const rocket = new THREE.Mesh(geometry, material)
        rocket.position.set(this.startX, -3, 0)
        return rocket
      }

      createExplosion() {
        const explosionPos = this.rocket.position.clone()
        
        for (let i = 0; i < this.particleCount; i++) {
          const geometry = new THREE.SphereGeometry(0.03, 6, 6)
          
          // Gradient color
          const t = i / this.particleCount
          const color = new THREE.Color().lerpColors(this.color1, this.color2, t)
          
          const material = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 1
          })
          
          const particle = new THREE.Mesh(geometry, material)
          particle.position.copy(explosionPos)
          
          // Random direction in sphere
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          const speed = 0.05 + Math.random() * 0.05
          
          particle.userData = {
            velocityX: speed * Math.sin(phi) * Math.cos(theta),
            velocityY: speed * Math.sin(phi) * Math.sin(theta),
            velocityZ: speed * Math.cos(phi),
            life: 1.0,
            decay: 0.008 + Math.random() * 0.008
          }
          
          this.particles.push(particle)
          scene.add(particle)
        }
        
        scene.remove(this.rocket)
      }

      update() {
        if (!this.exploded) {
          // Rocket rising
          this.rocket.position.y += this.rocketVelocity
          
          // Add trail effect
          this.rocket.material.opacity = 0.8 + Math.random() * 0.2
          
          if (this.rocket.position.y >= this.targetY) {
            this.exploded = true
            this.createExplosion()
          }
          return true
        } else {
          // Update explosion particles
          let aliveCount = 0
          
          this.particles.forEach(particle => {
            if (particle.userData.life > 0) {
              // Apply gravity
              particle.userData.velocityY -= 0.001
              
              // Update position
              particle.position.x += particle.userData.velocityX
              particle.position.y += particle.userData.velocityY
              particle.position.z += particle.userData.velocityZ
              
              // Fade out
              particle.userData.life -= particle.userData.decay
              particle.material.opacity = particle.userData.life
              
              aliveCount++
            }
          })
          
          return aliveCount > 0
        }
      }

      dispose() {
        if (this.rocket.parent) {
          scene.remove(this.rocket)
          this.rocket.geometry.dispose()
          this.rocket.material.dispose()
        }
        
        this.particles.forEach(particle => {
          if (particle.parent) {
            scene.remove(particle)
            particle.geometry.dispose()
            particle.material.dispose()
          }
        })
      }
    }

    // Launch fireworks periodically
    let lastLaunch = 0
    const launchInterval = 800 // ms

    const animate = () => {
      requestAnimationFrame(animate)
      
      const now = Date.now()
      
      // Launch new firework
      if (now - lastLaunch > launchInterval && fireworks.length < 5) {
        fireworks.push(new Firework())
        lastLaunch = now
      }
      
      // Update existing fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const alive = fireworks[i].update()
        if (!alive) {
          fireworks[i].dispose()
          fireworks.splice(i, 1)
        }
      }
      
      renderer.render(scene, camera)
    }

    animate()

    // Show content with delay
    setTimeout(() => setShowContent(true), 300)

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      fireworks.forEach(fw => fw.dispose())
      renderer.dispose()
    }
  }, [])

  return (
    <div className="congratulations-container">
      <canvas ref={canvasRef} className="fireworks-canvas" />

      <div className={`congratulations-content ${showContent ? 'show' : ''}`}>
        <h1 className="congratulations-title">
          <span className="gradient-text">Congratulations!</span>
        </h1>
        
        <div className="achievement-badge">
          <div className="badge-circle">
            <span className="badge-number">{wordCount}</span>
          </div>
          <p className="badge-label">Words Reviewed</p>
        </div>

        <p className="congratulations-message">
          You've successfully completed learning session!
        </p>

        <button className="congratulations-button" onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back to Selection</span>
        </button>
      </div>
    </div>
  )
}



