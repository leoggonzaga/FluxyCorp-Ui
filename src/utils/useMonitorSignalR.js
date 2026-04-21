import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'

const ENTERPRISE_URL = import.meta.env.VITE_ENTERPRISE_URL ?? ''
const HUB_URL = `${ENTERPRISE_URL}/hubs/monitor`

function getToken() {
    try {
        return JSON.parse(JSON.parse(localStorage.getItem('admin') ?? '{}').auth).session.token ?? ''
    } catch {
        return ''
    }
}

export function useMonitorSignalR({ companyPublicId, onCallPatient, onUpdateSettings, enabled = true }) {
    const connectionRef = useRef(null)

    useEffect(() => {
        if (!enabled || !companyPublicId) return

        const token = getToken()
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, token ? { accessTokenFactory: () => token } : {})
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build()

        connection.on('CallPatient', (data) => {
            onCallPatient?.(data.patientName, data.room)
        })

        connection.on('UpdateSettings', (data) => {
            onUpdateSettings?.(data)
        })

        connection.start()
            .then(() => connection.invoke('JoinCompany', companyPublicId))
            .catch((err) => console.warn('[MonitorHub] connection failed:', err))

        connectionRef.current = connection

        return () => {
            connection.stop()
        }
    }, [enabled, companyPublicId])

    return connectionRef
}
