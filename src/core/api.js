import ApiUrls from "./presets/apiUrls";

class ApiManager {
    constructor() {
        this.cache = new Map();
    }
    init() {
        
    }
    async request(objConfig = "hordes.default.account", data) {
        objConfig = objConfig.split(".")
        const scopeKey = objConfig[0]
        const baseUrlKey = objConfig[1]
        const endpoint = objConfig[2]

        const baseConfig = ApiUrls[scopeKey][baseUrlKey];

        if (!baseConfig) {
            throw new Error(`Base URL key '${baseUrlKey}' not found in ApiUrls`);
        }

        const apiConfig = baseConfig.endpoints[endpoint];

        if (!apiConfig) {
            throw new Error(`Endpoint '${endpoint}' not found in ApiUrls[${scopeKey}][${baseUrlKey}]`);
        }

        const cacheKey = this.generateCacheKey(endpoint, data, baseUrlKey);

        // Check if the response is already in the cache and not expired
        const cachedEntry = this.cache.get(cacheKey);
        if (cachedEntry && Date.now() - cachedEntry.timestamp < cachedEntry.ttl) {
            // console.log(`Cache hit for ${cacheKey}`);
            return cachedEntry.data;
        }

        const baseUrl = baseConfig.baseUrl;
        const url = `${baseUrl}/${apiConfig.endpoint}`;
        const requestOptions = {
            method: apiConfig.method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (apiConfig.method === 'GET') {
            // If it's a GET request, append data as query parameters
            const queryString = Object.entries(data)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');

            if (queryString) {
                requestOptions.url += `?${queryString}`;
            }
        } else {
            // For other methods, check if there are body parameters to be included
            const bodyParams = {};

            if (apiConfig.bodyParams) {
                apiConfig.bodyParams.forEach(param => {
                    if (data[param] !== undefined) {
                        bodyParams[param] = data[param];
                    }
                });
            }

            if (apiConfig.sendTtl) {
                // Include TTL in the request payload
                bodyParams.ttl = apiConfig.ttl || 0; // Set a default TTL if not provided
            }

            if (Object.keys(bodyParams).length > 0) {
                requestOptions.body = JSON.stringify(bodyParams);
            }
        }

        // console.log(url, "from apiManager")
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}. Status: ${response.status}`);
        }

        const responseData = await response.json();

        // Store the response in the cache with a timestamp and TTL
        this.cache.set(cacheKey, { data: responseData, timestamp: Date.now(), ttl: apiConfig.ttl });

        return responseData;
    }

    generateCacheKey(endpoint, data, baseUrlKey) {
        return `${baseUrlKey}:${endpoint}:${JSON.stringify(data)}`;
    }
}

// Example usage:
const apiManager = new ApiManager()

export default apiManager