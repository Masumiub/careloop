"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "careloop.me";

/**
 * Demo-session hook: remembers which participant is "signed in" so the
 * participant-facing pages feel like a real account without auth plumbing.
 */
export function useMe() {
  const [me, setMeState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setMeState(window.localStorage.getItem(KEY));
    } catch {
      setMeState(null);
    }
    setReady(true);
  }, []);

  const setMe = useCallback((id: string | null) => {
    setMeState(id);
    try {
      if (id) window.localStorage.setItem(KEY, id);
      else window.localStorage.removeItem(KEY);
    } catch {
      // storage unavailable
    }
  }, []);

  return { me, setMe, ready };
}
