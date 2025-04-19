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

const TicketList = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [error, setError] = useState('');

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
      selector: row => row.id,
      sortable: true,
      width: '200px',
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
      cell: row => getPriorityBadge(row.priority)
    },
    {
      name: 'Durum',
      selector: row => row.status,
      sortable: true,
      cell: row => {
        const statuses = {
          'open': 'Açık',
          'in_progress': 'İşlemde',
          'resolved': 'Çözüldü',
          'closed': 'Kapandı'
        };
        return (
          <div className={`status-badge ${row.status.toLowerCase()}`}>
            {statuses[row.status] || row.status}
          </div>
        );
      }
    },
    {
      name: 'Oluşturulma Tarihi',
      selector: row => row.created_at,
      sortable: true,
      cell: row => new Date(row.created_at).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
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
          fetchTickets(page);
        } else {
          setError('Talep silinirken bir hata oluştu');
        }
      } catch (err) {
        setError('Talep silinirken bir hata oluştu');
      }
    }
  };

  const handleAssign = async (ticketId) => {
    // Bu kısmı daha sonra bir modal veya dropdown ile geliştireceğiz
    const userId = prompt('Atanacak kullanıcı ID:');
    if (userId) {
      try {
        const response = await adminService.assignTicket(ticketId, userId);
        if (response.success) {
          fetchTickets(page);
        } else {
          setError('Talep atama işlemi başarısız oldu');
        }
      } catch (err) {
        setError('Talep atama işlemi başarısız oldu');
      }
    }
  };

  const columnsWithActions = [
    ...columns,
    {
      name: 'İşlemler',
      cell: row => (
        <div className="actions">
          <button 
            className="action-button view"
            onClick={() => window.location.href = `/tickets/${row.id}`}
            title="Görüntüle"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          {user.role === 'ADMIN' && (
            <>
              <button 
                className="action-button edit"
                onClick={() => window.location.href = `/tickets/${row.id}/edit`}
                title="Düzenle"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button 
                className="action-button assign"
                onClick={() => handleAssign(row.id)}
                title="Ata"
              >
                <FontAwesomeIcon icon={faUserPlus} />
              </button>
              <button 
                className="action-button delete"
                onClick={() => handleDelete(row.id)}
                title="Sil"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </>
          )}
        </div>
      ),
      width: '150px'
    }
  ];

  const customStyles = {
    table: {
      style: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }
    },
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        borderBottom: '1px solid #dee2e6'
      }
    },
    headCells: {
      style: {
        padding: '1rem',
        fontWeight: '600',
        color: '#2c3e50'
      }
    },
    cells: {
      style: {
        padding: '1rem'
      }
    },
    rows: {
      style: {
        '&:hover': {
          backgroundColor: '#f8f9fa',
          cursor: 'pointer'
        }
      }
    }
  };

  return (
    <div className="ticket-list-container">
      <h1>{user.role === 'ADMIN' ? 'Tüm Talepler' : 'Taleplerim'}</h1>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      <DataTable
        columns={columnsWithActions}
        data={tickets}
        progressPending={loading}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
        noDataComponent="Henüz talep bulunmuyor"
        progressComponent={
          <div className="loading">
            <FontAwesomeIcon icon={faSpinner} spin />
            <span>Yükleniyor...</span>
          </div>
        }
        customStyles={customStyles}
      />
    </div>
  );
};

export default TicketList; 