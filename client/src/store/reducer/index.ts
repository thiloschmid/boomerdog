export const initialState = {
    isLoggedIn: localStorage.getItem("isLoggedIn")
        ? JSON.parse(localStorage.getItem("isLoggedIn") || "")
        : false,
    user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "")
        : null,
    client_id: process.env.REACT_APP_CLIENT_ID,
    redirect_uri: process.env.REACT_APP_REDIRECT_URI,
    client_secret: process.env.REACT_APP_CLIENT_SECRET,
    proxy_url: process.env.REACT_APP_PROXY_URL,
};

export interface AuthReducerAction {
    type: "LOGIN" | "LOGOUT";
    payload: any;
}

export const reducer = (state: typeof initialState, action: AuthReducerAction) => {
    switch (action.type) {
        case "LOGIN": {
            localStorage.setItem(
                "isLoggedIn",
                JSON.stringify(action.payload.isLoggedIn)
            );
            localStorage.setItem("user", JSON.stringify(action.payload.user));
            return {
                ...state,
                isLoggedIn: action.payload.isLoggedIn,
                user: action.payload.user,
            };
        }
        case "LOGOUT": {
            localStorage.clear();
            return {
                ...state,
                isLoggedIn: false,
                user: null,
            };
        }
        default:
            return state;
    }
};
