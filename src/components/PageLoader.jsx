import './PageLoader.css'

export default function PageLoader() {
  return (
    <div className="page-loader" aria-label="Carregando página...">
      <div className="page-loader__spinner" />
    </div>
  )
}
