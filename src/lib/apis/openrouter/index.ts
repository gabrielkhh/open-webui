import { OPEN_ROUTER_API_BASE_URL } from '$lib/constants';

export const getOpenRouterCredits = async (token: string = '') => {
    let error = null;

    const res = await fetch(`${OPEN_ROUTER_API_BASE_URL}/credits`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(token && { authorization: `Bearer ${token}` })
        }
    })
        .then(async (res) => {
            if (!res.ok) throw await res.json();
            return res.json();
        })
        .catch((err) => {
            console.log(err);
            if ('detail' in err) {
                error = err.detail;
            } else {
                error = 'Failed to fetch OpenRouter credits balance';
            }
            return null;
        });

    if (error) {
        throw error;
    }

    return res;
}