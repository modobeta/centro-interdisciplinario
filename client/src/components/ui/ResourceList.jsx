import FeedbackState from './FeedbackState'
import Pagination from './Pagination'
import ResponsiveDataList from './ResponsiveDataList'

export default function ResourceList({ remote, columns, page, onPage, actions }) {
  if (remote.status === 'loading') return <FeedbackState title="Cargando registros" />
  if (remote.status === 'error') return <FeedbackState type="error" message={remote.error?.message} onRetry={remote.refresh} />
  if (remote.status === 'empty') return <FeedbackState type="empty" />
  const items = remote.data || []
  return <><div className="desktop-table"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}{actions && <th>Acciones</th>}</tr></thead><tbody>{items.map((item) => <tr key={item.id}>{columns.map((column) => <td key={column.label}>{column.render ? column.render(item) : item[column.key] ?? '—'}</td>)}{actions && <td>{actions(item)}</td>}</tr>)}</tbody></table></div><ResponsiveDataList items={items} fields={columns} actions={actions} /><Pagination page={page} totalPages={remote.meta?.totalPages || 1} onChange={onPage} /></>
}
