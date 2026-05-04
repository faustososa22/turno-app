import api from "./api";

export const getTimezone = async (): Promise<string> => {
    const response = await api.get('/config/timezone')
    return response.data;
}