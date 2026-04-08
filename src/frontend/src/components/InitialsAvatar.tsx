import { getAvatarColor, getInitials } from "../utils/avatarColor";

interface InitialsAvatarProps {
  username: string;
  displayName: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-20 h-20 text-2xl",
};

export function InitialsAvatar({
  username,
  displayName,
  size = "md",
  className = "",
}: InitialsAvatarProps) {
  const bgColor = getAvatarColor(username);
  const initials = getInitials(displayName);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none ${className}`}
      style={{ backgroundColor: bgColor }}
      aria-label={displayName}
    >
      {initials}
    </div>
  );
}
