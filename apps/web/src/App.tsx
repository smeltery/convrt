import { ConversionDemo } from './components/ConversionDemo.tsx'
import { FormatsStrip } from './components/FormatsStrip.tsx'
import { Header } from './components/Header.tsx'
import { Hero } from './components/Hero.tsx'

export function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ConversionDemo />
        <FormatsStrip />
      </main>
    </>
  )
}
