import { Footer } from './components/Footer.tsx'
import { Engines, Platforms, Developers } from './components/Product.tsx'
import { Confetti } from './components/Confetti.tsx'
import { Details } from './components/Details.tsx'
import { ConversionDemo } from './components/Demo.tsx'
import { Formats, Header, Hero, HowItWorks } from './components/Marketing.tsx'

export function App() {
  return (
    <>
      <Confetti />
      <Header />
      <main id="main">
        <Hero />
        <ConversionDemo />
        <HowItWorks />
        <Formats />
        <Engines />
        <Platforms />
        <Developers />
        <Details />
      </main>
      <Footer />
    </>
  )
}
