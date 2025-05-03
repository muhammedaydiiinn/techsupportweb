import PropTypes from 'prop-types';
import usePermission from '../hooks/usePermission';

/**
 * Kullanıcının yetkilerine göre içeriği koşullu olarak render eden bileşen
 * 
 * @param {Object} props
 * @param {('isAdmin'|'isUser'|'hasRole'|'canView'|'canEdit'|'canDelete'|'canCreate')} props.permission - Kontrol edilecek yetki türü
 * @param {(string|string[])} [props.roles] - hasRole için kontrol edilecek rol veya roller
 * @param {string} [props.resourceType] - can* metotları için kaynak türü
 * @param {string} [props.resourceOwnerId] - can* metotları için kaynak sahibi ID'si
 * @param {ReactNode} props.children - Yetkiye sahip olunduğunda gösterilecek içerik
 * @param {ReactNode} [props.fallback] - Yetkiye sahip olunmadığında gösterilecek içerik
 * @returns {ReactNode}
 */
const PermissionGate = ({ 
  permission,
  roles,
  resourceType,
  resourceOwnerId,
  children,
  fallback = null
}) => {
  const permissions = usePermission();
  
  // Yetki fonksiyonu var mı kontrol et
  if (!permissions[permission]) {
    console.error(`Geçersiz yetki türü: ${permission}`);
    return fallback;
  }
  
  let hasPermission = false;
  
  // İlgili yetki fonksiyonunu çağır
  switch (permission) {
    case 'isAdmin':
    case 'isUser':
      hasPermission = permissions[permission]();
      break;
    case 'hasRole':
      hasPermission = permissions.hasRole(roles);
      break;
    case 'canView':
    case 'canEdit':
    case 'canDelete':
      hasPermission = permissions[permission](resourceType, resourceOwnerId);
      break;
    case 'canCreate':
      hasPermission = permissions.canCreate(resourceType);
      break;
    default:
      hasPermission = false;
  }
  
  return hasPermission ? children : fallback;
};

PermissionGate.propTypes = {
  permission: PropTypes.oneOf([
    'isAdmin', 
    'isUser', 
    'hasRole',
    'canView',
    'canEdit',
    'canDelete',
    'canCreate'
  ]).isRequired,
  roles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  resourceType: PropTypes.string,
  resourceOwnerId: PropTypes.string,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node
};

export default PermissionGate; 