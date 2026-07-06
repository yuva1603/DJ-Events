import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, MeshReflectorMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store/appStore'
import { mapRange } from '../../utils/math'

useGLTF.preload('/models/table.glb')
useGLTF.preload('/models/logo.glb')

// Simple hologram shader (Fresnel + scanlines)
const hologramMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime:  { value: 0 },
    uColor: { value: new THREE.Color('#00d4ff') },
  },
  vertexShader: /* glsl */`
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec2 vUv;
    void main() {
      vNormal  = normalize(normalMatrix * normal);
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-mvPos.xyz);
      vUv      = uv;
      gl_Position = projectionMatrix * mvPos;
    }
  `,
  fragmentShader: /* glsl */`
    uniform float uTime;
    uniform vec3  uColor;
    varying vec3  vNormal;
    varying vec3  vViewDir;
    varying vec2  vUv;
    void main() {
      float fresnel  = pow(1.0 - dot(vNormal, vViewDir), 2.5);
      float scanline = step(0.9, fract(vUv.y * 20.0 + uTime * 0.5));
      float alpha    = fresnel * 0.7 + scanline * 0.15;
      gl_FragColor   = vec4(uColor, alpha);
    }
  `,
  transparent: true,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
})

/**
 * Zone5Contact — Table + logo on a reflective floor with holographic card accents.
 * Visible: scroll 0.85 → 1.00
 */
const Zone5Contact = () => {
  const table = useGLTF('/models/table.glb')
  const logo  = useGLTF('/models/logo.glb')
  const groupRef = useRef()
  const logoRef  = useRef()
  const card1Ref = useRef()
  const card2Ref = useRef()
  const matRef   = useRef(hologramMaterial)
  const scrollProgress = useStore((s) => s.scrollProgress)

  if (logo.scene) {
    logo.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone()
        child.material.emissive = new THREE.Color('#d9a619')
        child.material.emissiveIntensity = 1.0
        child.material.metalness = 0.9
        child.material.roughness = 0.1
      }
    })
  }

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!groupRef.current) return

    matRef.current.uniforms.uTime.value = t

    // Logo slow Y-rotation (12s cycle)
    if (logoRef.current) logoRef.current.rotation.y = t * (Math.PI * 2 / 12)

    // Hologram cards float
    if (card1Ref.current) card1Ref.current.position.y = 1.5 + Math.sin(t * 0.7) * 0.1
    if (card2Ref.current) card2Ref.current.position.y = 1.5 + Math.sin(t * 0.7 + 2) * 0.1

    // Fade in
    const opacity = mapRange(scrollProgress, 0.85, 0.93, 0, 1)
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material && child.material !== hologramMaterial) {
        child.material.opacity     = opacity
        child.material.transparent = true
      }
    })
  })

  return (
    <group ref={groupRef} position={[0, -1.8, -16.0]}>
      {/* Mirror floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={256}
          mixBlur={0.8}
          mixStrength={40}
          roughness={0.9}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050508"
          metalness={0.8}
        />
      </mesh>

      {/* Table */}
      <primitive object={table.scene.clone()} scale={[3, 3, 3]} position={[0, 0, 0]} />

      {/* Logo on table */}
      <primitive object={logo.scene.clone()} ref={logoRef}
        scale={[2, 2, 2]} position={[0, 1.2, 0]} />

      {/* Holographic floating cards */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={card1Ref} position={[-2.5, 1.5, 0.5]} rotation={[0, 0.4, 0.05]}>
          <boxGeometry args={[1.6, 1.0, 0.02]} />
          <primitive object={hologramMaterial} attach="material" />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh ref={card2Ref} position={[2.5, 1.5, 0.5]} rotation={[0, -0.4, -0.05]}>
          <boxGeometry args={[1.6, 1.0, 0.02]} />
          <primitive object={hologramMaterial} attach="material" />
        </mesh>
      </Float>

      {/* Ambient glow ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.2, 64]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default Zone5Contact
