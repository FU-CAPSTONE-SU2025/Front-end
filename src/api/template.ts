const header = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
   
}
const baseUrl = import.meta.env.VITE_API_AISEA_API_BASEURL+"/api"

export {header,baseUrl}

// This file is used to define the Headers and customize the header's values: adding Token if needed here cand call this header in other files
