import { monitorCallPatient } from '@/api/enterprise/EnterpriseService'

const CHANNEL = 'fluxy_monitor'

export async function callPatientOnMonitor(patientName, room) {
    // BroadcastChannel — mesma aba/browser (instantâneo)
    try {
        const bc = new BroadcastChannel(CHANNEL)
        bc.postMessage({ type: 'CALL_PATIENT', payload: { patientName, room } })
        bc.close()
    } catch {}

    // API → SignalR hub — cross-device (TV em outro computador)
    // O interceptor Axios retorna null em erro, não rejeita — por isso sem try/catch
    await monitorCallPatient(patientName, room)
}
