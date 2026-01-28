import React, { useState } from 'react';
import { updateCCCD, updateBHYT } from '../services/documentsAdmin';

function DetailModal({ selectedPerson, showModal, onClose, onUpdate, loading, error, activeTab }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  React.useEffect(() => {
    setEditMode(false);
    setForm(selectedPerson || {});
    setSaveError('');
  }, [selectedPerson, showModal]);
  if (!showModal || !selectedPerson) return null;

  // Format giới tính sang tiếng Việt
  const formatGender = (gender) => {
    if (!gender) return 'N/A';
    if (gender === 'MALE' || gender.toLowerCase() === 'male') return 'Nam';
    if (gender === 'FEMALE' || gender.toLowerCase() === 'female') return 'Nữ';
    return gender;
  };

  let content = null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      // Đảm bảo luôn có document_id đúng
      const docId = form.document_id || form.id;
      const data = { ...form, document_id: docId };
      if (activeTab === 'cccd') {
        await updateCCCD(docId, data);
      } else if (activeTab === 'insurance') {
        await updateBHYT(docId, data);
      }
      setEditMode(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      setSaveError(err.message || 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    content = <div style={{ padding: 30, textAlign: 'center' }}>Đang tải chi tiết...</div>;
  } else if (error) {
    content = <div style={{ padding: 30, color: 'red', textAlign: 'center' }}>{error}</div>;
  } else if (activeTab === 'cccd') {
    content = (
      <>
        <div className="modal-header"><h3>Chi tiết CCCD</h3></div>
        <div className="modal-body">
          <div className="modal-left">
            <div className="modal-form-group"><label>Số CCCD</label><input name="so_cccd" type="text" value={form.so_cccd || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Họ tên</label><input name="citizen_name" type="text" value={form.citizen_name || form.name || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Ngày sinh</label><input name="citizen_dob" type="text" value={form.citizen_dob || form.date_of_birth || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Giới tính</label><input name="citizen_gender" type="text" value={form.citizen_gender || form.gender || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Quê quán</label><input name="origin_place" type="text" value={form.origin_place || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Địa chỉ</label><input name="current_place" type="text" value={form.current_place || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Ngày cấp</label><input name="issue_date" type="text" value={form.issue_date || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Ngày hết hạn</label><input name="expire_date" type="text" value={form.expire_date || ''} onChange={handleChange} readOnly={!editMode} /></div>
          </div>
        </div>
      </>
    );
  } else if (activeTab === 'insurance') {
    content = (
      <>
        <div className="modal-header"><h3>Chi tiết BHYT</h3></div>
        <div className="modal-body">
          <div className="modal-left">
            <div className="modal-form-group"><label>Số BHYT</label><input name="so_bhyt" type="text" value={form.so_bhyt || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Họ tên</label><input name="citizen_name" type="text" value={form.citizen_name || form.name || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Ngày sinh</label><input name="citizen_dob" type="text" value={form.citizen_dob || form.date_of_birth || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Giới tính</label><input name="citizen_gender" type="text" value={form.citizen_gender || form.gender || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Nơi ĐK KCB</label><input name="hospital_code" type="text" value={form.hospital_code || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Giá trị sử dụng</label><input name="issue_date" type="text" value={form.issue_date || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Hết hạn</label><input name="expire_date" type="text" value={form.expire_date || ''} onChange={handleChange} readOnly={!editMode} /></div>
            <div className="modal-form-group"><label>Nơi cấp thẻ</label><input name="insurance_area" type="text" value={form.insurance_area || ''} onChange={handleChange} readOnly={!editMode} /></div>
          </div>
        </div>
      </>
    );
  } else {
    // Thông tin công dân chung
    content = (
      <>
        <div className="modal-header"><h3>Chi tiết công dân</h3></div>
        <div className="modal-body">
          <div className="modal-left">
            <div className="modal-form-group"><label>Họ tên</label><input type="text" value={selectedPerson.name?.toUpperCase() || 'N/A'} readOnly /></div>
            <div className="modal-form-group"><label>Ngày sinh</label><input type="text" value={selectedPerson.date_of_birth || 'N/A'} readOnly /></div>
            <div className="modal-form-group"><label>Giới tính</label><input type="text" value={formatGender(selectedPerson.gender)} readOnly /></div>
            <div className="modal-form-group"><label>Quốc tịch</label><input type="text" value={selectedPerson.nationality?.toUpperCase() || 'N/A'} readOnly /></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {content}
        <div className="modal-footer">
          {saveError && <span style={{color:'red',marginRight:10}}>{saveError}</span>}
          {editMode ? (
            <>
              <button className="btn-modal-save" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
              <button className="btn-modal-cancel" onClick={() => setEditMode(false)} disabled={saving}>Hủy</button>
            </>
          ) : (
            <>
              <button className="btn-modal-edit" onClick={() => setEditMode(true)}>Chỉnh sửa</button>
              <button className="btn-modal-cancel" onClick={onClose}>Đóng</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailModal;
