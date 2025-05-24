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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const navigate = useNavigate();

  const getPriorityBadge = (priority) => {
    const priorityValue = typeof priority === 'string' ? priority.toUpperCase() : priority;
    
    const styles = {
      LOW: { backgroundColor: '#F0FFF4', color: '#38A169', borderColor: '#9AE6B4' },
      MEDIUM: { backgroundColor: '#FFFAF0', color: '#DD6B20', borderColor: '#FBD38D' },
      HIGH: { backgroundColor: '#FFF5F5', color: '#E53E3E', borderColor: '#FEB2B2' },
      CRITICAL: { backgroundColor: '#FAF5FF', color: '#805AD5', borderColor: '#D6BCFA' }
    };

    const style = styles[priorityValue] || { backgroundColor: '#F7FAFC', color: '#4A5568', borderColor: '#CBD5E0' };

    return (
      <div style={{
        ...style,
        padding: '0.35rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '500',
        display: 'inline-block',
        border: '1px solid',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}>
        {priorityValue === 'LOW' ? 'Düşük' : 
         priorityValue === 'MEDIUM' ? 'Normal' : 
         priorityValue === 'HIGH' ? 'Yüksek' : 
         priorityValue === 'CRITICAL' ? 'Acil' : priority}
      </div>
    );
  };

  const columns = [
    {
      name: 'Talep No',
      selector: (row, index) => `TKT-${String(index + 1 + (currentPage - 1) * itemsPerPage).padStart(5, '0')}`,
      sortable: true,
      width: '100px',
      sortField: 'id',
      cell: row => (
        <div className="ticket-number">
          {`TKT-${String(row.id || '0').padStart(5, '0')}`}
        </div>
      )
    },
    {
      name: 'Başlık',
      selector: row => row.title,
      sortable: true,
      grow: 2,
      cell: row => (
        <div className="ticket-title" title={row.title}>
          {row.title.length > 60 ? `${row.title.substring(0, 60)}...` : row.title}
        </div>
      )
    },
    {
      name: 'Kategori',
      selector: row => row.category,
      sortable: true,
      width: '110px',
      cell: row => {
        const categoryValue = typeof row.category === 'string' ? row.category.toUpperCase() : row.category;
        const categories = {
          'HARDWARE': 'Donanım',
          'SOFTWARE': 'Yazılım',
          'NETWORK': 'Ağ/İnternet',
          'TECHNICAL': 'Teknik',
          'OTHER': 'Diğer'
        };
        return (
          <div className="ticket-category">
            {categories[categoryValue] || categoryValue}
          </div>
        );
      }
    },
    {
      name: 'Öncelik',
      selector: row => row.priority,
      sortable: true,
      width: '100px',
      cell: row => getPriorityBadge(row.priority)
    },
    {
      name: 'Durum',
      selector: row => row.status,
      sortable: true,
      width: '130px',
      cell: row => {
        const statuses = {
          'OPEN': 'Açık',
          'IN_PROGRESS': 'İşlemde',
          'RESOLVED': 'Çözüldü',
          'CLOSED': 'Kapandı',
          'WAITING': 'Beklemede'
        };

        const statusValue = typeof row.status === 'string' ? row.status.toUpperCase() : row.status;
        const displayStatus = statuses[statusValue] || statusValue;

        return user?.role === 'admin' ? (
          <select
            value={statusValue}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            className="status-select"
          >
            <option value="OPEN">Açık</option>
            <option value="IN_PROGRESS">İşlemde</option>
            <option value="WAITING">Beklemede</option>
            <option value="RESOLVED">Çözüldü</option>
            <option value="CLOSED">Kapandı</option>
          </select>
        ) : (
          <div className={`status-badge status-${statusValue?.toLowerCase()}`}>
            {displayStatus}
          </div>
        );
      }
    },
    {
      name: 'Tarih',
      selector: row => row.created_at,
      sortable: true,
      width: '110px',
      cell: row => (
        <div className="ticket-date">
          {new Date(row.created_at).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
          })}
        </div>
      )
    },
    {
      name: 'İşlemler',
      width: '120px',
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
        per_page: itemsPerPage,
        sort_by: 'id',
        sort_direction: 'asc'
      });

      if (response.success) {
        const sortedTickets = response.data.sort((a, b) => a.id - b.id);
        setTickets(sortedTickets || []);
        setTotalItems(response.data?.length || 0);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Talepler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchTickets(currentPage);
  }, [currentPage, itemsPerPage, fetchTickets]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setItemsPerPage(newPerPage);
  };

  const handleDelete = async (ticketId) => {
    if (window.confirm('Bu talebi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await adminService.deleteTicket(ticketId);
        if (response.success) {
          toast.success('Talep başarıyla silindi');
          fetchTickets(currentPage);
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
    setSelectedTicket(ticketId);
    setShowAssignModal(true);
  };

  const handleAssignSuccess = () => {
    fetchTickets(currentPage);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await ticketService.updateTicketStatus(ticketId, newStatus);
      if (response.success) {
        toast.success('Talep durumu güncellendi');
        fetchTickets(currentPage);
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
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
      }
    },
    tableWrapper: {
      style: {
        padding: '0.75rem'
      }
    },
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        borderBottom: '1px solid #e2e8f0',
        minHeight: '46px'
      }
    },
    headCells: {
      style: {
        padding: '0.75rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.025em'
      }
    },
    cells: {
      style: {
        padding: '0.75rem',
        fontSize: '0.815rem',
        color: '#1e293b'
      }
    },
    rows: {
      style: {
        backgroundColor: 'white',
        minHeight: '44px',
        '&:not(:last-of-type)': {
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: '#f1f5f9'
        },
        '&:hover': {
          backgroundColor: '#f8fafc',
          cursor: 'pointer',
          transition: 'all .15s ease'
        }
      }
    },
    pagination: {
      style: {
        borderTop: '1px solid #e2e8f0',
        padding: '0.75rem'
      },
      pageButtonsStyle: {
        borderRadius: '0.25rem',
        height: '30px',
        minWidth: '30px',
        padding: '0 0.5rem',
        margin: '0 0.125rem',
        cursor: 'pointer',
        transition: 'all .15s ease',
        backgroundColor: 'transparent',
        border: '1px solid #e2e8f0',
        color: '#4a5568',
        '&:hover:not(:disabled)': {
          backgroundColor: '#f1f5f9',
          borderColor: '#cbd5e0'
        },
        '&:disabled': {
          cursor: 'not-allowed',
          color: '#a0aec0',
          backgroundColor: '#f7fafc'
        }
      }
    },
    subHeader: {
      style: {
        padding: '0.75rem',
        backgroundColor: '#fff',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }
    },
    title: {
      style: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#334155',
      }
    }
  };

  return (
    <div className="ticket-list-container">
      <DataTable
        columns={columns}
        data={tickets}
        progressPending={loading}
        pagination
        paginationServer
        paginationTotalRows={totalItems}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
        defaultSortFieldId="id"
        defaultSortAsc={true}
        sortServer={false}
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
        actions={
          <button 
            className="create-ticket-button"
            onClick={() => navigate('/tickets/create')}
          >
            Yeni Talep Oluştur
          </button>
        }
        title={user?.role === 'admin' ? 'Tüm Talepler' : 'Taleplerim'}
      />

      <AssignTicketModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        ticketId={selectedTicket}
        onAssign={handleAssignSuccess}
      />
    </div>
  );
};

export default TicketList; 