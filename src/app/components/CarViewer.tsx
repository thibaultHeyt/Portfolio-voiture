import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import type { Car } from '../../data/cars'
import { useCarModel } from '../lib/carModels'
import { cx } from '../lib/cx'

/**
 * Certains GLB arrivent sans textures : tout est gris, y compris la
 * carrosserie. On repose alors les couleurs d'après le nom des matériaux du
 * fichier (Body, EXT_GLASS, MIC_4S…), en ne touchant qu'aux matériaux non
 * texturés.
 */
function repaint(material: THREE.MeshStandardMaterial, paint: NonNullable<Car['paint']>) {
  const name = material.name.toUpperCase()

  // Le matériau de carrosserie nommé dans la fiche reçoit sa couleur. S'il a
  // une texture (Alpine), la couleur la teinte : les détails restent lisibles.
  if (material.name === paint.material) {
    material.color.set(paint.color)
    if (paint.tintOnly) return
    material.metalness = 0.45
    material.roughness = 0.26
    material.opacity = 1
    material.transparent = false
    material.depthWrite = true
    return
  }

  if (material.map) return

  const apply = (color: string, metalness: number, roughness: number, opacity = 1) => {
    material.color.set(color)
    material.metalness = metalness
    material.roughness = roughness
    material.opacity = opacity
    material.transparent = opacity < 1
  }

  if (name === paint.material.toUpperCase()) apply(paint.color, 0.45, 0.26)
  else if (name.includes('GLASS') || name.includes('DEFROST')) apply('#0a0d12', 0.15, 0.05, 0.72)
  else if (/CHROME|RIM|DISC|BOLT/.test(name)) apply('#c9c4bb', 1, 0.22)
  else if (/RED|LIGHT|TAIL|DLR/.test(name)) apply('#9d1712', 0.35, 0.18)
  else if (/BLACK|CARBON|PLASTIC|MIC|GRILL|EXH|WIPER|HOUSING|INTERCOOLER|MIRROR|AO|NM/.test(name)) apply('#171515', 0.35, 0.6)
  else if (name.startsWith('INT_')) apply('#2b2726', 0.2, 0.7)
}

/**
 * Repeint une planche de textures : seuls les pixels de la peinture d'origine
 * (le bleu du Ranger) sont remplacés, en gardant leur relief. Les feux, vitres
 * et chromes de la même planche ne bougent pas.
 */
/** Les planches repeintes sont partagées entre les scènes (le hero et la
 *  fiche), pour ne pas recalculer la même texture à chaque montage. */
const repaintedMaps = new Map<string, THREE.Texture>()

function repaintTextureMap(texture: THREE.Texture, color: string): THREE.Texture | null {
  const key = `${color}|${texture.uuid}`
  const cached = repaintedMaps.get(key)
  if (cached) return cached

  const image = texture.image as (CanvasImageSource & { width?: number; height?: number }) | undefined
  const width = image?.width ?? 0
  const height = image?.height ?? 0
  if (!image || !width || !height) return null

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return null
  context.drawImage(image, 0, 0)

  const pixels = context.getImageData(0, 0, width, height)
  const data = pixels.data
  const hex = color.replace('#', '')
  const target = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (b <= r + 20 || b <= g + 10) continue
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    // Les vitres teintées et les plastiques du fichier sont bleu très sombre :
    // les repeindre en noir les transforme en panneaux opaques. On ne touche
    // qu'aux panneaux de carrosserie, nettement plus lumineux.
    if (luma < 0.24) continue
    const k = 0.45 + 1.35 * luma
    data[i] = Math.min(255, target[0] * k)
    data[i + 1] = Math.min(255, target[1] * k)
    data[i + 2] = Math.min(255, target[2] * k)
  }

  context.putImageData(pixels, 0, 0)

  const repainted = new THREE.CanvasTexture(canvas)
  repainted.flipY = texture.flipY
  repainted.wrapS = texture.wrapS
  repainted.wrapT = texture.wrapT
  repainted.repeat.copy(texture.repeat)
  repainted.offset.copy(texture.offset)
  repainted.center.copy(texture.center)
  repainted.rotation = texture.rotation
  repainted.colorSpace = texture.colorSpace
  repainted.anisotropy = texture.anisotropy
  repainted.needsUpdate = true
  repaintedMaps.set(key, repainted)
  return repainted
}

/**
 * Prépare un GLB : ombres, reflets, couleurs, puis cadrage (mise à l'échelle,
 * centrage, pose au sol). Le modèle est prêté par le cache, donc on remet
 * d'abord sa transformation à zéro pour que la mesure soit toujours la même.
 */
