function SearchTable({ searchQuery, setSearchQuery, filteredData, onRowClick }) {
  return (
    <div className="search-content">
      <div className="search-header">
        <h3>Search</h3>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Enter ID card, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Card ID</th>
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Nationality</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} onClick={() => onRowClick(item)} className="clickable-row">
                <td>
                  <div className="table-avatar">
                    <img src="https://via.placeholder.com/40" alt="Avatar" />
                  </div>
                </td>
                <td>{item.name}</td>
                <td>{item.cardId}</td>
                <td>{item.dob}</td>
                <td>{item.gender}</td>
                <td>{item.nationality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SearchTable;
