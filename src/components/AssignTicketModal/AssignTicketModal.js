import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ticketService } from '../../services/ticketService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './AssignTicketModal.css';

const AssignTicketModal = ({ isOpen, onClose, ticketId, onAssign }) => {
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen && (!user || user.role !== 'admin')) {
      toast.error('Bu işlem için admin yetkisi gerekiyor');
      onClose();
      return;
    }

    const fetchData = async () => {
      // ticketId yoksa veya geçersizse işlem yapma
      if (!ticketId || ticketId === 'undefined') {
        toast.error('Geçersiz talep ID');
        onClose();
        return;
      }

      try {
        setLoading(true);
        // API yanıtlarını al
        const ticketResponse = await ticketService.getTicketById(ticketId);
        const usersResponse = await userService.getAllUsers();

        console.log('Ticket yanıtı:', ticketResponse);
        console.log('Users yanıtı:', usersResponse);

        // ticketService artık { success: true, data: {...} } formatında yanıt döndürüyor
        if (ticketResponse && ticketResponse.success && ticketResponse.data) {
          setTicket(ticketResponse.data);
          if (ticketResponse.data.assigned_to) {
            setSelectedUserId(ticketResponse.data.assigned_to.id);
          }
        } else {
          toast.error('Talep detayları alınamadı');
        }

        if (usersResponse && usersResponse.data) {
          setUsers(usersResponse.data);
        } else {
          toast.error('Kullanıcı listesi alınamadı');
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && user?.role === 'admin') {
      fetchData();
    }
  }, [isOpen, user, ticketId, onClose]);

  const handleAssign = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Bu işlem için admin yetkisi gerekiyor');
      onClose();
      return;
    }

    if (!ticketId || ticketId === 'undefined') {
      toast.error('Geçersiz talep ID');
      onClose();
      return;
    }

    if (!selectedUserId) {
      toast.warning('Lütfen bir kullanıcı seçin');
      return;
    }

    setAssigning(true);
    try {
      const response = await ticketService.assignTicket(ticketId, selectedUserId, note);
      // API yanıt formatına göre kontrol
      if (response && response.success) {
        toast.success('Talep başarıyla atandı');
        onAssign();
        onClose();
      } else {
        toast.error(response?.message || 'Talep atama işlemi başarısız oldu');
      }
    } catch (error) {
      console.error('Atama hatası:', error);
      toast.error('Talep atama işlemi başarısız oldu');
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen || !user || user.role !== 'admin') return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container assign-modal">
        <div className="modal-header">
          <h2>Talep Atama</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="modal-body modal-content">
          {loading ? (
            <div className="loading-spinner">
              <FontAwesomeIcon icon={faSpinner} spin />
              <p>Yükleniyor...</p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="user-select">Kullanıcı Seçin</label>
                <select 
                  id="user-select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={assigning}
                >
                  <option value="">-- Kullanıcı seçin --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="note">Atama Notu (İsteğe Bağlı)</label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Atama hakkında not ekleyin..."
                  disabled={assigning}
                />
              </div>
            </>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="cancel-button" 
            onClick={onClose}
            disabled={assigning}
          >
            İptal
          </button>
          <button 
            className="assign-button" 
            onClick={handleAssign}
            disabled={loading || assigning || !selectedUserId}
          >
            {assigning ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Atanıyor...
              </>
            ) : 'Ata'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTicketModal; 