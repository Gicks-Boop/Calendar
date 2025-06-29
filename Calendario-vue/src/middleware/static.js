const isEnvProd = import.meta.env != undefined && import.meta.env.MODE != "development";

const _SITE_CONFIG = {
  DEV: {
    viewPath: isEnvProd ? "/" : "/",
    API_ENDPOINT: "http://localhost:3000/api-v1/",
    assetsPath: isEnvProd ? "/assets/" : "/src/assets/",
    productName: "Calendario",
  },
};
const _CURRENT_SITE = _SITE_CONFIG.DEV;
export const BM_SITE = _CURRENT_SITE;

export const DEFAULT_SESSION_VAR = "SESSION_USER";

/**
 * @param {RequestInfo | URL} endpoint
 * @param {RequestInit} options
 * */
export const apiServerRequest = async (endpoint, options) => {
  options = typeof options !== "undefined" ? options : {};
  const props = {};
  props.headers = {
    "Content-Type": "application/json",
  };
  if (typeof options !== "undefined" && typeof options.headers !== "undefined") {
    options.headers = Object.assign(props.headers, options.headers);
  } else {
    options.headers = props.headers;
  }
  return await fetch(endpoint, options);
};

 const getUserData = () => {
  const userInfo = localStorage.getItem(DEFAULT_SESSION_VAR);
  if (userInfo) {
    return JSON.parse(userInfo);

  }
  return null;
};
export const BM_GET_USER_DATA = () => {
  return getUserData();
}; 

 export const BM_GET_USER_FOR_OPERATIONS = () => {
 const userData = getUserData();
 if (!userData) {
   return null;
 }
 
 return {
   id: userData.id,
   nombre: userData.nombre,
   apellido: userData.apellido,
   email: userData.email,
   oficinaId: userData.oficina?.id || userData.oficinaId,
   oficina: userData.oficina
 };
};
 
export const BM_GET_SIDEBAR_DATA = () => {
  const userData = getUserData();
  if (!userData) {
    return {
      name: '',
      lastName: '',
      email: '',
      fullName: '',
      oficina: '',
      rol: '',
      permissions: [],
      roleInfo: null
    };
  }
   
  const name = userData.nombre || '';
  const lastName = userData.apellido || '';
  const permissions = userData.rol && userData.rol.rolPermisos 
    ? userData.rol.rolPermisos
        .filter(rp => rp.activo)
        .map(rp => rp.permiso.nombre)
    : [];
  
  return {
    name,
    lastName,
    email: userData.email || '',
    fullName: `${name} ${lastName}`.trim(),
    oficina: userData.oficina || '',
    rol: userData.rol?.nombre || '',
    permissions,
    roleInfo: userData.rol ? {
      id: userData.rol.id,
      nombre: userData.rol.nombre,
      descripcion: userData.rol.descripcion
    } : null
  };
  
};

// Obtener permisos del usuario actual
export const BM_GET_USER_PERMISSIONS = () => {
  const sidebarData = BM_GET_SIDEBAR_DATA();
  return sidebarData.permissions || [];
};

// Obtener información del rol del usuario
export const BM_GET_USER_ROLE = () => {
  const sidebarData = BM_GET_SIDEBAR_DATA();
  return sidebarData.roleInfo;
};

// Verificar si el usuario tiene un permiso específico
export const BM_HAS_PERMISSION = (permission) => {
  const permissions = BM_GET_USER_PERMISSIONS();
 const roleInfo = BM_GET_USER_ROLE();
  
  // Si es administrador, tiene todos los permisos automáticamente
  if (roleInfo && (
    roleInfo.nombre === 'ADMIN' ||
    roleInfo.nombre.toLowerCase().includes('admin') || 
    roleInfo.nombre.toLowerCase().includes('administrador')
  )) {
    return true;
  }
  return permissions.includes(permission);
};



// Verificar si el usuario tiene alguno de los permisos especificados
export const BM_HAS_ANY_PERMISSION = (permissionArray) => {
  const permissions = BM_GET_USER_PERMISSIONS();
  const roleInfo = BM_GET_USER_ROLE();
  
  // Si es administrador, tiene todos los permisos automáticamente
  if (roleInfo && (
    roleInfo.nombre === 'ADMIN' ||
    roleInfo.nombre.toLowerCase().includes('admin') || 
    roleInfo.nombre.toLowerCase().includes('administrador')
  )) {
    return true;
  }
  
  return permissionArray.some(permission => permissions.includes(permission));
};

