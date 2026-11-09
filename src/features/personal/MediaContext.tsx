import { createContext, useContext, type ReactNode } from 'react';
import { coverStore, type CoverStorage } from './images';
const Context = createContext<CoverStorage>(coverStore);
export function MediaProvider({
  storage,
  children,
}: {
  storage: CoverStorage;
  children: ReactNode;
}) {
  return <Context.Provider value={storage}>{children}</Context.Provider>;
}
export const useMedia = () => useContext(Context);
