import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Check, Edit2, Loader2, LogOut, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { UserProfile } from "../types/chat";
import { InitialsAvatar } from "./InitialsAvatar";

interface ProfilePanelProps {
  currentUser: UserProfile;
  onUpdateDisplayName: (name: string) => Promise<void>;
  onLogout: () => void;
}

export function ProfilePanel({
  currentUser,
  onUpdateDisplayName,
  onLogout,
}: ProfilePanelProps) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(currentUser.displayName);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    if (!newName.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onUpdateDisplayName(newName.trim());
      setEditing(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setNewName(currentUser.displayName);
    setEditing(false);
    setSaveError(null);
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 flex flex-col items-center"
        >
          {/* Avatar */}
          <div className="relative mb-4">
            <InitialsAvatar
              username={currentUser.username}
              displayName={currentUser.displayName}
              size="xl"
              className="shadow-panel-lg"
            />
          </div>

          {/* Display name */}
          <div className="w-full max-w-xs text-center mb-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") handleCancel();
                  }}
                  className="text-center font-semibold text-lg"
                  autoFocus
                  disabled={saving}
                  data-ocid="profile.displayname_input"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !newName.trim()}
                  className="w-8 h-8 rounded-full bg-chat-green text-white flex items-center justify-center shrink-0 hover:bg-chat-green-dark transition-colors disabled:opacity-50"
                  data-ocid="profile.save_button"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 hover:bg-border transition-colors"
                  data-ocid="profile.cancel_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {currentUser.displayName}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setNewName(currentUser.displayName);
                    setEditing(true);
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Edit display name"
                  data-ocid="profile.edit_button"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          {saveError && (
            <p
              className="text-xs text-destructive mt-1"
              data-ocid="profile.error_state"
            >
              {saveError}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            @{currentUser.username}
          </p>
        </motion.div>

        <Separator />

        {/* Info section */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Account Info
          </h3>
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Display Name</p>
              <p className="text-sm font-medium text-foreground">
                {currentUser.displayName}
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Username</p>
              <p className="text-sm font-medium text-foreground">
                @{currentUser.username}
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Member since</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(
                  Number(currentUser.createdAt) / 1_000_000,
                ).toLocaleDateString([], {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Logout */}
        <div className="p-6">
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={onLogout}
            data-ocid="profile.logout.button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
