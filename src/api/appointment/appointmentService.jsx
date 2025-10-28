import { appointmentApi } from '../apiBaseService';
import * as endpoints from './appointmentEndpoints'

export const appointmentApiGetEventsByRange = async (dateStart, dateEnd) => {
    return await appointmentApi.get(endpoints.appointmentAPI_range + `?start=${dateStart}&end=${dateEnd}`);
}