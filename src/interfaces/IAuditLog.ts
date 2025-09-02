export interface AuditLog{
    id: number;
    tag: string;
    isSuccessAction: boolean;
    createdAt: string;
    userName: string;
    userAgent: string;
}
export interface GetAnalyticsAuditLogProps{
    timeSeries: timeSeriesPeriod[];
    topActiveUsers: topActiveUsers[];
    totalLogs: number;
    successRate: number;
}

interface topActiveUsers {
    userId: number;
    userName: string;
    firstName: string;
    lastName: string;
    logCount: number;
}

interface timeSeriesPeriod {
period: string;
totalLogs: number;
logsByTag: { [key: string]: number };
successRate: number;
}

