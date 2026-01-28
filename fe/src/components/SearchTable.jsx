import { useState, useEffect } from 'react';

function SearchTable({ searchQuery, setSearchQuery, filteredData, onRowClick }) {
  const [inputValue, setInputValue] = useState(searchQuery || '');

  // ✅ sync khi searchQuery đổi từ ngoài (zustand / parent)
  useEffect(() => {
    setInputValue(searchQuery || '');
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(inputValue);
    }
  };

  return (
    <div className="search-content">
      <div className="search-header">
        <h3>Search</h3>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Enter name..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
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
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Nationality</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick(item)}
                  className="clickable-row"
                >
                  <td>
                    <div className="table-avatar">
                      <img
                        src={item.avatar || 'https://via.placeholder.com/40'}
                        alt="Avatar"
                      />
                    </div>
                  </td>
                  <td>{item.name}</td>
                  <td>{item.date_of_birth || 'N/A'}</td>
                  <td>{item.gender || 'N/A'}</td>
                  <td>{item.nationality || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SearchTable;
