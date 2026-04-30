'use client'
import { useEffect, useRef } from 'react'

const COASTLINES: [number, number][][] = [
  // North America
  [[71,-156],[70,-141],[69,-129],[60,-141],[55,-131],[49,-125],[40,-124],[32,-117],[28,-114],[23,-110],[20,-105],[18,-95],[18,-87],[21,-86],[26,-97],[29,-94],[30,-89],[30,-81],[25,-80],[28,-82],[30,-84],[35,-76],[40,-74],[44,-67],[45,-60],[51,-56],[55,-60],[60,-64],[63,-78],[58,-94],[68,-85],[73,-95],[71,-115],[71,-156]],
  // Greenland
  [[83,-30],[78,-18],[68,-22],[60,-44],[68,-52],[76,-65],[81,-50],[83,-30]],
  // South America
  [[12,-72],[10,-65],[5,-52],[-2,-44],[-8,-35],[-15,-39],[-23,-41],[-30,-50],[-38,-58],[-50,-69],[-55,-67],[-50,-74],[-40,-73],[-30,-71],[-18,-71],[-10,-78],[-2,-80],[5,-77],[12,-72]],
  // Europe + W. Russia
  [[71,28],[70,20],[68,15],[63,5],[58,8],[55,13],[54,9],[50,4],[50,-5],[43,-9],[37,-9],[36,-6],[37,-2],[39,3],[42,3],[44,9],[40,18],[37,15],[40,17],[42,12],[44,16],[45,13],[45,29],[42,28],[37,27],[36,30],[40,40],[43,46],[48,40],[55,38],[60,30],[65,26],[68,22],[71,28]],
  // Africa
  [[37,-6],[35,-1],[33,11],[31,32],[27,34],[15,40],[12,43],[3,42],[-5,40],[-15,40],[-25,33],[-32,28],[-34,20],[-30,17],[-22,14],[-10,13],[-3,9],[5,3],[6,-7],[10,-15],[15,-17],[20,-17],[28,-12],[33,-7],[37,-6]],
  // Madagascar
  [[-12,49],[-15,50],[-22,47],[-25,45],[-22,44],[-17,44],[-12,49]],
  // Asia / Russia / China / India
  [[71,28],[75,55],[77,100],[73,128],[70,145],[64,178],[60,170],[55,160],[50,156],[43,140],[35,140],[34,127],[37,124],[40,121],[35,119],[32,121],[28,121],[22,114],[20,108],[10,107],[12,104],[8,100],[5,98],[2,103],[6,116],[1,110],[-5,114],[-8,118],[-9,124],[-10,140],[3,131],[5,124],[10,125],[12,122],[18,121],[22,114],[10,98],[16,98],[22,90],[20,88],[12,80],[8,78],[12,75],[20,72],[25,68],[27,62],[30,60],[35,52],[40,50],[42,48],[44,40],[40,40],[42,46],[55,46],[65,32],[71,28]],
  // Australia
  [[-10,142],[-12,131],[-14,127],[-22,114],[-32,115],[-35,118],[-38,140],[-37,150],[-32,153],[-23,150],[-16,146],[-10,142]],
  // UK
  [[58,-5],[55,-2],[52,2],[51,1],[50,-1],[51,-5],[55,-7],[58,-7],[58,-5]],
  // Iceland
  [[66,-23],[64,-22],[63,-19],[64,-14],[66,-15],[66,-23]],
  // Japan
  [[45,142],[42,141],[38,141],[35,140],[34,135],[31,131],[34,132],[37,138],[40,140],[45,142]],
]

const CITIES = [
  { name: 'VIENNA',    lat: 48.2,   lon: 16.4,   important: true },
  { name: 'LANGLEY',   lat: 38.95,  lon: -77.15, important: true },
  { name: 'MOSCOW',    lat: 55.75,  lon: 37.6,   important: true },
  { name: 'TEL AVIV',  lat: 32.08,  lon: 34.78,  important: true },
  { name: 'BERLIN',    lat: 52.52,  lon: 13.4,   important: true },
  { name: 'LONDON',    lat: 51.5,   lon: -0.12,  important: true },
  { name: 'BEIJING',   lat: 39.9,   lon: 116.4,  important: true },
  { name: 'TOKYO',     lat: 35.68,  lon: 139.7,  important: false },
  { name: 'ISTANBUL',  lat: 41.0,   lon: 28.97,  important: false },
  { name: 'CAIRO',     lat: 30.04,  lon: 31.24,  important: false },
  { name: 'PRAGUE',    lat: 50.08,  lon: 14.43,  important: false },
  { name: 'HAVANA',    lat: 23.13,  lon: -82.38, important: false },
  { name: 'BUENOS A.', lat: -34.6,  lon: -58.4,  important: false },
  { name: 'SYDNEY',    lat: -33.87, lon: 151.2,  important: false },
  { name: 'DELHI',     lat: 28.6,   lon: 77.2,   important: false },
]

const ROUTES = [
  [0,1],[0,2],[0,4],[0,10],[1,5],[1,11],
  [2,6],[3,9],[4,5],[5,8],[6,7],[3,0],
  [1,13],[10,8],[9,14],[11,12],[7,13],[2,8],
]

