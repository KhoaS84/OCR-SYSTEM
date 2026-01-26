function DetailModal({ selectedPerson, showModal, onClose, onUpdate }) {
  if (!showModal || !selectedPerson) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chi tiết công dân</h3>
        </div>

        <div className="modal-body">
          <div className="modal-left">
            <div className="modal-form-group">
              <label>Họ tên</label>
              <input type="text" value={selectedPerson.name?.toUpperCase() || 'N/A'} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Ngày sinh</label>
              <input type="text" value={selectedPerson.date_of_birth || 'N/A'} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Giới tính</label>
              <input type="text" value={selectedPerson.gender || 'N/A'} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Quốc tịch</label>
              <input type="text" value={selectedPerson.nationality?.toUpperCase() || 'N/A'} readOnly />
            </div>
          </div>

          <div className="modal-right">
            <div className="card-preview">
              <img src="https://via.placeholder.com/300x200?text=Citizen+Info" alt="Citizen Preview" />
            </div>
            <div className="modal-info">
              <div className="info-row">
                <span className="info-label">ID</span>
                <span className="info-label">User ID</span>
              </div>
              <div className="info-row">
                <span className="info-value">{selectedPerson.id}</span>
                <span className="info-value">{selectedPerson.user_id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailModal;