// Verificar si el usuario tiene todos los permisos especificados
export const BM_HAS_ALL_PERMISSIONS = (permissionArray) => {
  const permissions = BM_GET_USER_PERMISSIONS();
  const roleInfo = BM_GET_USER_ROLE();
  
  // Si es administrador, tiene todos los permisos automáticamente
  if (roleInfo && (
    roleInfo.nombre === 'ADMIN' ||
    roleInfo.nombre.toLowerCase().includes('admin') || 
    roleInfo.nombre.toLowerCase().includes('administrador')
  )) {
    return true;
  }
  
  return permissionArray.every(permission => permissions.includes(permission));
};

// Verificar si el usuario es administrador
export const BM_IS_ADMIN = () => {
 const roleInfo = BM_GET_USER_ROLE();
  const permissions = BM_GET_USER_PERMISSIONS();
  
  // Verificar por nombre del rol (tu backend devuelve "ADMIN")
  if (roleInfo && (
    roleInfo.nombre === 'ADMIN' ||
    roleInfo.nombre.toLowerCase().includes('admin') || 
    roleInfo.nombre.toLowerCase().includes('administrador')
  )) {
    return true;
  }
  
  // Verificar por permisos específicos usando los nombres reales de tu BD
  const adminPermissions = ['gestionarRoles'];
  return adminPermissions.some(permission => permissions.includes(permission));
};

// Función para hacer requests autenticados con verificación de permisos
export const apiServerRequestWithPermission = async (endpoint, options, requiredPermission = null) => {
  // Verificar permiso si se especifica
  if (requiredPermission && !BM_HAS_PERMISSION(requiredPermission)) {
    throw new Error(`No tienes permisos para realizar esta acción: ${requiredPermission}`);
  }
  
  const userData = BM_GET_USER_DATA();
  if (!userData) {
    throw new Error('Usuario no autenticado');
  }
  
  options = typeof options !== "undefined" ? options : {};
  const props = {};
  props.headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${userData.token}` // Si usas tokens
  };
  
  if (typeof options !== "undefined" && typeof options.headers !== "undefined") {
    options.headers = Object.assign(props.headers, options.headers);
  } else {
    options.headers = props.headers;
  }
  
  return await fetch(endpoint, options);
};

// Función para obtener permisos de calendario específicos
export const BM_GET_CALENDAR_PERMISSIONS = () => {
  const isAdmin = BM_IS_ADMIN();
  
  // Si es admin, tiene todos los permisos
  if (isAdmin) {
    return {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canManage: true,
      canViewAll: true
    };
  }
  
  // Si no es admin, verificar permisos específicos usando los nombres reales de la BD
  return {
    canView: BM_HAS_PERMISSION('verEvento'),
    canCreate: BM_HAS_PERMISSION('crearEvento'),
    canEdit: BM_HAS_PERMISSION('editarEvento'),
    canDelete: BM_HAS_PERMISSION('eliminarEventos'),
    canManage: BM_HAS_PERMISSION('gestionarRoles'),
    canViewAll: BM_HAS_ANY_PERMISSION(['gestionarRoles', 'verEvento'])
  };
};

// Función para verificar si puede realizar una acción específica en un evento
export const BM_CAN_PERFORM_EVENT_ACTION = (evento, action) => {
  const userData = BM_GET_USER_DATA();
  if (!userData) return false;

  const isAdmin = BM_IS_ADMIN();
  
  // Si es admin, puede hacer cualquier acción
  if (isAdmin) {
    return true;
  }

  const permissions = BM_GET_CALENDAR_PERMISSIONS();
  
  // OBTENER EL ID DEL CREADOR - PUEDE SER creadorId O creador.id
  const creadorId = evento.creadorId || evento.creador?.id;
  
  switch (action) {
    case 'view':
      // Puede ver si tiene permiso o es el creador
      return permissions.canView || (creadorId === userData.id);
    
    case 'edit':
      // SOLO puede editar si:
      // 1. Es el creador del evento Y tiene permiso de editar
      // 2. O si es admin (ya verificado arriba)
      return (creadorId === userData.id && permissions.canEdit);
    
    case 'delete':
      // SOLO puede eliminar si:
      // 1. Es el creador del evento Y tiene permiso de eliminar
      // 2. O si es admin (ya verificado arriba)
      return (creadorId === userData.id && permissions.canDelete);
    
    default:
      return false;
  }
};