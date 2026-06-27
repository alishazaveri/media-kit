"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

export type UserSubscription = {
  planId: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtCycleEnd: boolean;
};

export type UserContextValue = {
  userId: string;
  email: string;
  username: string;
  profilePic: string | null;
  isLinkActive: boolean;
  subscription: UserSubscription | null;
  loading: boolean;
  refresh: () => void;
};

const UserContext = createContext<UserContextValue>({
  userId: "",
  email: "",
  username: "",
  profilePic: null,
  isLinkActive: false,
  subscription: null,
  loading: true,
  refresh: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Omit<UserContextValue, "loading" | "refresh">>({
    userId: "",
    email: "",
    username: "",
    profilePic: null,
    isLinkActive: false,
    subscription: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/me");
      setData(res.data);
    } catch {
      // unauthenticated or error — keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ ...data, loading, refresh: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
