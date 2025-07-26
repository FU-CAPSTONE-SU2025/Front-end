export interface AuditLog{
    id: number,
    tag: string,
    description: string | null,
    createdAt: string
}
export interface GetAllAuditLogProps{

}

type CREATE_USER = {
    id: 33,
    tag: "CREATE_USER",
    description: null,
    createdAt: "2025-07-06T09:32:11.7523607"
}

type FEID_LOGIN = {
    id: 202,
    tag: "FEID_LOGIN",
    description: null,
    createdAt: "2025-07-11T13:23:38.6861371"
}

type GOOGLE_LOGIN = {
    id: 208,
    tag: "GOOGLE_LOGIN",
    description: null,
    createdAt: "2025-07-11T14:41:01.7367116"
}

type REMOVE_CHATSESSION = {
    id: 5,
    tag: "REMOVE_CHATSESSION",
    description: "Removed expired advisory session with ID: 58",
    createdAt: "2025-07-06T09:25:39.0496646"
}

type REMOVE_NOTI = {
    id: 18,
    tag: "REMOVE_NOTI",
    description: "Removed expired notification with ID: 3",
    createdAt: "2025-07-06T09:25:39.049846"
}