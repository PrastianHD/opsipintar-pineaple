import './landing.css'
import { MagazineHeader } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { Ticker } from '@/components/landing/ticker'
import { Process } from '@/components/landing/process'
import { Manifesto } from '@/components/landing/manifesto'
import { Features } from '@/components/landing/features'
import { Specimen } from '@/components/landing/specimen'
import { Pricing } from '@/components/landing/pricing'
import { Footer } from '@/components/landing/footer'
import { RevealRoot } from '@/components/landing/reveal-root'

export default function HomePage() {
  return (
    <RevealRoot>
      <div className="editorial">
        <MagazineHeader />
        <main>
          <Hero />
          <Ticker />
          <Process />
          <Manifesto />
          <Features />
          <Specimen />
          <Pricing />
        </main>
        <Footer />
      </div>
    </RevealRoot>
  )
}
