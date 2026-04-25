import { loginAuthenticationApi } from '../apiBaseService';
import * as endpoints from './authenticationEndpoints'

export const authenticationUserLogin = async (param) => {
    return await loginAuthenticationApi.post(endpoints.userAPI_Auth_Login, param);
}

export const roleProfilesGetAll = () =>
    loginAuthenticationApi.get(endpoints.roleProfilesAPI_getAll)

export const roleProfilesCreate = (body) =>
    loginAuthenticationApi.post(endpoints.roleProfilesAPI_create, body)

export const roleProfilesUpdate = (publicId, body) =>
    loginAuthenticationApi.put(endpoints.roleProfilesAPI_update(publicId), body)

export const roleProfilesDelete = (publicId) =>
    loginAuthenticationApi.delete(endpoints.roleProfilesAPI_delete(publicId))

export const roleProfilesGetUserProfile = (employeePublicId) =>
    loginAuthenticationApi.get(endpoints.roleProfilesAPI_getUserProfile(employeePublicId))

export const roleProfilesAssignUserProfile = (employeePublicId, profileId) =>
    loginAuthenticationApi.put(endpoints.roleProfilesAPI_assignUserProfile(employeePublicId), { profileId })
