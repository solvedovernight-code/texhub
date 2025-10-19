export interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: number;
  path: string;
  gradient: string;
}

const MAX_ACTIVITIES = 10;
const STORAGE_KEY = 'user_activity_history';

const activityConfig: Record<string, { title: string; description: string; icon: string; gradient: string }> = {
  '/': {
    title: 'Visited Homepage',
    description: 'Viewed dashboard and quick actions',
    icon: 'Home',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  '/dyeing-calculator': {
    title: 'Used Dyeing Calculator',
    description: 'Calculated chemical quantities',
    icon: 'Beaker',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  '/proforma-invoice': {
    title: 'Generated Invoice',
    description: 'Created proforma invoice',
    icon: 'FileText',
    gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
  },
  '/inventory': {
    title: 'Managed Inventory',
    description: 'Viewed inventory items',
    icon: 'Package',
    gradient: 'bg-gradient-to-br from-teal-500 to-teal-600'
  },
  '/order-management': {
    title: 'Managed Orders',
    description: 'Viewed order pipeline',
    icon: 'ShoppingCart',
    gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600'
  },
  '/production-data': {
    title: 'Production Data',
    description: 'Recorded production data',
    icon: 'BarChart3',
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
  },
  '/settings': {
    title: 'Updated Settings',
    description: 'Modified application preferences',
    icon: 'Settings',
    gradient: 'bg-gradient-to-br from-green-500 to-emerald-600'
  },
  '/social-portal': {
    title: 'Visited Community',
    description: 'Explored community hub',
    icon: 'Users',
    gradient: 'bg-gradient-to-br from-teal-500 to-cyan-600'
  }
};

export const getActivityHistory = (): ActivityItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading activity history:', error);
    return [];
  }
};

export const addActivity = (path: string): void => {
  try {
    const config = activityConfig[path];
    if (!config) return;

    const activities = getActivityHistory();

    const lastActivity = activities[0];
    if (lastActivity && lastActivity.path === path) {
      const timeDiff = Date.now() - lastActivity.timestamp;
      if (timeDiff < 10000) {
        return;
      }
    }

    const newActivity: ActivityItem = {
      id: `${path}-${Date.now()}`,
      icon: config.icon,
      title: config.title,
      description: config.description,
      timestamp: Date.now(),
      path: path,
      gradient: config.gradient
    };

    const updatedActivities = [newActivity, ...activities].slice(0, MAX_ACTIVITIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedActivities));

    window.dispatchEvent(new Event('activityUpdate'));
  } catch (error) {
    console.error('Error adding activity:', error);
  }
};

export const clearActivityHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('activityUpdate'));
  } catch (error) {
    console.error('Error clearing activity history:', error);
  }
};

export const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};
