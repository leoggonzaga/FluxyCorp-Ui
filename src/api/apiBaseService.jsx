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
      toast.push(
        <Notification type="danger" title="Error">
            {
                error?.status == 422 && error.response?.data?.erros?.length > 0 
                ?
                <>
                    {error.response?.data?.erros?.[0]?.descricao || "Error"}
                </>

                :

                <>
                    Falha no processamento. Operação cancelada.
                </>
            }
        </Notification>
      )

      return null;
    }
  );

  return instance;
}

export const loginAuthenticationApi = createApi({
  baseURL: import.meta.env.VITE_AUTHENTICATION_URL,
  defaultHeaders: {
    Authorization: `Bearer ${import.meta.env.VITE_AUTHENTICATION_URL}`
  }
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
