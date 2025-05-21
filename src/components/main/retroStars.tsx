import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  attribute float size;
  attribute float opacity;
  varying float vOpacity;
  varying vec3 vColor;

  void main() {
    vOpacity = opacity;
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z); // 거리 보정
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying float vOpacity;
  varying vec3 vColor;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard; // 도트 형태 유지

   float glow = smoothstep(0.5, 0.0, dist);
   gl_FragColor = vec4(vColor, glow * vOpacity);
  }
`

function RetroStars({ count = 500 }) {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const opacities = new Float32Array(count)
  const speeds = new Float32Array(count)
  const phases = new Float32Array(count)

  const palette = [
    new THREE.Color('#ffffff'),
    new THREE.Color('#ff0051'),
    new THREE.Color('#00f0ff'),
    new THREE.Color('#ffe100'),
  ]

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 50
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5 + 5
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50

    const c = palette[Math.floor(Math.random() * palette.length)]
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b

    sizes[i] = Math.random() * 4 + 2
    opacities[i] = 1.0
    speeds[i] = Math.random() * 2 + 0.5
    phases[i] = Math.random() * Math.PI * 2
  }

  useEffect(() => {
    if (!pointsRef.current) return

    const geometry = pointsRef.current.geometry as THREE.BufferGeometry
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    )
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    geometry.setAttribute(
      'opacity',
      new THREE.Float32BufferAttribute(opacities, 1),
    )
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const time = clock.getElapsedTime()
    const geometry = pointsRef.current.geometry as THREE.BufferGeometry

    const newOpacities = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const twinkle =
        Math.sin(time * speeds[i] + phases[i]) * 0.5 +
        Math.sin(time * speeds[i] * 0.3 + phases[i]) * 0.5

      // 디지털 느낌 깜빡임
      const flicker = Math.max(0.0, Math.min(1.0, twinkle))
      newOpacities[i] = flicker * 1.0
    }

    geometry.setAttribute(
      'opacity',
      new THREE.Float32BufferAttribute(newOpacities, 1),
    )
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        vertexColors={true}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default RetroStars
