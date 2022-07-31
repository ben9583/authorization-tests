interface User {
    id: number;
    username: string;
    hash: string;
    name: string;
    bio: string;
}

interface Token {
    id: number;
    name: string;
    iat: number;
    exp: number;
    iss: string;
}

export { User, Token }