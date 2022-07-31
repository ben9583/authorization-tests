interface User {
    id: number;
    username: string;
    hash: string;
    profile: {
        name: string;
        bio: string;
    }
}

interface Token {
    id: number;
    name: string;
    iat: number;
    exp: number;
    iss: string;
}

export { User, Token }