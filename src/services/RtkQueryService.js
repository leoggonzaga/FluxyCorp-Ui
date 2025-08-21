import { createApi } from '@reduxjs/toolkit/query/react';
import BaseService from './BaseService';

const axiosBaseQuery = () => async ({ url, method, data, params }) => {
    try {
        const result = await BaseService({ url, method, data, params });
        return { data: result.data };
    } catch (error) {
        return {
            error: {
                status: error.response?.status,
                data: error.response?.data || error.message,
            },
        };
    }
};

const RtkQueryService = createApi({
    reducerPath: 'rtkApi',
    baseQuery: axiosBaseQuery(),
    endpoints: () => ({}),
});

export default RtkQueryService;
