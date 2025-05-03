import { useAuth } from '../contexts/AuthContext';

/**
 * Kullanıcı yetkilerini kontrol etmek için hook
 * @returns {Object} - Yetki kontrol fonksiyonları
 */
const usePermission = () => {
  const { user, isAuthenticated } = useAuth();
  
  /**
   * Kullanıcının admin olup olmadığını kontrol eder
   * @returns {boolean} - Kullanıcı admin ise true, değilse false
   */
  const isAdmin = () => {
    return isAuthenticated && user?.role === 'admin';
  };
  
  /**
   * Kullanıcının standart kullanıcı olup olmadığını kontrol eder
   * @returns {boolean} - Kullanıcı standart kullanıcı ise true, değilse false
   */
  const isUser = () => {
    return isAuthenticated && user?.role === 'user';
  };
  
  /**
   * Kullanıcının belirtilen role sahip olup olmadığını kontrol eder
   * @param {string|Array} roles - Kontrol edilecek rol veya roller
   * @returns {boolean} - Kullanıcı belirtilen rollerden birine sahipse true, değilse false
   */
  const hasRole = (roles) => {
    if (!isAuthenticated || !user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  };
  
  /**
   * Kullanıcının belirtilen kaynağı görebilme yetkisi olup olmadığını kontrol eder
   * @param {string} resourceType - Kaynak türü
   * @param {string|null} resourceOwnerId - Kaynağın sahibinin ID'si (varsa)
   * @returns {boolean} - Kullanıcı kaynağı görebilir ise true, değilse false
   */
  const canView = (resourceType, resourceOwnerId = null) => {
    if (!isAuthenticated) return false;
    
    // Admin her şeyi görebilir
    if (isAdmin()) return true;
    
    // Kendi kaynaklarını görebilme kontrolü
    if (resourceOwnerId && resourceOwnerId === user.id) {
      return true;
    }
    
    // Resource tipine göre özel kurallar
    switch(resourceType) {
      case 'ticket':
        // Kullanıcılar kendi biletlerini veya departmanlarına atanan biletleri görebilir
        return true; // Bu kısmı gerçek iş kurallarına göre güncelleyin
      case 'user':
        // Kullanıcılar sadece kendi profillerini görebilir
        return resourceOwnerId === user.id;
      case 'department':
        // Departmanları herkes görebilir
        return true;
      case 'equipment':
        // Ekipmanları herkes görebilir
        return true;
      default:
        return false;
    }
  };
  
  /**
   * Kullanıcının belirtilen kaynağı düzenleyebilme yetkisi olup olmadığını kontrol eder
   * @param {string} resourceType - Kaynak türü
   * @param {string|null} resourceOwnerId - Kaynağın sahibinin ID'si (varsa)
   * @returns {boolean} - Kullanıcı kaynağı düzenleyebilir ise true, değilse false
   */
  const canEdit = (resourceType, resourceOwnerId = null) => {
    if (!isAuthenticated) return false;
    
    // Admin her şeyi düzenleyebilir
    if (isAdmin()) return true;
    
    // Resource tipine göre özel kurallar
    switch(resourceType) {
      case 'ticket':
        // Kullanıcılar kendi biletlerini düzenleyebilir
        return resourceOwnerId === user.id;
      case 'user':
        // Kullanıcılar sadece kendi profillerini düzenleyebilir
        return resourceOwnerId === user.id;
      case 'department':
        // Departmanları sadece adminler düzenleyebilir
        return false;
      case 'equipment':
        // Ekipmanları sadece adminler düzenleyebilir
        return false;
      default:
        return false;
    }
  };
  
  /**
   * Kullanıcının belirtilen kaynağı silebilme yetkisi olup olmadığını kontrol eder
   * @param {string} resourceType - Kaynak türü
   * @param {string|null} resourceOwnerId - Kaynağın sahibinin ID'si (varsa)
   * @returns {boolean} - Kullanıcı kaynağı silebilir ise true, değilse false
   */
  const canDelete = (resourceType, resourceOwnerId = null) => {
    if (!isAuthenticated) return false;
    
    // Admin her şeyi silebilir
    if (isAdmin()) return true;
    
    // Resource tipine göre özel kurallar
    switch(resourceType) {
      case 'ticket':
        // Kullanıcılar kendi biletlerini silebilir
        return resourceOwnerId === user.id;
      case 'user':
        // Kullanıcılar kendi hesaplarını silebilir
        return resourceOwnerId === user.id;
      case 'department':
        // Departmanları sadece adminler silebilir
        return false;
      case 'equipment':
        // Ekipmanları sadece adminler silebilir
        return false;
      default:
        return false;
    }
  };
  
  /**
   * Kullanıcının belirtilen kaynağı oluşturabilme yetkisi olup olmadığını kontrol eder
   * @param {string} resourceType - Kaynak türü
   * @returns {boolean} - Kullanıcı kaynağı oluşturabilir ise true, değilse false
   */
  const canCreate = (resourceType) => {
    if (!isAuthenticated) return false;
    
    // Admin her şeyi oluşturabilir
    if (isAdmin()) return true;
    
    // Resource tipine göre özel kurallar
    switch(resourceType) {
      case 'ticket':
        // Kullanıcılar bilet oluşturabilir
        return true;
      case 'user':
        // Kullanıcı oluşturmayı sadece adminler yapabilir
        return false;
      case 'department':
        // Departman oluşturmayı sadece adminler yapabilir
        return false;
      case 'equipment':
        // Ekipman oluşturmayı sadece adminler yapabilir
        return false;
      default:
        return false;
    }
  };
  
  return {
    isAdmin,
    isUser,
    hasRole,
    canView,
    canEdit,
    canDelete,
    canCreate
  };
};

export default usePermission; 