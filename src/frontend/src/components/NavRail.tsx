import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut, MessageSquare, User, Users } from "lucide-react";
import { motion } from "motion/react";
import type { UserProfile } from "../types/chat";
import type { NavTab } from "../types/chat";
import { InitialsAvatar } from "./InitialsAvatar";

interface NavRailProps {
  currentUser: UserProfile;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onLogout: () => void;
}

const NAV_ITEMS: {
  tab: NavTab;
  icon: React.ReactNode;
  label: string;
  ocid: string;
}[] = [
  {
    tab: "chats",
    icon: <MessageSquare className="w-5 h-5" />,
    label: "Chats",
    ocid: "nav.chats.tab",
  },
  {
    tab: "contacts",
    icon: <Users className="w-5 h-5" />,
    label: "Contacts",
    ocid: "nav.contacts.tab",
  },
  {
    tab: "profile",
    icon: <User className="w-5 h-5" />,
    label: "Profile",
    ocid: "nav.profile.tab",
  },
];

export function NavRail({
  currentUser,
  activeTab,
  onTabChange,
  onLogout,
}: NavRailProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <nav
        className="hidden lg:flex flex-col items-center w-[72px] bg-chat-green shrink-0 py-4 gap-1"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="mb-4 flex items-center justify-center">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 flex flex-col items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Tooltip key={item.tab}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onTabChange(item.tab)}
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    activeTab === item.tab
                      ? "bg-white/25 text-white"
                      : "text-white/70 hover:bg-white/15 hover:text-white"
                  }`}
                  aria-label={item.label}
                  aria-current={activeTab === item.tab ? "page" : undefined}
                  data-ocid={item.ocid}
                >
                  {activeTab === item.tab && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-white/25"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.icon}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Bottom: logout + avatar */}
        <div className="flex flex-col items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onLogout}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/15 hover:text-white transition-all"
                aria-label="Log out"
                data-ocid="nav.logout.button"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Log out</p>
            </TooltipContent>
          </Tooltip>
          <button
            type="button"
            onClick={() => onTabChange("profile")}
            className="relative"
            aria-label="My profile"
            data-ocid="nav.profile.avatar"
          >
            <InitialsAvatar
              username={currentUser.username}
              displayName={currentUser.displayName}
              size="sm"
              className="ring-2 ring-white/40 hover:ring-white/80 transition-all"
            />
          </button>
        </div>
      </nav>
    </TooltipProvider>
  );
}

// Mobile bottom nav bar
export function MobileBottomNav({
  activeTab,
  onTabChange,
  onLogout,
}: NavRailProps) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-chat-green flex items-center justify-around px-4 py-2 z-50"
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map((item) => (
        <button
          key={item.tab}
          type="button"
          onClick={() => onTabChange(item.tab)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === item.tab
              ? "text-white"
              : "text-white/60 hover:text-white"
          }`}
          aria-label={item.label}
          data-ocid={item.ocid}
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onLogout}
        className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-white/60 hover:text-white transition-all"
        aria-label="Log out"
        data-ocid="nav.logout.button"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[10px] font-medium">Logout</span>
      </button>
    </nav>
  );
}