function prepare(gltfScene: THREE.Group, car: Car) {
  const scene = gltfScene

  scene.scale.setScalar(1)
  scene.position.set(0, 0, 0)

  // Peinture dans la texture : on remplace la planche entière une seule fois,
  // pour tous les matériaux qui la partagent.
  const paint = car.paint
  if (paint?.texturePaint) {
    const replaced = new Map<THREE.Texture, THREE.Texture>()
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        const standard = material as THREE.MeshStandardMaterial
        if (standard.name !== paint.material || !standard.map || replaced.has(standard.map)) continue
        const repainted = repaintTextureMap(standard.map, paint.color)
        if (repainted) replaced.set(standard.map, repainted)
      }
    })

    if (replaced.size > 0) {
      scene.traverse((child) => {
        const mesh = child as THREE.Mesh
        if (!mesh.isMesh) return
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const material of materials) {
          const standard = material as THREE.MeshStandardMaterial
          const repainted = standard.map ? replaced.get(standard.map) : undefined
          if (repainted) standard.map = repainted
        }
      })
    }
  }

  scene.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.frustumCulled = false
    mesh.castShadow = true
    mesh.receiveShadow = true

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      const standard = material as THREE.MeshStandardMaterial
      if ('envMapIntensity' in standard) standard.envMapIntensity = 1.15

      // Beaucoup d'exports marquent toute la carrosserie en alphaMode BLEND
      // à opacité pleine : le moteur la rend alors translucide et on voit
      // l'intérieur à travers les portes. Au-delà de 85 % c'est opaque.
      if (standard.transparent && standard.opacity > 0.85) {
        standard.transparent = false
        standard.opacity = 1
        standard.depthWrite = true
      }

      if (paint && !paint.texturePaint) repaint(standard, paint)
    }
  })


  // La voiture occupe 4,4 unités de long quelle que soit l'échelle du fichier.
  const bounds = new THREE.Box3().setFromObject(scene)
  const size = new THREE.Vector3()
  bounds.getSize(size)
  const length = Math.max(size.x, size.z, 0.001)
  scene.scale.setScalar((4.4 / length) * (car.modelScale ?? 1))

  const scaled = new THREE.Box3().setFromObject(scene)
  const center = new THREE.Vector3()
  scaled.getCenter(center)
  scene.position.set(-center.x, -scaled.min.y + 0.01, -center.z)

  return scene
}

function GltfCar({ car }: { car: Car }) {
  const gltf = useCarModel(car.model)
  // Le GLTF est en cache et partagé : chaque scène travaille sur sa copie, sinon
  // la voiture de la fiche disparaît du hero (un objet n'a qu'un seul parent).
  const model = useMemo(() => (gltf ? prepare(gltf.scene.clone(true), car) : null), [gltf, car])

  if (!model) return null

  return (
    <group rotation={[0, car.modelRotation ?? Math.PI / 2, 0]}>
      <primitive object={model} />
    </group>
  )
}

/** Studio photo : boîtes à lumière plutôt qu'un décor de pièce, pour obtenir
 *  les longs reflets qui dessinent une carrosserie. */
function StudioEnvironment() {
  const { gl, scene } = useThree()

  useEffect(() => {
    const studio = new THREE.Scene()
    studio.background = new THREE.Color('#050404')

    const panel = (
      w: number,
      h: number,
      colour: string,
      intensity: number,
      position: [number, number, number],
      rotation: [number, number, number],
    ) => {
      const geometry = new THREE.PlaneGeometry(w, h)
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(colour).multiplyScalar(intensity), side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...position)
      mesh.rotation.set(...rotation)
      studio.add(mesh)
      return () => {
        geometry.dispose()
        material.dispose()
      }
    }

    const disposers = [
      panel(9, 5.5, '#ffffff', 2.4, [0, 4.4, 0.4], [Math.PI / 2, 0, 0]),
      panel(11, 1.5, '#fff1e8', 2.1, [-4.6, 2.1, 0.2], [0, Math.PI / 2, 0]),
      panel(11, 1.1, '#dfe6ff', 1.3, [4.6, 2.4, -0.2], [0, -Math.PI / 2, 0]),
      panel(8, 0.9, '#ff6a4a', 1.5, [0, 1.1, -4.6], [0, 0, 0]),
      panel(6, 0.6, '#ffd9c8', 0.8, [0, 0.7, 4.6], [0, Math.PI, 0]),
    ]

    const generator = new THREE.PMREMGenerator(gl)
    const environment = generator.fromScene(studio, 0.035).texture
    scene.environment = environment
    scene.environmentIntensity = 0.82

    return () => {
      scene.environment = null
      environment.dispose()
      generator.dispose()
      disposers.forEach((dispose) => dispose())
      studio.clear()
    }
  }, [gl, scene])

  return null
}

/** Ombre de contact : elle plaque la voiture au sol, même quand la grande
 *  ombre directionnelle est très diffuse. */
function ContactShadow() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext('2d')
    if (!context) return null
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 126)
    gradient.addColorStop(0, 'rgba(0,0,0,0.7)')
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.34)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(canvas)
  }, [])

  useEffect(() => () => texture?.dispose(), [texture])
  if (!texture) return null

  return (
    <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[5.1, 2.5]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}

