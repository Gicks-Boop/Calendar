import * as Static from "../middleware/static";

class PermisoService {
  #permisosEndpoint = "permisos/";
  #rolesEndpoint = "roles/";
  #rolPermisosEndpoint = "rol-permisos/";
  
  constructor() {
    this.#permisosEndpoint = Static.BM_SITE.API_ENDPOINT + this.#permisosEndpoint;
    this.#rolesEndpoint = Static.BM_SITE.API_ENDPOINT + this.#rolesEndpoint;
    this.#rolPermisosEndpoint = Static.BM_SITE.API_ENDPOINT + this.#rolPermisosEndpoint;
  }

  // Obtiene headers con autenticación si está disponible
  #getAuthHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };
    
    const userData = Static.BM_GET_USER_DATA();
    if (userData?.token) {
      headers.Authorization = `Bearer ${userData.token}`;
    }
    
    return headers;
  }

  // Manejo centralizado de errores
  async #handleResponse(request) {
    if (!request.ok) {
      let errorMessage = "Error en la solicitud";
      try {
        const errorData = await request.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON, usar mensaje por defecto
      }
      throw new Error(errorMessage);
    }
    
    // Para respuestas 204 (No Content), no intentar parsear JSON
    if (request.status === 204) {
      return true;
    }
    
    return request.json();
  }

  // Verificar si se requiere permiso para la operación
  #checkPermission(requiredPermission) {
    if (requiredPermission && !this.hasPermission(requiredPermission)) {
      throw new Error(`No tienes permisos para realizar esta acción: ${requiredPermission}`);
    }
  }

  // ===== MÉTODOS DE VERIFICACIÓN DE PERMISOS =====

  /**
   * Obtener permisos del usuario actual
   * @returns {string[]} Array de nombres de permisos
   */
  getCurrentUserPermissions() {
    return Static.BM_GET_USER_PERMISSIONS();
  }

  /**
   * Verificar si el usuario actual tiene un permiso específico
   * @param {string} permission - Nombre del permiso
   * @returns {boolean}
   */
  hasPermission(permission) {
    return Static.BM_HAS_PERMISSION(permission);
  }

  /**
   * Verificar si el usuario actual tiene alguno de los permisos especificados
   * @param {string[]} permissionArray - Array de nombres de permisos
   * @returns {boolean}
   */
  hasAnyPermission(permissionArray) {
    return Static.BM_HAS_ANY_PERMISSION(permissionArray);
  }

  /**
   * Verificar si el usuario actual tiene todos los permisos especificados
   * @param {string[]} permissionArray - Array de nombres de permisos
   * @returns {boolean}
   */
  hasAllPermissions(permissionArray) {
    return Static.BM_HAS_ALL_PERMISSIONS(permissionArray);
  }

  /**
   * Obtener información del rol del usuario actual
   * @returns {Object|null}
   */
  getCurrentUserRole() {
    return Static.BM_GET_USER_ROLE();
  }

  /**
   * Verificar si el usuario actual es administrador
   * @returns {boolean}
   */
  isAdmin() {
    return Static.BM_IS_ADMIN();
  }

  /**
   * Verificar permisos para operaciones de calendario
   * @returns {Object} Objeto con permisos de calendario
   */
  getCalendarPermissions() {
    return Static.BM_GET_CALENDAR_PERMISSIONS();
  }

  // ===== MÉTODOS CRUD PARA PERMISOS =====

  /**
   * Obtener todos los permisos disponibles
   * @param {string} requiredPermission - Permiso requerido para esta operación
   */
  async getAllPermisos(requiredPermission = 'permisos.view') {
    this.#checkPermission(requiredPermission);
    
    const request = await Static.apiServerRequest(this.#permisosEndpoint, {
      method: "GET",
      headers: this.#getAuthHeaders(),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Obtener un permiso por ID
   * @param {number} id - ID del permiso
   * @param {string} requiredPermission - Permiso requerido para esta operación
   */
  async getPermisoById(id, requiredPermission = 'permisos.view') {
    this.#checkPermission(requiredPermission);
    
    const request = await Static.apiServerRequest(`${this.#permisosEndpoint}${id}`, {
      method: "GET",
      headers: this.#getAuthHeaders(),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Crear un nuevo permiso
   * @param {Object} data - Datos del permiso
   * @param {string} requiredPermission - Permiso requerido para esta operación
   */
  async createPermiso(data, requiredPermission = 'permisos.create') {
    this.#checkPermission(requiredPermission);
    
    const request = await Static.apiServerRequest(this.#permisosEndpoint, {
      method: "POST",
      headers: this.#getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Eliminar un permiso
   * @param {number} id - ID del permiso
   * @param {string} requiredPermission - Permiso requerido para esta operación
   */
  async deletePermiso(id, requiredPermission = 'permisos.delete') {
    this.#checkPermission(requiredPermission);
    
    const request = await Static.apiServerRequest(`${this.#permisosEndpoint}${id}`, {
      method: "DELETE",
      headers: this.#getAuthHeaders(),
    });
    
    return this.#handleResponse(request);
  }

  // ===== MÉTODOS CRUD PARA ROLES =====

  /**
   * Obtener todos los roles
   * @param {string} requiredPermission - Permiso requerido para esta operación
   */
  async getAllRoles(requiredPermission = 'roles.view') {
    this.#checkPermission(requiredPermission);
    
    const request = await Static.apiServerRequest(this.#rolesEndpoint, {
      method: "GET",
      headers: this.#getAuthHeaders(),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Obtener un rol por ID
   * @param {number} id - ID del rol
   * @param {string} requiredPermission - Permiso requerido para esta operación
   */
  async getRoleById(id, requiredPermission = 'roles.view') {
    this.#checkPermission(requiredPermission);
    
    const request = await Static.apiServerRequest(`${this.#rolesEndpoint}${id}`, {
      method: "GET",
      headers: this.#getAuthHeaders(),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Crear un nuevo rol
   * @param {Object} data - Datos del rol
   * @param {string} requiredPermission - Permiso requerido para esta operación
   */
  async createRole(data, requiredPermission = 'roles.create') {
    this.#checkPermission(requiredPermission);
    
    const request = await Static.apiServerRequest(this.#rolesEndpoint, {
      method: "POST",
      headers: this.#getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.#handleResponse(request);
  }

  // ===== MÉTODOS PARA GESTIÓN ROL-PERMISOS =====

  /**
   * Obtener permisos de un rol específico
   * @param {number} rolId - ID del rol
   * @param {string} requiredPermission - Permiso requerido para esta operación
   */
  async getPermisosByRol(rolId, requiredPermission = 'roles.view') {
    this.#checkPermission(requiredPermission);
    
    const request = await Static.apiServerRequest(`${this.#rolPermisosEndpoint}rol/${rolId}`, {
      method: "GET",
      headers: this.#getAuthHeaders(),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Asignar o actualizar permiso a un rol
   * @param {number} idRol - ID del rol
   * @param {number} idPermiso - ID del permiso
   * @param {boolean} activo - Estado del permiso
   * @param {string} requiredPermission - Permiso requerido para esta operación
   */
  async assignPermissionToRole(idRol, idPermiso, activo = true, requiredPermission = 'roles.manage') {
    this.#checkPermission(requiredPermission);
    
    const request = await Static.apiServerRequest(this.#rolPermisosEndpoint, {
      method: "POST",
      headers: this.#getAuthHeaders(),
      body: JSON.stringify({ idRol, idPermiso, activo }),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Remover permiso de un rol
   * @param {number} idRol - ID del rol
   * @param {number} idPermiso - ID del permiso
   * @param {string} requiredPermission - Permiso requerido para esta operación
   */
  async removePermissionFromRole(idRol, idPermiso, requiredPermission = 'roles.manage') {
    this.#checkPermission(requiredPermission);
    
    const request = await Static.apiServerRequest(`${this.#rolPermisosEndpoint}${idRol}/${idPermiso}`, {
      method: "DELETE",
      headers: this.#getAuthHeaders(),
    });
    
    return this.#handleResponse(request);
  }

  // ===== MÉTODOS DE CONVENIENCIA PARA EL FRONTEND =====

  /**
   * Verificar si el usuario puede realizar una acción específica en un evento
   * @param {Object} evento - Objeto del evento
   * @param {string} action - Acción a verificar ('view', 'edit', 'delete')
   * @returns {boolean}
   */
  canPerformEventAction(evento, action) {
    return Static.BM_CAN_PERFORM_EVENT_ACTION(evento, action);
  }

  /**
   * Obtener lista de acciones disponibles para un evento
   * @param {Object} evento - Objeto del evento
   * @returns {string[]} Array de acciones disponibles
   */
  getAvailableEventActions(evento) {
    const actions = [];
    
    if (this.canPerformEventAction(evento, 'view')) {
      actions.push('view');
    }
    if (this.canPerformEventAction(evento, 'edit')) {
      actions.push('edit');
    }
    if (this.canPerformEventAction(evento, 'delete')) {
      actions.push('delete');
    }
    
    return actions;
  }

  /**
   * Verificar si el usuario puede gestionar usuarios
   * @returns {boolean}
   */
  canManageUsers() {
    return this.hasAnyPermission(['users.manage', 'admin.all']);
  }

  /**
   * Verificar si el usuario puede gestionar roles
   * @returns {boolean}
   */
  canManageRoles() {
    return this.hasAnyPermission(['roles.manage', 'admin.all']);
  }

  /**
   * Obtener configuración de permisos para mostrar en la UI
   * @returns {Object} Configuración de permisos
   */
  getUIPermissions() {
    const userData = Static.BM_GET_USER_DATA();
    const sidebarData = Static.BM_GET_SIDEBAR_DATA();
    
    return {
      user: {
        ...sidebarData,
        permissions: this.getCurrentUserPermissions(),
        role: this.getCurrentUserRole()
      },
      calendar: this.getCalendarPermissions(),
      admin: {
        canManageUsers: this.canManageUsers(),
        canManageRoles: this.canManageRoles(),
        isAdmin: this.isAdmin()
      },
      navigation: {
        showAdminPanel: this.isAdmin(),
        showUserManagement: this.canManageUsers(),
        showRoleManagement: this.canManageRoles()
      }
    };
  }

  /**
   * Refrescar datos del usuario y permisos desde el servidor
   * Útil después de cambios de rol o permisos
   */
  async refreshUserPermissions() {
    const userData = Static.BM_GET_USER_DATA();
    if (!userData?.id) {
      throw new Error("Usuario no autenticado");
    }

    try {
      // Aquí harías una llamada al backend para obtener los datos actualizados del usuario
      // Esto dependería de tu endpoint de usuario
      const request = await Static.apiServerRequest(`${Static.BM_SITE.API_ENDPOINT}usuarios/${userData.id}`, {
        method: "GET",
        headers: this.#getAuthHeaders(),
      });
      
      const updatedUserData = await this.#handleResponse(request);
      
      // Actualizar localStorage con los nuevos datos
      localStorage.setItem(Static.DEFAULT_SESSION_VAR, JSON.stringify(updatedUserData));
      
      return updatedUserData;
    } catch (error) {
      console.error("Error al refrescar permisos del usuario:", error);
      throw error;
    }
  }

  // ===== MÉTODOS LEGACY PARA COMPATIBILIDAD =====

  /**
   * @deprecated Usar hasPermission() en su lugar
   */
  checkPermission(permission) {
    return this.hasPermission(permission);
  }

  /**
   * @deprecated Usar getCurrentUserPermissions() en su lugar
   */
  getUserPermissions() {
    return this.getCurrentUserPermissions();
  }
}

export default PermisoService;