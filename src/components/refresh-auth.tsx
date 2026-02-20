"use client";

import { useEffect } from "react";

export const RefreshAuth = () => {
  useEffect(() => {
    window.location.reload();
  }, []);
  return null;
};