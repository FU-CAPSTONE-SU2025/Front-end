const header = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
}
const baseUrl = import.meta.env.VITE_API_MOCKAPI_BASEURL

export {header,baseUrl}

// This file is used to define the Headers and customize the header's values: adding Token if needed here cand call this header in other files
