import { MessageSquare } from "lucide-react";
import { motion } from "motion/react";

export function EmptyConversation() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full bg-card text-center px-8"
      data-ocid="conversation.empty_state"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
          <MessageSquare className="w-9 h-9 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Select a conversation
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Choose someone from your chats or contacts to start messaging
        </p>
      </motion.div>
    </div>
  );
}
