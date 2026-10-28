import { MotionConfig } from 'motion/react'
import { useEffect } from 'react'

import { preloadModels } from './lib/carModels'
import { Cursor } from './components/Cursor'
import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { Preloader } from './components/Preloader'
import { ScrollProgress } from './components/ScrollProgress'
import { Home } from './pages/Home'

export function App() {
  // Sans écran de chargement (prefers-reduced-motion), les modèles partent
  // quand même en tâche de fond : le hero n'affiche jamais de silhouette.
  useEffect(() => {
    void preloadModels()
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <Preloader />
      <ScrollProgress />
      <Cursor />
      <Nav />
      <main>
        <Home />
      </main>
      <Footer />
    </MotionConfig>
  )
}
