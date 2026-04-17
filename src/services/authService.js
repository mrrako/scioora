import { v4 as uuidv4 } from 'uuid';

const STORAGE_USERS_KEY = 'social-dash-users-v2';
const STORAGE_CURRENT_USER_KEY = 'social-dash-current-user-v2';

const DEMO_USERS = [
  {
    id: 'u-1',
    username: 'jane_doe',
    password: 'password123',
    name: 'Jane Doe',
    bio: 'Traveler & Photographer 📸 Exploring the world one city at a time.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    followers: ['u-2', 'u-3'],
    following: ['u-2', 'u-3'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'u-2',
    username: 'alex_johnson',
    password: 'password123',
    name: 'Alex Johnson',
    bio: 'Software Engineer @ TechCorp | Lover of code and coffee ☕',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    followers: ['u-1', 'u-3'],
    following: ['u-1', 'u-3'],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'u-3',
    username: 'maya_sky',
    password: 'password123',
    name: 'Maya Sky',
    bio: 'Digital Artist & Dreamer ✨ Creating universes in pixels.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    followers: ['u-1', 'u-2'],
    following: ['u-1', 'u-2'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const authService = {
  getUsers: () => {
    const users = localStorage.getItem(STORAGE_USERS_KEY);
    if (!users) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEMO_USERS));
      return DEMO_USERS;
    }
    return JSON.parse(users);
  },

  getCurrentUser: () => {
    const user = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  login: (username, password) => {
    const users = authService.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: 'Invalid username or password' };
  },

  signup: (userData) => {
    const users = authService.getUsers();
    if (users.find(u => u.username === userData.username)) {
      return { success: false, message: 'Username already exists' };
    }

    const newUser = {
      id: uuidv4(),
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${userData.username}&background=random`,
      bio: '',
      ...userData,
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  logout: () => {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  },

  updateUser: (userId, updates) => {
    const users = authService.getUsers();
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
    
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify({ ...currentUser, ...updates }));
    }
  }
};
