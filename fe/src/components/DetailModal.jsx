function DetailModal({ selectedPerson, showModal, onClose, onUpdate }) {
  if (!showModal || !selectedPerson) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update cards</h3>
        </div>

        <div className="modal-body">
          <div className="modal-left">
            <div className="modal-form-group">
              <label>Họ tên</label>
              <input type="text" value={selectedPerson.name.toUpperCase()} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Mã số</label>
              <input type="text" value={selectedPerson.cardId} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Tên</label>
              <input type="text" value={selectedPerson.code} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Quốc tịch</label>
              <input type="text" value={selectedPerson.nationality.toUpperCase()} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Ngày sinh</label>
              <input type="text" value={selectedPerson.dob} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Quê quán</label>
              <input type="text" value={selectedPerson.birthPlace} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Nơi đăng ký</label>
              <input type="text" value={selectedPerson.registrationPlace} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Ngày cấp</label>
              <input type="text" value={selectedPerson.issueDate} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Hiệu lực</label>
              <input type="text" value={selectedPerson.validity} readOnly />
            </div>
          </div>

          <div className="modal-right">
            <div className="card-preview">
              <img src="https://via.placeholder.com/300x200?text=CCCD" alt="CCCD Preview" />
            </div>
            <div className="modal-info">
              <div className="info-row">
                <span className="info-label">Level</span>
                <span className="info-label">Nationality</span>
              </div>
              <div className="info-row">
                <span className="info-value">{selectedPerson.code}</span>
                <span className="info-value">VIỆT NAM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-modal-update" onClick={onUpdate}>
            Update
          </button>
          <button className="btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailModal;
