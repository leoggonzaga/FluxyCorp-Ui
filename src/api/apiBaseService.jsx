import axios from "axios";
import { Notification, toast } from "../components/ui";

function createApi({ baseURL, defaultHeaders = {} }) {
  const instance = axios.create({
    baseURL,
    headers: defaultHeaders
  });

  instance.interceptors.request.use((config) => {
    const admin = localStorage.getItem("admin");
    if (admin) {
      try {
        const token = JSON.parse(JSON.parse(admin).auth).session.token;
        config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
      } 
      catch {}
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
      const status  = error.response?.status
      const data    = error.response?.data

      let type    = 'danger'
      let title   = 'Erro'
      let message = 'Falha no processamento. Operação cancelada.'

      if (status === 422 && data?.erros?.length > 0) {
        type    = 'warning'
        title   = 'Dados inválidos'
        message = data.erros[0].descricao
      } else if (status === 400) {
        type    = 'warning'
        title   = 'Dados inválidos'
        message = data?.message || 'Requisição inválida.'
      } else if (status === 404) {
        type    = 'warning'
        title   = 'Não encontrado'
        message = data?.message || 'Recurso não encontrado.'
      } else if (status === 409) {
        type    = 'warning'
        title   = 'Operação não permitida'
        message = data?.message || 'Conflito ao processar a operação.'
      } else if (status === 401 || status === 403) {
        type    = 'warning'
        title   = 'Acesso negado'
        message = data?.message || 'Você não tem permissão para esta ação.'
      } else if (data?.message) {
        message = data.message
      }

      toast.push(
        <Notification type={type} title={title}>
          {message}
        </Notification>
      )

      return null;
    }
  );

  return instance;
}

export const loginAuthenticationApi = createApi({
  baseURL: import.meta.env.VITE_AUTHENTICATION_URL
});

export const enterpriseApi = createApi({
  baseURL: import.meta.env.VITE_ENTERPRISE_URL
});

export const catalogApi = createApi({
  baseURL: import.meta.env.VITE_CATALOG_URL
});

export const appointmentApi = createApi({
  baseURL: import.meta.env.VITE_APPOINTMENT_URL
});

export const consultationTypeApi = createApi({
  baseURL: import.meta.env.VITE_CONSULTATION_TYPE_URL
});

export const prosthesisApi = createApi({
  baseURL: import.meta.env.VITE_PROSTHESIS_URL
});

export const inventoryApi = createApi({
  baseURL: import.meta.env.VITE_INVENTORY_URL
});

export const consumerApi = createApi({
  baseURL: import.meta.env.VITE_CONSUMER_URL
});

export const billingApi = createApi({
  baseURL: import.meta.env.VITE_BILLING_URL
});

export const reportsApi = createApi({
  baseURL: import.meta.env.VITE_REPORTS_URL
});
