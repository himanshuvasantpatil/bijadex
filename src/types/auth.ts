export type UserRole = 'owner' | 'admin' | 'manager' | 'cashier';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  pin: string; // 4-6 digit POS login PIN
  role: UserRole;
  storeIds: string[]; // Stores this user is authorized to access
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Himanshu V. Patil',
    email: 'himanshuvasantpatil@gmail.com',
    pin: '123456',
    role: 'owner',
    storeIds: ['store-1', 'store-2', 'store-3'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-2',
    name: 'Alex Chen',
    email: 'alex.chen@bijasa.com',
    pin: '1122',
    role: 'manager',
    storeIds: ['store-1'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-3',
    name: 'Sarah Miller',
    email: 'sarah.miller@bijasa.com',
    pin: '3344',
    role: 'cashier',
    storeIds: ['store-1'],
    isActive: true,
    createdAt: new Date().toISOString()
  }
];
