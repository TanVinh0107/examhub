import { atom } from "jotai";

export const authAtom = atom<{ user: any | null }>({ user: null });
