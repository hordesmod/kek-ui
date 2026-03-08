const ApiUrls = {
    "hordes": {
        'default': {
            baseUrl: '',
            endpoints: {
                'account': {
                    method: 'GET',
                    endpoint: 'account/info',
                    // bodyParams: ['ttl'], // Include TTL as a body parameter
                }
            }
        },
        "item": {
            baseUrl: "https://hordes.io/api",
            endpoints: {
                "get": {
                    method: "POST",
                    endpoint: "item/get",
                    bodyParams: ["ids"],
                    ttl: 3600000,
                },
                "getnew": {
                    method: "POST",
                    endpoint: "item/getPlayerEquipped",
                    bodyParams: ["ids", "pid"],
                    ttl: 3600000
                }
            },
        },
        "player": {
            baseUrl: "https://hordes.io/api",
            endpoints: {
                "get": {
                    method: "POST",
                    endpoint: "playerinfo/search",
                    bodyParams: ["name", "order", "limit", "offset"]
                }
            }
        }
    },
    "kek": {
        "friend": {
            baseUrl: 'https://hordes-friends-api.vercel.app',
            endpoints: {
                "status": {
                    method: "POST",
                    endpoint: "status",
                    bodyParams: ["player_name", "status_flag"]
                },
                "get": {
                    method: "POST",
                    endpoint: "friends",
                    bodyParams: ["player_name"]
                },
                "add": {
                    method: "POST",
                    endpoint: "add_friend",
                    bodyParams: ["player_name", "friend_name"]
                },
                "remove": {
                    method: "POST",
                    endpoint: "remove_friend",
                    bodyParams: ["player_name", "friend_name"]
                }
            }
        },
        "gloom": {
            baseUrl: "https://fasthordesapimongo.onrender.com",
            endpoints: {
                "personal": {
                    method: "POST",
                    endpoint: "info",
                    bodyParams: ["player_name"]
                },
                "ranking": {
                    method: "POST",
                    endpoint: "rankings",
                    bodyParams: ["player_name", "required_arg", "optional_args"]
                }
            }
        },
        "tierlist": {
            baseUrl: "https://hordes-tierlist-api.vercel.app",
            endpoints: {
                "rank": {
                    method: "POST",
                    endpoint: "rank",
                    bodyParams: ["classid", "build_score"],
                    ttl: 3600000
                }
            }
        }
    }
};

export default ApiUrls