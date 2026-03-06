import Header from '../components/Header'
import Footer from '../components/Footer'
import FloatingMenu from '../components/FloatingMenu'

function Layout({ children, className }) {
  return (
    <div className={className || 'layout-container'}>
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingMenu />
    </div>
  )
}
export default Layout
