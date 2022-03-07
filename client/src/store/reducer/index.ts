export interface UserData {
    id: number;
    avatar_url: string;
    name: string;
}

export interface UserState {
    authToken: string | null;
    isLoggedIn: boolean;
    user: UserData | null;
    client_id?: string;
    redirect_uri?: string;
}

const tryToReadLocalStorage = (item: string) => {
    try {
        const entry = localStorage.getItem(item);
        const data = entry && JSON.parse(entry);
        return data;
    } catch (e) {
        console.error(`Error reading ${item} from local storage`);
        return null;
    }
};

export const initialState: UserState = {
    authToken: tryToReadLocalStorage("authToken"),
    isLoggedIn: !!tryToReadLocalStorage("isLoggedIn"),
    user: tryToReadLocalStorage("user"),
    client_id: process.env.REACT_APP_CLIENT_ID,
    redirect_uri: process.env.REACT_APP_REDIRECT_URI,
    // client_secret: process.env.REACT_APP_CLIENT_SECRET,
    // proxy_url: process.env.REACT_APP_PROXY_URL,
};

export type AuthReducerAction =
    | { type: "LOGIN"; payload: any }
    | { type: "LOGOUT" };

export const reducer = (
    state: UserState,
    action: AuthReducerAction
): UserState => {
    switch (action.type) {
        case "LOGIN": {
            localStorage.setItem(
                "authToken",
                JSON.stringify(action.payload.authToken)
            );
            localStorage.setItem(
                "isLoggedIn",
                JSON.stringify(action.payload.isLoggedIn)
            );
            localStorage.setItem("user", JSON.stringify(action.payload.user));
            return {
                ...state,
                authToken: action.payload.authToken,
                isLoggedIn: action.payload.isLoggedIn,
                user: action.payload.user,
            };
        }
        case "LOGOUT": {
            localStorage.clear();
            return {
                ...state,
                authToken: null,
                isLoggedIn: false,
                user: null,
            };
        }
        default:
            return state;
    }
};