function Framing({ zoom }: { zoom: number }) {
  const { camera, size } = useThree()

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height)
    // La voiture est cadrée à 4,4 unités de long : on recule juste assez pour
    // qu'elle tienne entière, vue de profil, sur un écran large comme sur un
    // téléphone (sinon l'avant et l'arrière sortent du cadre).
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov)
    camera.position.z = Math.max(7.9, 4.9 / (2 * Math.tan(fov / 2) * aspect)) / zoom
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height, zoom])

  return null
}

function Scene({ car, autoRotate, initialAngle, zoom }: { car: Car; autoRotate: boolean; initialAngle: number; zoom: number }) {
  const group = useRef<THREE.Group>(null)
  const { gl } = useThree()
  const angle = useRef(initialAngle)
  const velocity = useRef(0)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const cameraY = useRef(1.15)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    angle.current = initialAngle
    velocity.current = 0
  }, [car.slug, initialAngle])

  // Rotation à la souris ou au doigt, avec inertie au relâchement. Le pointeur
  // nourrit aussi une parallaxe douce de la caméra.
  useEffect(() => {
    const element = gl.domElement
    element.style.touchAction = 'pan-y'

    const down = (event: PointerEvent) => {
      dragging.current = true
      last.current = { x: event.clientX, y: event.clientY }
      element.setPointerCapture(event.pointerId)
    }
    const move = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      pointer.current.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1
      pointer.current.y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1
      if (!dragging.current) return
      const deltaX = event.clientX - last.current.x
      const deltaY = event.clientY - last.current.y
      last.current = { x: event.clientX, y: event.clientY }
      angle.current += deltaX * 0.009
      velocity.current = deltaX * 0.009
      cameraY.current = THREE.MathUtils.clamp(cameraY.current + deltaY * 0.0035, 0.9, 2.2)
    }
    const up = (event: PointerEvent) => {
      dragging.current = false
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
    }
    const leave = () => {
      pointer.current.x = 0
      pointer.current.y = 0
    }

    element.addEventListener('pointerdown', down)
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerup', up)
    element.addEventListener('pointercancel', up)
    element.addEventListener('pointerleave', leave)
    return () => {
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', up)
      element.removeEventListener('pointercancel', up)
      element.removeEventListener('pointerleave', leave)
    }
  }, [gl])

  useFrame((state, delta) => {
    if (!dragging.current) {
      angle.current += velocity.current
      velocity.current *= 0.93
      if (Math.abs(velocity.current) < 0.0005) {
        velocity.current = 0
        if (autoRotate) angle.current += delta * 0.16
      }
    }
    if (group.current) group.current.rotation.y = angle.current

    const targetX = pointer.current.x * 0.45
    const targetY = cameraY.current - pointer.current.y * 0.18
    state.camera.position.x += (targetX - state.camera.position.x) * Math.min(1, delta * 3)
    state.camera.position.y += (targetY - state.camera.position.y) * Math.min(1, delta * 4)
    state.camera.lookAt(0, 0.46, 0)
  })

  return (
    <>
      <StudioEnvironment />
      <Framing zoom={zoom} />
      <ambientLight intensity={0.3} />
      <hemisphereLight args={['#ffffff', '#141110', 0.6]} />
      <directionalLight
        position={[4.5, 7, 5]}
        intensity={1.7}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.5}
        shadow-camera-far={22}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.9} color="#dbe4ff" />
      <directionalLight position={[0, 2.5, -8]} intensity={0.45} color="#ffd9c9" />

      <group ref={group}>
        <GltfCar car={car} />
      </group>

      <ContactShadow />

      {/* sol de studio : il reçoit l'ombre réelle de la voiture */}
      <mesh position={[0, -0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.2, 96]} />
        <meshStandardMaterial color="#0a0808" roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.62, 2.65, 128]} />
        <meshBasicMaterial color="#e0362c" toneMapped={false} transparent opacity={0.32} />
      </mesh>
    </>
  )
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export function CarViewer({
  car,
  className,
  hero = false,
  initialAngle = 2.35,
  zoom = 1,
}: {
  car: Car
  className?: string
  hero?: boolean
  /** Angle de départ de la rotation, en radians. */
  initialAngle?: number
  /** Rapproche la caméra (1 = cadrage du hero). */
  zoom?: number
}) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  // Three.js n'a de sens que côté navigateur : on attend le montage pour
  // éviter toute création de contexte WebGL pendant le rendu serveur.
  useEffect(() => setMounted(true), [])

  return (
    <div className={cx('h-full w-full', className)}>
      {mounted ? (
        <Canvas
          shadows
          camera={{ position: [0, hero ? 1 : 1.15, 8.3], fov: hero ? 29 : 31 }}
          dpr={[1, 1.75]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
          // Signale à l'écran de chargement que la 3D est prête à s'afficher.
          onCreated={() => window.dispatchEvent(new Event('scene:ready'))}
        >
          <Scene car={car} autoRotate={!reduced} initialAngle={initialAngle} zoom={zoom} />
        </Canvas>
      ) : (
        <div className="grid size-full place-items-center text-[12px] uppercase tracking-[0.2em] text-faint">Chargement 3D</div>
      )}
    </div>
  )
}
