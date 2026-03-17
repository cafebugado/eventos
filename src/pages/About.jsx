import {
  Target,
  Zap,
  Globe,
  Handshake,
  Github,
  Linkedin,
  ExternalLink,
  BookOpen,
  Heart,
} from 'lucide-react'
import Layout from '../layout/Layout'
import SEOHead from '../components/SEOHead'
import AboutFeatures from '../components/AboutFeatures'
import ContributorsGrid from '../components/ContributorsGrid'
import './About.css'

function About() {
  return (
    <Layout>
      <SEOHead
        title="Sobre"
        description="Conheca a Comunidade Cafe Bugado. Um jeito mais simples de descobrir eventos de tecnologia. Reunimos meetups, workshops, hackathons e conferencias em um so lugar."
        url={`${window.location.origin}/sobre`}
      />
      <main className="main-content">
        <section className="sobre-section">
          <div className="container">
            <AboutFeatures />
            <ContributorsGrid />
          </div>
        </section>
      </main>
    </Layout>
  )
}

export default About
