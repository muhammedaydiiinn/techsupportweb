import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faEye,
  faEdit,
  faTrash,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import DataTable from 'react-data-table-component';
import { ticketService, adminService } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './TicketList.css';
import { useNavigate } from 'react-router-dom';
import AssignTicketModal from '../../components/AssignTicketModal/AssignTicketModal';

const TicketList = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const getPriorityBadge = (priority) => {
    const styles = {
      low: { backgroundColor: '#F0FFF4', color: '#38A169' },
      medium: { backgroundColor: '#FFFAF0', color: '#DD6B20' },
      high: { backgroundColor: '#FFF5F5', color: '#E53E3E' },
      critical: { backgroundColor: '#FAF5FF', color: '#805AD5' }
    };

    const style = styles[priority] || { backgroundColor: '#F7FAFC', color: '#4A5568' };

    return (
      <div style={{
        ...style,
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '500',
        display: 'inline-block'
      }}>
        {priority}
      </div>
    );
  };

  const columns = [
    {
      name: 'Talep No',
      selector: (row, index) => `TKT-${String(index + 1 + (page - 1) * perPage).padStart(5, '0')}`,
      sortable: true,
      width: '120px',
    },
    {
      name: 'Başlık',
      selector: row => row.title,
      sortable: true,
      grow: 2,
    },
    {
      name: 'Kategori',
      selector: row => row.category,
      sortable: true,
      width: '120px',
      cell: row => {
        const categories = {
          'hardware': 'Donanım',
          'software': 'Yazılım',
          'network': 'Ağ/İnternet'
        };
        return categories[row.category] || row.category;
      }
    },
    {
      name: 'Öncelik',
      selector: row => row.priority,
      sortable: true,
      width: '120px',
      cell: row => getPriorityBadge(row.priority)
    },
    {
      name: 'Durum',
      selector: row => row.status,
      sortable: true,
      width: '150px',
      cell: row => {
        const statuses = {
          'open': 'Açık',
          'in_progress': 'İşlemde',
          'resolved': 'Çözüldü',
          'closed': 'Kapandı'
        };

        return user?.role === 'admin' ? (
          <select
            value={row.status}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            className="status-select"
          >
            <option value="open">Açık</option>
            <option value="in_progress">İşlemde</option>
            <option value="resolved">Çözüldü</option>
            <option value="closed">Kapandı</option>
          </select>
        ) : (
          statuses[row.status] || row.status
        );
      }
    },
    {
      name: 'Oluşturulma',
      selector: row => row.created_at,
      sortable: true,
      width: '180px',
      cell: row => new Date(row.created_at).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    {
      name: 'İşlemler',
      width: '180px',
      cell: row => (
        <div className="action-buttons">
          <button
            className="action-button view"
            onClick={() => navigate(`/tickets/${row.id}`)}
            title="Görüntüle"
          >
            <FontAwesomeIcon icon={faEye} size="sm" />
          </button>
          {user?.role === 'admin' && (
            <>
              <button
                className="action-button edit"
                onClick={() => navigate(`/tickets/${row.id}/edit`)}
                title="Düzenle"
              >
                <FontAwesomeIcon icon={faEdit} size="sm" />
              </button>
              <button
                className="action-button assign"
                onClick={() => handleAssignClick(row.id)}
                title="Ata"
              >
                <FontAwesomeIcon icon={faUserPlus} size="sm" />
              </button>
              <button
                className="action-button delete"
                onClick={() => handleDelete(row.id)}
                title="Sil"
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  const fetchTickets = useCallback(async (page) => {
    try {
      setLoading(true);
      const response = await ticketService.getTickets({
        page: page,
        per_page: perPage,
      });

      console.log('Ticket response:', response); // Debug için

      if (response.success) {
        setTickets(response.data || []);
        setTotalRows(response.data?.length || 0);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Talepler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  useEffect(() => {
    fetchTickets(page);
  }, [page, perPage, fetchTickets]);

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
  };

  const handleDelete = async (ticketId) => {
    if (window.confirm('Bu talebi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await adminService.deleteTicket(ticketId);
        if (response.success) {
          toast.success('Talep başarıyla silindi');
          fetchTickets(page);
        } else {
          toast.error(response.message || 'Talep silinirken bir hata oluştu');
        }
      } catch (err) {
        toast.error('Talep silinirken bir hata oluştu');
      }
    }
  };

  const handleAssignClick = (ticketId) => {
    if (user?.role !== 'admin') {
      toast.error('Bu işlem için admin yetkisi gerekiyor');
      return;
    }
    setSelectedTicketId(ticketId);
    setIsAssignModalOpen(true);
  };

  const handleAssignSuccess = () => {
    fetchTickets(page);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await ticketService.updateTicketStatus(ticketId, newStatus);
      if (response.success) {
        toast.success('Talep durumu güncellendi');
        fetchTickets(page);
      } else {
        toast.error(response.message || 'Durum güncellenirken bir hata oluştu');
      }
    } catch (err) {
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  const customStyles = {
    table: {
      style: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
      }
    },
    tableWrapper: {
      style: {
        padding: '1rem'
      }
    },
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        borderBottom: '2px solid #e2e8f0',
        minHeight: '52px'
      }
    },
    headCells: {
      style: {
        padding: '1rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#2d3748',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }
    },
    cells: {
      style: {
        padding: '1rem',
        fontSize: '0.875rem',
        color: '#4a5568'
      }
    },
    rows: {
      style: {
        backgroundColor: 'white',
        minHeight: '48px',
        '&:not(:last-of-type)': {
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: '#e2e8f0'
        },
        '&:hover': {
          backgroundColor: '#f7fafc',
          cursor: 'pointer',
          transition: 'all .2s ease'
        }
      }
    },
    pagination: {
      style: {
        borderTop: '1px solid #e2e8f0',
        padding: '1rem'
      },
      pageButtonsStyle: {
        borderRadius: '0.375rem',
        height: '32px',
        minWidth: '32px',
        padding: '0 0.5rem',
        margin: '0 0.25rem',
        cursor: 'pointer',
        transition: 'all .2s ease',
        backgroundColor: 'transparent',
        border: '1px solid #e2e8f0',
        color: '#4a5568',
        '&:hover:not(:disabled)': {
          backgroundColor: '#edf2f7',
          borderColor: '#cbd5e0'
        },
        '&:disabled': {
          cursor: 'not-allowed',
          color: '#a0aec0',
          backgroundColor: '#f7fafc'
        }
      }
    }
  };

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header">
        <h1>{user.role === 'admin' ? 'Tüm Talepler' : 'Taleplerim'}</h1>
        <div className="ticket-actions">
          <button 
            className="create-ticket-button"
            onClick={() => navigate('/tickets/create')}
          >
            Yeni Talep Oluştur
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={tickets}
        progressPending={loading}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
        noDataComponent={
          <div className="no-data">
            <p>Henüz talep bulunmuyor</p>
            <button 
              className="create-ticket-button"
              onClick={() => navigate('/tickets/create')}
            >
              Yeni Talep Oluştur
            </button>
          </div>
        }
        progressComponent={
          <div className="loading">
            <FontAwesomeIcon icon={faSpinner} spin />
            <span>Yükleniyor...</span>
          </div>
        }
        customStyles={customStyles}
      />

      <AssignTicketModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        ticketId={selectedTicketId}
        onAssign={handleAssignSuccess}
      />
    </div>
  );
};

export default TicketList; 