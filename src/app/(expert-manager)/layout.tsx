import React from "react";

export default function ExpertManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-sm font-bold text-slate-900">
          Expert Manager Portal
        </h1>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
