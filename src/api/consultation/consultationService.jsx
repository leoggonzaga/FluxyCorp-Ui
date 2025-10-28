import { consultationTypeApi } from '../apiBaseService';
import * as endpoints from './consultationEndpoints'

export const consultationTypeApiGetTypes = async () => {
    return await consultationTypeApi.get(endpoints.consultationTypeAPI_types);
}