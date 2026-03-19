const API_BASE_URL = import.meta.env.VITE_API_BACKEND;

const getUserId = () => {
    try {
        const userString = localStorage.getItem('user');
        if (!userString) return null;
        
        const user = JSON.parse(userString);
        
        return user?.id || null;
    } catch (e) {
        return null;
    }
};

const fetchNotifications = async () => {
    const userId = getUserId();
    if (!userId) return [];

    const url = `${API_BASE_URL}/notifications/user/${userId}`;
    const response = await fetch(url);

    if (response.status === 401) return [];
    
    if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return response.json(); 
};

const markAsRead = async (notificationId) => {
    const userId = getUserId();
    if (!userId) return;

    try {
        const url = `${API_BASE_URL}/notifications/${notificationId}/read`;
        await fetch(url, { method: 'POST', });
    } catch (error) {
        console.error(`Error marking notification ${notificationId} as read:`, error);
    }
};

const markAllAsRead = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
        const url = `${API_BASE_URL}/notifications/user/${userId}/readAll`;
        await fetch(url, { method: 'POST', });
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
};

const clearNotifications = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
        const url = `${API_BASE_URL}/notifications/user/${userId}`;
        await fetch(url, { method: 'DELETE', });
    } catch (error) {
        console.error('Error clearing notifications:', error);
    }
};

const notificationApiService = {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
};

export default notificationApiService;