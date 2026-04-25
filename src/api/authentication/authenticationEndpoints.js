export const userAPI_Auth_Login = '/Auth/login';

export const roleProfilesAPI_getAll                      = '/RoleProfile'
export const roleProfilesAPI_create                      = '/RoleProfile'
export const roleProfilesAPI_update          = (id)      => `/RoleProfile/${id}`
export const roleProfilesAPI_delete          = (id)      => `/RoleProfile/${id}`
export const roleProfilesAPI_getUserProfile  = (empId)   => `/RoleProfile/user/${empId}`
export const roleProfilesAPI_assignUserProfile = (empId) => `/RoleProfile/user/${empId}`