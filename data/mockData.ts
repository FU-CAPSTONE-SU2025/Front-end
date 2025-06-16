export const mockUserActivity = [
  { date: '2025-06-01', student: 120, advisor: 10, manager: 5, staff: 15 },
  { date: '2025-06-02', student: 130, advisor: 12, manager: 4, staff: 18 },
  { date: '2025-06-03', student: 125, advisor: 11, manager: 6, staff: 16 },
  { date: '2025-06-04', student: 140, advisor: 13, manager: 5, staff: 20 },
  { date: '2025-06-05', student: 135, advisor: 10, manager: 7, staff: 17 },
  { date: '2025-06-06', student: 145, advisor: 14, manager: 4, staff: 19 },
  { date: '2025-06-07', student: 150, advisor: 12, manager: 5, staff: 21 },
  { date: '2025-06-08', student: 130, advisor: 11, manager: 6, staff: 18 },
  { date: '2025-06-09', student: 125, advisor: 10, manager: 5, staff: 16 },
  { date: '2025-06-10', student: 160, advisor: 15, manager: 8, staff: 22 },
];

export const mockApiLogs = [
  { id: 'log1', userId: 'SE123456', role: 'Student', apiType: 'GET /profile', timestamp: '2025-06-01 10:00:00' },
  { id: 'log2', userId: 'AD789012', role: 'Advisor', apiType: 'POST /schedule', timestamp: '2025-06-01 10:05:00' },
  { id: 'log3', userId: 'MG345678', role: 'Manager', apiType: 'PUT /user', timestamp: '2025-06-01 10:10:00' },
  { id: 'log4', userId: 'ST901234', role: 'Staff', apiType: 'GET /dashboard', timestamp: '2025-06-01 10:15:00' },
  { id: 'log5', userId: 'SE456789', role: 'Student', apiType: 'POST /submit', timestamp: '2025-06-02 09:00:00' },
  { id: 'log6', userId: 'AD012345', role: 'Advisor', apiType: 'GET /students', timestamp: '2025-06-02 09:30:00' },
  { id: 'log7', userId: 'MG678901', role: 'Manager', apiType: 'DELETE /user', timestamp: '2025-06-02 10:00:00' },
  { id: 'log8', userId: 'ST234567', role: 'Staff', apiType: 'GET /reports', timestamp: '2025-06-03 11:00:00' },
  { id: 'log9', userId: 'SE789012', role: 'Student', apiType: 'GET /grades', timestamp: '2025-06-03 12:00:00' },
  { id: 'log10', userId: 'AD345678', role: 'Advisor', apiType: 'POST /meeting', timestamp: '2025-06-03 12:30:00' },
];