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
        <Details />
      </main>
    </>
  )
}
