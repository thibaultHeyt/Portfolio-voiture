import { useEffect, useState } from 'react'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'

import { cars } from '../../data/cars'
import { asset } from './asset'

// Les modèles sont téléchargés et analysés une seule fois, pendant l'écran de
// chargement, puis servis depuis ce cache : le hero affiche directement la
// vraie voiture, sans passer par une silhouette provisoire.
const cache = new Map<string, GLTF>()
const pending = new Map<string, Promise<GLTF>>()

let draco: DRACOLoader | null = null
function getDraco() {
  if (!draco) {
    draco = new DRACOLoader()
    draco.setDecoderPath(asset('/draco/'))
  }
  return draco
}

export function getModel(url: string): GLTF | null {
  return cache.get(url) ?? null
}

export function loadModel(url: string): Promise<GLTF> {
  const cached = cache.get(url)
  if (cached) return Promise.resolve(cached)

  const running = pending.get(url)
  if (running) return running

  const loader = new GLTFLoader()
  loader.setDRACOLoader(getDraco())

  const promise = loader
    .loadAsync(asset(url))
    .then((gltf) => {
      cache.set(url, gltf)
      return gltf
    })
    .finally(() => pending.delete(url))

  pending.set(url, promise)
  return promise
}

/** Charge toutes les voitures ; `onProgress` reçoit la fraction terminée. */
export async function preloadModels(onProgress?: (fraction: number) => void): Promise<void> {
  const urls = cars.map((car) => car.model).filter((url): url is string => Boolean(url))
  let done = 0

  await Promise.all(
    urls.map(async (url) => {
      await loadModel(url).catch(() => undefined)
      done += 1
      onProgress?.(done / urls.length)
    }),
  )
}

/** Le modèle déjà en cache, sinon null le temps du téléchargement. */
export function useCarModel(url: string | undefined): GLTF | null {
  const [entry, setEntry] = useState<{ url: string; gltf: GLTF } | null>(null)

  useEffect(() => {
    if (!url) return
    let live = true
    void loadModel(url)
      .then((gltf) => {
        if (live) setEntry({ url, gltf })
      })
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [url])

  if (!url) return null
  if (entry?.url === url) return entry.gltf
  return getModel(url)
}
