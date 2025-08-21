import { loginAuthenticationApi } from '../apiBaseService';
import * as endpoints from './authenticationEndpoints'

export const authenticationUserLogin = async (param) => {
    try {
        const result = await loginAuthenticationApi.post(endpoints.userAPI_Auth_Login, param)
        return result;
    }
    catch (err) {
        console.log(err?.message)
        return err?.response?.data
    }

}
