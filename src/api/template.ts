import { getTokenState } from "../hooks/useAuths"


function GetHeader(){
    const {accessToken,refreshToken} = getTokenState()
    const header = {
        "Content-Type": 'application/json',
        Accept: 'application/json',
        Authorization : `Bearer ${accessToken??null}`,
        RefreshToken: refreshToken??null,
    }
    return header
}

// Base URL for the API
// This is used to define the base URL for the API calls
// It can be changed based on the environment (development, production, etc.)
const baseUrl = import.meta.env.VITE_API_AISEA_API_BASEURL+"/api"

export {GetHeader,baseUrl}

// This file is used to define the Headers and customize the header's values: adding Token if needed here cand call this header in other files
