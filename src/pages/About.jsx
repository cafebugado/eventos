import Header from '../components/Header'
import Footer from '../components/Footer'
import FloatingMenu from '../components/FloatingMenu'
import SEOHead from '../components/SEOHead'
import AboutFeatures from '../components/AboutFeatures'
import ContributorsGrid from '../components/ContributorsGrid'
import './About.css'

function About() {
  return (
    <div className="page-container">
      <SEOHead
        title="Sobre"
        description="Conheca a Comunidade Cafe Bugado. Um jeito mais simples de descobrir eventos de tecnologia. Reunimos meetups, workshops, hackathons e conferencias em um so lugar."
        url={`${window.location.origin}/sobre`}
      />
      <Header />
      {/* Main Content */}
      <main className="main-content">
        <section className="sobre-section">
          <div className="container">
            <AboutFeatures />
            <ContributorsGrid />
          </div>
        </section>
      </main>

      <Footer />
      <FloatingMenu />
    </div>
  )
}
export default About
