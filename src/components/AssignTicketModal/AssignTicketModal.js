import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { adminService, ticketService } from '../../api';
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

  useEffect(() => {
    // Admin değilse modalı kapat
    if (isOpen && (!user || user.role !== 'admin')) {
      toast.error('Bu işlem için admin yetkisi gerekiyor');
      onClose();
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [ticketResponse, usersResponse] = await Promise.all([
          ticketService.getTicketById(ticketId),
          adminService.getUsers()
        ]);

        if (ticketResponse.success) {
          setTicket(ticketResponse.data);
        } else {
          toast.error(ticketResponse.message || 'Talep detayları alınamadı');
        }

        if (usersResponse.success) {
          setUsers(usersResponse.data);
        } else {
          toast.error(usersResponse.message || 'Kullanıcı listesi alınamadı');
        }
      } catch (error) {
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && user?.role === 'admin') {
      fetchData();
      setSelectedUserId('');
    }
  }, [isOpen, user, ticketId, onClose]);

  const handleAssign = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Bu işlem için admin yetkisi gerekiyor');
      onClose();
      return;
    }

    if (!selectedUserId) {
      toast.warning('Lütfen bir kullanıcı seçin');
      return;
    }

    setAssigning(true);
    try {
      const response = await adminService.assignTicket(ticketId, selectedUserId);
      if (response.success) {
        toast.success('Talep başarıyla atandı');
        onAssign();
        onClose();
      } else {
        toast.error(response.message || 'Talep atama işlemi başarısız oldu');
      }
    } catch (error) {
      toast.error('Talep atama işlemi başarısız oldu');
    } finally {
      setAssigning(false);
    }
  };

  // Admin değilse modalı gösterme
  if (!isOpen || !user || user.role !== 'admin') return null;

  return (
    <div className="modal-overlay">
      <div className="assign-modal">
        <div className="modal-header">
          <h2>Talebi Ata</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-content">
          {loading ? (
            <div className="loading-spinner">
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Yükleniyor...</span>
            </div>
          ) : (
            <>
              <div className="current-assignment">
                <h3>Mevcut Atama:</h3>
                {ticket?.assigned_to ? (
                  <p>
                    {ticket.assigned_to.first_name} {ticket.assigned_to.last_name} ({ticket.assigned_to.email})
                  </p>
                ) : (
                  <p>Henüz kimseye atanmamış</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="user-select">Yeni Kullanıcı Seçin</label>
                <select
                  id="user-select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={assigning}
                >
                  <option value="">Seçiniz</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
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
            disabled={!selectedUserId || assigning}
          >
            {assigning ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Atanıyor...</span>
              </>
            ) : (
              'Ata'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTicketModal; 