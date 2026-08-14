import { useState } from 'react'
import Pagination from './Pagination'

export default {
  title: 'Design System/Pagination',
  component: Pagination,
}

function Template({ totalPages }) {
  const [currentPage, setCurrentPage] = useState(1)
  return (
    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
  )
}

export const Padrao = {
  render: () => <Template totalPages={5} />,
}

export const MuitasPaginas = {
  render: () => <Template totalPages={20} />,
}

export const UmaPagina = {
  render: () => <Template totalPages={1} />,
}
