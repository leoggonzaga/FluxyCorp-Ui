import { appointmentApi } from '../apiBaseService';
import * as endpoints from './appointmentEndpoints'

export const appointmentApiGetEventsByRange = async (dateStart, dateEnd) => {
    return await appointmentApi.get(endpoints.appointmentAPI_range + `?start=${dateStart}&end=${dateEnd}`);
}

export const getAppointmentsByPatient = async (patientId) => {
    // Buscar agendamentos dos próximos 30 dias para o paciente
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30);
    
    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const response = await appointmentApi.get(endpoints.appointmentAPI_range + `?start=${startDateStr}&end=${endDateStr}`);
    
    // Filtrar apenas agendamentos do paciente específico
    if (response.data && Array.isArray(response.data)) {
        return {
            data: response.data.filter(apt => apt.consumerPublicId === patientId)
        };
    }
    
    return { data: [] };
}