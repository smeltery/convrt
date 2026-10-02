import { ConversionDemo, Formats, Header, Hero } from './components/Demo.tsx'

export function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ConversionDemo />
        <Formats />
      </main>
    </>
  )
}