interface SpyGlobeProps {
  width?: number
  height?: number
}

export default function SpyGlobe({ width = 720, height = 720 }: SpyGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const cx = width / 2
    const cy = height / 2
    const R = Math.min(width, height) * 0.36

    const sats = Array.from({ length: 6 }, (_, i) => ({
      radius: R * (1.18 + i * 0.07),
      speed:  0.004 + i * 0.0015,
      phase:  Math.random() * Math.PI * 2,
      roll:   Math.random() * Math.PI,
    }))

    const project = (lat: number, lon: number, rot: number) => {
      const la = lat * Math.PI / 180
      const lo = (lon + rot) * Math.PI / 180
      const x = Math.cos(la) * Math.sin(lo)
      const y = Math.sin(la)
      const z = Math.cos(la) * Math.cos(lo)
      return { x: cx + x * R, y: cy - y * R, z, visible: z > -0.05 }
    }

    let rotation = 0
    const pulses: { route: number; t: number }[] = []
    let pulseTimer = 0
    let raf: number

    const tick = () => {
      rotation += 0.12
      ctx.clearRect(0, 0, width, height)

      // Outer rings
      ctx.strokeStyle = 'rgba(232,230,225,0.06)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(cx, cy, R + 60, 0, Math.PI * 2); ctx.stroke()
      ctx.strokeStyle = 'rgba(204,26,46,0.1)'
      ctx.beginPath(); ctx.arc(cx, cy, R + 30, 0, Math.PI * 2); ctx.stroke()

      // Sphere body
      const grd = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.2, cx, cy, R)
      grd.addColorStop(0, 'rgba(20,32,48,0.92)')
      grd.addColorStop(0.6, 'rgba(10,16,28,0.88)')
      grd.addColorStop(1, 'rgba(5,8,12,1)')
      ctx.fillStyle = grd
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()

      // Clip to sphere
      ctx.save()
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip()

      // Graticule
      ctx.strokeStyle = 'rgba(232,230,225,0.07)'
      ctx.lineWidth = 0.6
      for (let lat = -60; lat <= 60; lat += 20) {
        ctx.beginPath()
        let started = false
        for (let lon = -180; lon <= 180; lon += 5) {
          const p = project(lat, lon, rotation)
          if (p.visible) { if (!started) { ctx.moveTo(p.x, p.y); started = true } else ctx.lineTo(p.x, p.y) }
          else { started = false }
        }
        ctx.stroke()
      }
      for (let lon = -180; lon < 180; lon += 15) {
        ctx.beginPath()
        let started = false
        for (let lat = -88; lat <= 88; lat += 4) {
          const p = project(lat, lon, rotation)
          if (p.visible) { if (!started) { ctx.moveTo(p.x, p.y); started = true } else ctx.lineTo(p.x, p.y) }
          else { started = false }
        }
        ctx.stroke()
      }
      // Equator
      ctx.strokeStyle = 'rgba(204,26,46,0.32)'
      ctx.lineWidth = 0.9
      ctx.beginPath()
      let eqStarted = false
      for (let lon = -180; lon <= 180; lon += 4) {
        const p = project(0, lon, rotation)
        if (p.visible) { if (!eqStarted) { ctx.moveTo(p.x, p.y); eqStarted = true } else ctx.lineTo(p.x, p.y) }
        else { eqStarted = false }
      }
      ctx.stroke()

      // Coastlines
      ctx.strokeStyle = 'rgba(232,230,225,0.42)'
      ctx.lineWidth = 1
      COASTLINES.forEach(line => {
        ctx.beginPath()
        let started = false
        for (const [la, lo] of line) {
          const p = project(la, lo, rotation)
          if (p.visible) { if (!started) { ctx.moveTo(p.x, p.y); started = true } else ctx.lineTo(p.x, p.y) }
          else { started = false }
        }
        ctx.stroke()
      })
      ctx.fillStyle = 'rgba(40,55,75,0.18)'
      COASTLINES.forEach(line => {
        ctx.beginPath()
        let started = false; let any = false
        for (const [la, lo] of line) {
          const p = project(la, lo, rotation)
          if (p.visible) { if (!started) { ctx.moveTo(p.x, p.y); started = true; any = true } else ctx.lineTo(p.x, p.y) }
          else { started = false }
        }
        if (any) { ctx.closePath(); ctx.fill() }
      })

      ctx.restore()

      // Sphere edge
      ctx.strokeStyle = 'rgba(204,26,46,0.4)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke()

      // City projections
      const pts = CITIES.map(c => ({ ...c, ...project(c.lat, c.lon, rotation) }))

      // Routes
      ROUTES.forEach((r, idx) => {
        const a = pts[r[0]], b = pts[r[1]]
        if (!a.visible || !b.visible) return
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
        const dx = mx - cx, dy = my - cy
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const lift = 20 + (idx % 4) * 18
        const ctrlX = mx + (dx / len) * lift
        const ctrlY = my + (dy / len) * lift - 12
        ctx.strokeStyle = 'rgba(204,26,46,0.36)'
        ctx.lineWidth = 0.8
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(ctrlX, ctrlY, b.x, b.y); ctx.stroke()
      })

      // Pulses
      pulseTimer++
      if (pulseTimer > 24) { pulseTimer = 0; pulses.push({ route: Math.floor(Math.random() * ROUTES.length), t: 0 }) }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        if (p.t >= 1) { pulses.splice(i, 1); continue }
        const r = ROUTES[p.route]
        const a = pts[r[0]], b = pts[r[1]]
        if (!a.visible || !b.visible) { p.t += 0.012; continue }
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
        const dx = mx - cx, dy = my - cy
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const lift = 20 + (p.route % 4) * 18
        const ctrlX = mx + (dx / len) * lift
        const ctrlY = my + (dy / len) * lift - 12
        const t = p.t
        const px = (1-t)*(1-t)*a.x + 2*(1-t)*t*ctrlX + t*t*b.x
        const py = (1-t)*(1-t)*a.y + 2*(1-t)*t*ctrlY + t*t*b.y
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 8)
        grad.addColorStop(0, 'rgba(232,32,58,0.95)')
        grad.addColorStop(0.5, 'rgba(204,26,46,0.4)')
        grad.addColorStop(1, 'rgba(204,26,46,0)')
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,220,220,0.95)'
        ctx.beginPath(); ctx.arc(px, py, 1.6, 0, Math.PI * 2); ctx.fill()
        p.t += 0.012
      }

      // Cities
      pts.forEach(p => {
        if (!p.visible) return
        const fade = Math.min(1, p.z + 0.6)
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 7)
        g.addColorStop(0, `rgba(232,32,58,${0.9 * fade})`)
        g.addColorStop(1, 'rgba(232,32,58,0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = `rgba(255,255,255,${0.95 * fade})`
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill()
        if (p.important) {
          ctx.font = '9px "Share Tech Mono", monospace'
          ctx.fillStyle = `rgba(232,230,225,${0.55 * fade})`
          ctx.fillText(p.name, p.x + 8, p.y - 4)
        }
      })

      // Satellites
      for (let i = 0; i < 4; i++) {
        const sat = sats[i]
        sat.phase += sat.speed
        const a = sat.radius, b = sat.radius * 0.35
        ctx.strokeStyle = 'rgba(200,169,110,0.12)'
        ctx.lineWidth = 0.6
        ctx.beginPath()
        for (let k = 0; k <= 64; k++) {
          const ang = (k / 64) * Math.PI * 2
          const x0 = a * Math.cos(ang), y0 = b * Math.sin(ang)
          const xt = x0 * Math.cos(sat.roll) - y0 * Math.sin(sat.roll)
          const yt = x0 * Math.sin(sat.roll) + y0 * Math.cos(sat.roll)
          if (k === 0) ctx.moveTo(cx + xt, cy + yt); else ctx.lineTo(cx + xt, cy + yt)
        }
        ctx.stroke()
        const x0 = a * Math.cos(sat.phase), y0 = b * Math.sin(sat.phase)
        const xt = x0 * Math.cos(sat.roll) - y0 * Math.sin(sat.roll)
        const yt = x0 * Math.sin(sat.roll) + y0 * Math.cos(sat.roll)
        const sx = cx + xt, sy = cy + yt
        for (let k = 1; k <= 10; k++) {
          const tang = sat.phase - k * 0.04
          const tx0 = a * Math.cos(tang), ty0 = b * Math.sin(tang)
          const txt = tx0 * Math.cos(sat.roll) - ty0 * Math.sin(sat.roll)
          const tyt = tx0 * Math.sin(sat.roll) + ty0 * Math.cos(sat.roll)
          ctx.fillStyle = `rgba(200,169,110,${0.4 * (1 - k / 10)})`
          ctx.beginPath(); ctx.arc(cx + txt, cy + tyt, 1.2, 0, Math.PI * 2); ctx.fill()
        }
        const gs = ctx.createRadialGradient(sx, sy, 0, sx, sy, 6)
        gs.addColorStop(0, 'rgba(200,169,110,0.95)')
        gs.addColorStop(1, 'rgba(200,169,110,0)')
        ctx.fillStyle = gs
        ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = 'rgba(255,235,200,0.9)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(sx - 3, sy); ctx.lineTo(sx + 3, sy)
        ctx.moveTo(sx, sy - 3); ctx.lineTo(sx, sy + 3)
        ctx.stroke()
      }

      // Reticle
      ctx.strokeStyle = 'rgba(204,26,46,0.18)'
      ctx.lineWidth = 0.5
      ctx.setLineDash([3, 6])
      ctx.beginPath()
      ctx.moveTo(cx - R - 50, cy); ctx.lineTo(cx + R + 50, cy)
      ctx.moveTo(cx, cy - R - 50); ctx.lineTo(cx, cy + R + 50)
      ctx.stroke()
      ctx.setLineDash([])

      raf = requestAnimationFrame(tick)
    }

    tick()
    return () => cancelAnimationFrame(raf)
  }, [width, height])

  return <canvas ref={canvasRef} style={{ width, height, display: 'block' }} />
}
