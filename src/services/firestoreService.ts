import type { SessionRecord, UserProfile } from '@/types';
import { RECENT_SESSIONS } from '@/data/mockData';

function key(uid: string) {
  return `fitpose_profile_${uid}`;
}

function sessionsKey(uid: string) {
  return `fitpose_sessions_${uid}`;
}

export const db = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    await delay();
    const raw = localStorage.getItem(key(uid));
    return raw ? JSON.parse(raw) : null;
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    await delay();
    localStorage.setItem(key(profile.uid), JSON.stringify(profile));
  },

  async getSessions(uid: string): Promise<SessionRecord[]> {
    await delay();
    const raw = localStorage.getItem(sessionsKey(uid));
    if (raw) return JSON.parse(raw);
    return RECENT_SESSIONS;
  },

  async addSession(uid: string, session: SessionRecord): Promise<void> {
    await delay();
    const all = await this.getSessions(uid);
    const updated = [session, ...all].slice(0, 50);
    localStorage.setItem(sessionsKey(uid), JSON.stringify(updated));
  },
};

function delay() {
  return new Promise((r) => setTimeout(r, 250));
}
