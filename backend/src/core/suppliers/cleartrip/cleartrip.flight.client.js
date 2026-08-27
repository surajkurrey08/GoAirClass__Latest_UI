const axios = require('axios');

axios.interceptors.request.use((config) => {
    try {
        if (config.url && config.url.includes('cleartrip.com')) {
            const daId = process.env.CLEARTRIP_HOTEL_DA_ID;
            if (daId) {
                config.headers = config.headers || {};
                if (typeof config.headers.set === 'function') {
                    config.headers.set('X-CT-DA-ID', daId);
                } else {
                    config.headers['X-CT-DA-ID'] = daId;
                }
            }
        }
    } catch (err) {
        console.error('[Axios Request Interceptor Error]:', err.message);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

let cachedToken = null;
let cachedRefreshToken = null;
let tokenExpiryTime = null;

async function getCleartripToken() {
    const baseUrl = process.env.CLEARTRIP_FLIGHT_BASE_URL;
    const email = process.env.CLEARTRIP_FLIGHT_EMAIL;
    const password = process.env.CLEARTRIP_FLIGHT_PASSWORD;
    const tenantId = process.env.CLEARTRIP_FLIGHT_TENANT_ID;

    if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime - 5 * 60 * 1000) {
        console.log('[Cleartrip Auth] Using cached token');
        return cachedToken;
    }

    if (cachedRefreshToken) {
        try {
            console.log('[Cleartrip Auth] Token expired or missing. Attempting to refresh token...');
            const domain = baseUrl ? baseUrl.replace('/air/api/v4', '').replace('/air/api/v5', '').replace('/air/api/v6', '') : 'https://qa-air-b2b.cleartrip.com';
            const refreshUrl = `${domain}/air/api/v4/refresh`;

            const refreshResponse = await axios.post(refreshUrl, {
                refreshToken: cachedRefreshToken
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 20000
            });

            if (refreshResponse.data && refreshResponse.data.token) {
                cachedToken = refreshResponse.data.token;
                if (refreshResponse.data.refreshToken) {
                    cachedRefreshToken = refreshResponse.data.refreshToken;
                }

                try {
                    const payloadBase64 = cachedToken.split('.')[1];
                    const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
                    if (decodedPayload.exp && decodedPayload.iat) {
                        const lifetime = (decodedPayload.exp - decodedPayload.iat) * 1000;
                        tokenExpiryTime = Date.now() + lifetime;
                        console.log('[Cleartrip Auth] Refreshed token successfully. Expiry (adjusted for clock-skew):', new Date(tokenExpiryTime).toLocaleString());
                    } else if (decodedPayload.exp) {
                        tokenExpiryTime = decodedPayload.exp * 1000;
                        console.log('[Cleartrip Auth] Refreshed token successfully. Expiry (unadjusted):', new Date(tokenExpiryTime).toLocaleString());
                    } else {
                        tokenExpiryTime = Date.now() + 23 * 60 * 60 * 1000;
                    }
                } catch (e) {
                    tokenExpiryTime = Date.now() + 23 * 60 * 60 * 1000;
                }

                return cachedToken;
            }
        } catch (refreshErr) {
            console.warn('[Cleartrip Auth] Token refresh failed, falling back to full login:', refreshErr.response ? refreshErr.response.data : refreshErr.message);
        }
    }

    console.log('[Cleartrip Auth] Performing full Login to Cleartrip B2B API...');
    const loginPayload = { email, password, tenantId };
    const loginResponse = await axios.post(`${baseUrl}/login`, loginPayload, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        timeout: 30000
    });

    const token = loginResponse.data.token ||
        loginResponse.data.accessToken ||
        loginResponse.data.idToken ||
        (loginResponse.data.data && (loginResponse.data.data.token || loginResponse.data.data.accessToken || loginResponse.data.data.idToken));

    const refreshToken = loginResponse.data.refreshToken ||
        (loginResponse.data.data && loginResponse.data.data.refreshToken);

    if (!token) {
        throw new Error('Failed to retrieve Bearer token from login API');
    }

    cachedToken = token;
    if (refreshToken) {
        cachedRefreshToken = refreshToken;
    }

    try {
        const payloadBase64 = cachedToken.split('.')[1];
        const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
        if (decodedPayload.exp && decodedPayload.iat) {
            const lifetime = (decodedPayload.exp - decodedPayload.iat) * 1000;
            tokenExpiryTime = Date.now() + lifetime;
            console.log('[Cleartrip Auth] Full Login successful. Expiry (adjusted for clock-skew):', new Date(tokenExpiryTime).toLocaleString());
        } else if (decodedPayload.exp) {
            tokenExpiryTime = decodedPayload.exp * 1000;
            console.log('[Cleartrip Auth] Full Login successful. Expiry (unadjusted):', new Date(tokenExpiryTime).toLocaleString());
        } else {
            tokenExpiryTime = Date.now() + 23 * 60 * 60 * 1000;
        }
    } catch (e) {
        tokenExpiryTime = Date.now() + 23 * 60 * 60 * 1000;
    }

    return cachedToken;
}

module.exports = {
    axios,
    getCleartripToken
};
