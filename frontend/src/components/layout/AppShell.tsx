"use client";
import { ReactNode } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-surface text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
