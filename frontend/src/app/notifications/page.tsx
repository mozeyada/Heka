"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";

import { InAppNotification, notificationsAPI } from "@/lib/api";
import { useNotificationsStore } from "@/store/notificationsStore";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const router = useRouter();
  const { syncFromFeed, markNotificationRead, markAllNotificationsRead } = useNotificationsStore();
  const [items, setItems] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsAPI.getFeed(50, 0);
      setItems(data.items || []);
      syncFromFeed(data.items || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [syncFromFeed]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleOpen = async (item: InAppNotification) => {
    try {
      if (!item.is_read) {
        await notificationsAPI.markRead(item.id);
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, is_read: true, read_at: new Date().toISOString() } : entry,
          ),
        );
        markNotificationRead();
      }
    } catch {
      // Do not block navigation on read failures.
    }

    if (item.action_path) {
      router.push(item.action_path);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await notificationsAPI.markAllRead();
      setItems((current) =>
        current.map((entry) => ({ ...entry, is_read: true, read_at: entry.read_at || new Date().toISOString() })),
      );
      markAllNotificationsRead();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to mark notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = items.filter((item) => !item.is_read).length;

  return (
    <div className="min-h-screen pb-32 text-zinc-300">
      <div className="app-container py-10 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Relationship Signals</p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight text-white">Notifications</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Partner actions that need attention, context, or a response. Low-detail by design, so the sensitive part stays inside the app.
            </p>
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
            className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markingAll ? "Marking..." : unreadCount > 0 ? `Mark All Read (${unreadCount})` : "All caught up"}
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm font-semibold text-red-300">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <Bell className="h-6 w-6 text-zinc-400" />
            </div>
            <h2 className="mt-6 text-lg font-medium text-white">No notifications yet</h2>
            <p className="mt-2 text-sm text-zinc-500">
              When your partner steps away from an issue or goal, or other shared events are added later, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleOpen(item)}
                className={`group flex w-full items-start gap-4 rounded-3xl border p-5 text-left backdrop-blur-xl transition ${
                  item.is_read
                    ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                    : "border-indigo-500/20 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.1]"
                }`}
              >
                <div
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    item.is_read ? "bg-zinc-600" : "bg-indigo-400"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    {!item.is_read && (
                      <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.body}</p>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
                    {formatTimestamp(item.created_at)}
                  </p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600 transition group-hover:text-white" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
