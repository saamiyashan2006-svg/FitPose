import type { UserProfile } from '@/types';
import { DEFAULT_PROFILE } from '@/data/mockData';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

type Listener = (user: AuthUser | null) => void;

const USERS_KEY = 'fitpose_users';
const SESSION_KEY = 'fitpose_session';

interface StoredUser extends AuthUser {
  password: string;
}

function readUsers(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, StoredUser>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function setSession(user: AuthUser | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

const listeners = new Set<Listener>();

function notify(user: AuthUser | null) {
  listeners.forEach((l) => l(user));
}

function makeUid() {
  return 'u_' + Math.random().toString(36).slice(2, 11);
}

function avatarFor(name: string) {
  const seed = encodeURIComponent(name || 'FitPose');
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

export const auth = {
  get currentUser(): AuthUser | null {
    return getSession();
  },

  async signUp(name: string, email: string, password: string): Promise<AuthUser> {
    await delay();
    const users = readUsers();
    const key = email.toLowerCase();
    if (users[key]) throw new Error('An account with this email already exists.');
    const user: StoredUser = {
      uid: makeUid(),
      email: key,
      displayName: name,
      photoURL: avatarFor(name),
      password,
    };
    users[key] = user;
    writeUsers(users);
    const publicUser = toPublic(user);
    setSession(publicUser);
    notify(publicUser);
    await createDefaultProfile(publicUser);
    return publicUser;
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    await delay();
    const users = readUsers();
    const key = email.toLowerCase();
    const user = users[key];
    if (!user || user.password !== password) throw new Error('Invalid email or password.');
    const publicUser = toPublic(user);
    setSession(publicUser);
    notify(publicUser);
    return publicUser;
  },

  async signInWithGoogle(): Promise<AuthUser> {
    await delay();
    const email = 'guest.google@gmail.com';
    const users = readUsers();
    if (!users[email]) {
      users[email] = {
        uid: makeUid(),
        email,
        displayName: 'Google User',
        photoURL: avatarFor('Google User'),
        password: '__google__',
      };
      writeUsers(users);
      await createDefaultProfile(toPublic(users[email]));
    }
    const publicUser = toPublic(users[email]);
    setSession(publicUser);
    notify(publicUser);
    return publicUser;
  },

  async sendPasswordReset(email: string): Promise<void> {
    await delay();
    const users = readUsers();
    if (!users[email.toLowerCase()]) throw new Error('No account found with this email.');
  },

  async signOut(): Promise<void> {
    setSession(null);
    notify(null);
  },

  onAuthStateChanged(listener: Listener): () => void {
    listeners.add(listener);
    listener(getSession());
    return () => listeners.delete(listener);
  },
};

function toPublic(u: StoredUser): AuthUser {
  return { uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL };
}

function delay() {
  return new Promise((r) => setTimeout(r, 650));
}

async function createDefaultProfile(user: AuthUser) {
  const profile: UserProfile = {
    ...DEFAULT_PROFILE,
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    createdAt: Date.now(),
  };
  localStorage.setItem(`fitpose_profile_${user.uid}`, JSON.stringify(profile));
}
