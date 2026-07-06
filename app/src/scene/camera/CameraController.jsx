import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA_POINTS, LOOK_AT_POINTS } from '../../utils/constants'
import useStore from '../../store/appStore'
import { damp, lerp } from '../../utils/math'

// Build the spline once (module level)
const curve = new THREE.CatmullRomCurve3(
  CAMERA_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  'catmullrom',
  0.5
)

const lookAtCurve = new THREE.CatmullRomCurve3(
  LOOK_AT_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  'catmullrom',
  0.5
)

const _pos    = new THREE.Vector3()
const _target = new THREE.Vector3()
const _lookAt = new THREE.Vector3()

/**
 * CameraController — Moves camera along a CatmullRom spline driven by scroll progress.
 * Uses damp() for smooth lag and quaternion SLERP for rotation.
 */
const CameraController = () => {
  const { camera } = useThree()
  const scrollProgress = useStore((s) => s.scrollProgress)
  const isMobile       = useStore((s) => s.isMobile)

  const smoothProgress = useRef(0)

  // Adjust FOV for mobile
  useFrame((_, delta) => {
    const targetFOV = isMobile ? 60 : 75
    camera.fov = damp(camera.fov, targetFOV, 4, delta)
    camera.updateProjectionMatrix()

    // Smooth the raw scroll progress
    smoothProgress.current = damp(smoothProgress.current, scrollProgress, 3, delta)
    const t = smoothProgress.current

    // Sample position on curve
    curve.getPoint(t, _pos)
    lookAtCurve.getPoint(t, _lookAt)

    // Damp camera toward curve point
    camera.position.lerp(_pos, damp(0, 1, 5, delta))

    // Look at smoothed target
    _target.copy(_lookAt)
    camera.lookAt(_target)
  })

  return null
}

export default CameraController
