import { loginAuthenticationApi } from '../apiBaseService';
import * as endpoints from './authenticationEndpoints'

export const authenticationUserLogin = async (param) => {
    return await loginAuthenticationApi.post(endpoints.userAPI_Auth_Login, param);
}
