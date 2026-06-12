"use client";
import AppShell from "@/components/layout/AppShell";
import ApiKeyList from "@/components/settings/ApiKeyList";
import MemoryEditor from "@/components/settings/MemoryEditor";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">
          <section>
            <h2 className="text-lg font-semibold mb-4">API Keys</h2>
            <p className="text-sm text-muted mb-6">
              Keys are stored locally in your database and never sent anywhere except the respective AI provider.
            </p>
            <ApiKeyList />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Memory</h2>
            <p className="text-sm text-muted mb-6">
              Active memory items are injected into every chat with Memory turned on. Double-click to edit.
            </p>
            <MemoryEditor />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
