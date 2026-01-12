import './SortableColumnHeader.css'

export default function SortableColumnHeader({ 
  label, 
  column, 
  currentSortBy, 
  currentSortOrder, 
  onSort 
}) {
  const isActive = currentSortBy === column
  
  return (
    <th 
      className={`sortable-header ${isActive ? 'active' : ''}`}
      onClick={() => onSort(column)}
    >
      <div className="sortable-header-content">
        <span>{label}</span>
        <div className="sort-indicators">
          <span className={`sort-arrow up ${isActive && currentSortOrder === 'asc' ? 'active' : ''}`}>
            ▲
          </span>
          <span className={`sort-arrow down ${isActive && currentSortOrder === 'desc' ? 'active' : ''}`}>
            ▼
          </span>
        </div>
      </div>
    </th>
  )
}
