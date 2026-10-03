import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const STAR_COUNT = 4000
const BURST_PARTICLES = 150
const BURST_LIFETIME = 2.0
const FIELD_RADIUS = 55
const INNER_RADIUS = 18
const ATTRACT_RADIUS = 8
const ATTRACT_STRENGTH = 0.6
const DRIFT_SPEED = 0.012
const RETURN_STRENGTH = 0.002
const COLLISION_THRESHOLD = 0.5
const COLLISION_STRENGTH = 0.2

const starVertexShader = `
  attribute float baseSize;
  attribute float phase;
  attribute vec3 customColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.6 + 0.4 * sin(uTime * (0.25 + phase * 0.5) + phase * 6.2832);
    float size = baseSize * twinkle * uPixelRatio * (100.0 / -mvPosition.z);
    gl_PointSize = max(size, 0.5);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = twinkle;
  }
`

const starFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.0, 0.5, d);
    gl_FragColor = vec4(vColor, alpha * vAlpha);
  }
`

const burstVertexShader = `
  attribute float baseSize;
  attribute float aAlpha;
  uniform float uPixelRatio;
  varying float vAlpha;

  void main() {
    vAlpha = aAlpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float size = baseSize * uPixelRatio * (200.0 / -mvPosition.z);
    gl_PointSize = max(size, 0.5);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const burstFragmentShader = `
  varying float vAlpha;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.0, 0.5, d);
    alpha = pow(alpha, 1.5);
    gl_FragColor = vec4(0.9, 0.85, 1.0, alpha * vAlpha);
  }
`

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200)
    camera.position.set(0, 0, 0)
    camera.lookAt(0, 0, -40)

    const positions = new Float32Array(STAR_COUNT * 3)
    const basePositions = new Float32Array(STAR_COUNT * 3)
    const velocities = new Float32Array(STAR_COUNT * 3)
    const sizes = new Float32Array(STAR_COUNT)
    const phases = new Float32Array(STAR_COUNT)
    const colors = new Float32Array(STAR_COUNT * 3)

    function randomColor() {
      const t = Math.random()
      if (t < 0.6) {
        const b = 0.8 + Math.random() * 0.2
        return [b, b, b + Math.random() * 0.05]
      }
      if (t < 0.82) {
        return [
          0.5 + Math.random() * 0.3,
          0.6 + Math.random() * 0.3,
          0.9 + Math.random() * 0.1,
        ]
      }
      return [
        0.7 + Math.random() * 0.3,
        0.5 + Math.random() * 0.3,
        0.9 + Math.random() * 0.1,
      ]
    }

    for (let i = 0; i < STAR_COUNT; i++) {
      const radius = INNER_RADIUS + Math.random() * (FIELD_RADIUS - INNER_RADIUS)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      basePositions[i * 3] = positions[i * 3]
      basePositions[i * 3 + 1] = positions[i * 3 + 1]
      basePositions[i * 3 + 2] = positions[i * 3 + 2]

      velocities[i * 3] = (Math.random() - 0.5) * DRIFT_SPEED
      velocities[i * 3 + 1] = (Math.random() - 0.5) * DRIFT_SPEED
      velocities[i * 3 + 2] = (Math.random() - 0.5) * DRIFT_SPEED

      sizes[i] = 0.6 + Math.random() * 3.5
      phases[i] = Math.random() * Math.PI * 2

      const [r, g, b] = randomColor()
      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
    }

    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starGeometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    starGeometry.setAttribute('baseSize', new THREE.BufferAttribute(sizes, 1))
    starGeometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))

    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const starPoints = new THREE.Points(starGeometry, starMaterial)
    scene.add(starPoints)

    const burstPos = new Float32Array(BURST_PARTICLES * 3)
    const burstVel = new Float32Array(BURST_PARTICLES * 3)
    const burstSize = new Float32Array(BURST_PARTICLES)
    const burstAlpha = new Float32Array(BURST_PARTICLES)
    const burstStart = new Float32Array(BURST_PARTICLES)
    const burstActive = new Uint8Array(BURST_PARTICLES)
    const burstInitialized = new Uint8Array(BURST_PARTICLES)

    for (let i = 0; i < BURST_PARTICLES; i++) {
      burstPos[i * 3] = 0
      burstPos[i * 3 + 1] = 0
      burstPos[i * 3 + 2] = -1000
      burstSize[i] = 0.3 + Math.random() * 1.2
      burstAlpha[i] = 0
      burstStart[i] = 0
      burstActive[i] = 0
      burstInitialized[i] = 0
    }

    const burstGeometry = new THREE.BufferGeometry()
    burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPos, 3))
    burstGeometry.setAttribute('baseSize', new THREE.BufferAttribute(burstSize, 1))
    burstGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(burstAlpha, 1))

    const burstMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: burstVertexShader,
      fragmentShader: burstFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const burstPoints = new THREE.Points(burstGeometry, burstMaterial)
    scene.add(burstPoints)

    let nextBurstSlot = 0
    const burstSlotSize = 30

    function spawnBurst(worldX: number, worldY: number, worldZ: number) {
      const slot = nextBurstSlot % Math.floor(BURST_PARTICLES / burstSlotSize)
      nextBurstSlot++
      const start = slot * burstSlotSize
      const count = Math.min(burstSlotSize, BURST_PARTICLES - start)

      for (let i = 0; i < count; i++) {
        const idx = start + i
        burstPos[idx * 3] = worldX
        burstPos[idx * 3 + 1] = worldY
        burstPos[idx * 3 + 2] = worldZ

        const speed = 0.3 + Math.random() * 1.2
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        burstVel[idx * 3] = speed * Math.sin(phi) * Math.cos(theta)
        burstVel[idx * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta)
        burstVel[idx * 3 + 2] = speed * Math.cos(phi)

        burstAlpha[idx] = 1
        burstStart[idx] = time
        burstActive[idx] = 1
        burstInitialized[idx] = 1
      }
    }

    const mouse = new THREE.Vector2(0, 0)
    let time = 0

    function getMouseWorldPoint(): THREE.Vector3 | null {
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 35)
      const point = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, point)
      return point
    }

    let animateId: number
    let mousePoint: THREE.Vector3 | null = null

    function animate() {
      animateId = requestAnimationFrame(animate)

      if (document.hidden) return

      const posAttr = starGeometry.attributes.position as THREE.BufferAttribute
      const posArray = posAttr.array as Float32Array

      mousePoint = getMouseWorldPoint()

      for (let i = 0; i < STAR_COUNT; i++) {
        const i3 = i * 3

        velocities[i3] += (Math.random() - 0.5) * 0.002
        velocities[i3 + 1] += (Math.random() - 0.5) * 0.002
        velocities[i3 + 2] += (Math.random() - 0.5) * 0.002

        const dxr = basePositions[i3] - posArray[i3]
        const dyr = basePositions[i3 + 1] - posArray[i3 + 1]
        const dzr = basePositions[i3 + 2] - posArray[i3 + 2]
        velocities[i3] += dxr * RETURN_STRENGTH
        velocities[i3 + 1] += dyr * RETURN_STRENGTH
        velocities[i3 + 2] += dzr * RETURN_STRENGTH

        velocities[i3] *= 0.98
        velocities[i3 + 1] *= 0.98
        velocities[i3 + 2] *= 0.98

        posArray[i3] += velocities[i3]
        posArray[i3 + 1] += velocities[i3 + 1]
        posArray[i3 + 2] += velocities[i3 + 2]
      }

      if (mousePoint) {
        const mx = mousePoint.x
        const my = mousePoint.y
        const mz = mousePoint.z

        for (let i = 0; i < STAR_COUNT; i++) {
          const i3 = i * 3
          const dx = posArray[i3] - mx
          const dy = posArray[i3 + 1] - my
          const dz = posArray[i3 + 2] - mz
          const distSq = dx * dx + dy * dy + dz * dz
          const dist = Math.sqrt(distSq)

          if (dist < ATTRACT_RADIUS && dist > 0.01) {
            const force = (1 - dist / ATTRACT_RADIUS) * ATTRACT_STRENGTH * 0.04
            velocities[i3] -= (dx / dist) * force
            velocities[i3 + 1] -= (dy / dist) * force
            velocities[i3 + 2] -= (dz / dist) * force
          }
        }
      }

      const gridSize = 6
      const cellDim = FIELD_RADIUS * 2 / gridSize
      const grid: number[][] = Array.from({ length: gridSize * gridSize * gridSize }, () => [])

      for (let i = 0; i < STAR_COUNT; i++) {
        const i3 = i * 3
        const gx = Math.floor((posArray[i3] + FIELD_RADIUS) / cellDim)
        const gy = Math.floor((posArray[i3 + 1] + FIELD_RADIUS) / cellDim)
        const gz = Math.floor((posArray[i3 + 2] + FIELD_RADIUS) / cellDim)
        if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize && gz >= 0 && gz < gridSize) {
          grid[gx * gridSize * gridSize + gy * gridSize + gz].push(i)
        }
      }

      for (let ci = 0; ci < grid.length; ci++) {
        const cell = grid[ci]
        for (let a = 0; a < cell.length; a++) {
          for (let b = a + 1; b < cell.length; b++) {
            const ia = cell[a] * 3
            const ib = cell[b] * 3
            const dx = posArray[ia] - posArray[ib]
            const dy = posArray[ia + 1] - posArray[ib + 1]
            const dz = posArray[ia + 2] - posArray[ib + 2]
            const distSq = dx * dx + dy * dy + dz * dz

            if (distSq < COLLISION_THRESHOLD * COLLISION_THRESHOLD && distSq > 0.001) {
              const dist = Math.sqrt(distSq)
              const push = (COLLISION_THRESHOLD - dist) / COLLISION_THRESHOLD * COLLISION_STRENGTH * 0.02
              const nx = dx / dist
              const ny = dy / dist
              const nz = dz / dist
              velocities[ia] += nx * push
              velocities[ia + 1] += ny * push
              velocities[ia + 2] += nz * push
              velocities[ib] -= nx * push
              velocities[ib + 1] -= ny * push
              velocities[ib + 2] -= nz * push
            }
          }
        }
      }

      posAttr.needsUpdate = true

      time += 0.016
      starMaterial.uniforms.uTime.value = time

      const distToCenter = mousePoint
        ? Math.sqrt(mousePoint.x * mousePoint.x + mousePoint.y * mousePoint.y + mousePoint.z * mousePoint.z)
        : 35
      const targetZ = Math.min(distToCenter, 40)
      camera.position.x += (mouse.x * 3 - camera.position.x) * 0.02
      camera.position.y += (-mouse.y * 3 - camera.position.y) * 0.02
      camera.position.z += (-targetZ - camera.position.z) * 0.01
      camera.lookAt(0, 0, -40)

      const burstPosAttr = burstGeometry.attributes.position as THREE.BufferAttribute
      const burstAlphaAttr = burstGeometry.attributes.aAlpha as THREE.BufferAttribute
      const bpa = burstPosAttr.array as Float32Array
      const baa = burstAlphaAttr.array as Float32Array

      for (let i = 0; i < BURST_PARTICLES; i++) {
        if (!burstActive[i]) continue
        const age = time - burstStart[i]
        if (age > BURST_LIFETIME) {
          burstActive[i] = 0
          baa[i] = 0
          bpa[i * 3] = 0
          bpa[i * 3 + 1] = 0
          bpa[i * 3 + 2] = -1000
          continue
        }

        const fade = 1 - age / BURST_LIFETIME
        bpa[i * 3] += burstVel[i * 3] * 0.06 * fade
        bpa[i * 3 + 1] += burstVel[i * 3 + 1] * 0.06 * fade
        bpa[i * 3 + 2] += burstVel[i * 3 + 2] * 0.06 * fade

        burstVel[i * 3] *= 0.97
        burstVel[i * 3 + 1] *= 0.97
        burstVel[i * 3 + 2] *= 0.97

        baa[i] = fade * fade
      }

      burstPosAttr.needsUpdate = true
      burstAlphaAttr.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    function onResize() {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    function onMouseMove(e: MouseEvent) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('[role="button"]')
      ) {
        return
      }

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 35)
      const point = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, point)
      if (point) {
        spawnBurst(point.x, point.y, point.z)
      }
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(animateId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('click', onClick)
      starGeometry.dispose()
      starMaterial.dispose()
      burstGeometry.dispose()
      burstMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 1, pointerEvents: 'none', mixBlendMode: 'screen' }}
    />
  )
}
