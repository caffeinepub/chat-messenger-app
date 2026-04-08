import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthScreenProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (
    username: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export function AuthScreen({
  onLogin,
  onRegister,
  error,
  clearError,
}: AuthScreenProps) {
  const { login: iiLogin, isLoggingIn, identity } = useInternetIdentity();

  // Sign In state
  const [siUsername, setSiUsername] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siLoading, setSiLoading] = useState(false);

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError || error;

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!siUsername.trim() || !siPassword) return;
    setSiLoading(true);
    setLocalError(null);
    clearError();
    try {
      await onLogin(siUsername.trim(), siPassword);
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSiLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regUsername.trim() || !regPassword || !regDisplayName.trim()) return;
    if (regPassword !== regConfirm) {
      setLocalError("Passwords do not match");
      return;
    }
    if (!identity) {
      setLocalError("Please connect with Internet Identity first to register.");
      return;
    }
    setRegLoading(true);
    setLocalError(null);
    clearError();
    try {
      await onRegister(regUsername.trim(), regPassword, regDisplayName.trim());
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-chat-green text-white mb-4 shadow-panel">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Chat Messenger</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect with people, instantly
          </p>
        </div>

        {/* Error */}
        {displayError && (
          <div
            className="mb-4 flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3"
            data-ocid="auth.error_state"
          >
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{displayError}</p>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-panel-lg border border-border overflow-hidden">
          <Tabs
            defaultValue="signin"
            onValueChange={() => {
              setLocalError(null);
              clearError();
            }}
          >
            <TabsList className="w-full rounded-none border-b border-border bg-muted/50 h-12">
              <TabsTrigger
                value="signin"
                className="flex-1 h-full data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
                data-ocid="auth.signin.tab"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 h-full data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
                data-ocid="auth.register.tab"
              >
                Register
              </TabsTrigger>
            </TabsList>

            {/* Sign In */}
            <TabsContent value="signin" className="p-6 m-0">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="si-username">Username</Label>
                  <Input
                    id="si-username"
                    placeholder="Enter your username"
                    value={siUsername}
                    onChange={(e) => setSiUsername(e.target.value)}
                    autoComplete="username"
                    disabled={siLoading}
                    data-ocid="auth.signin.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="si-password">Password</Label>
                  <Input
                    id="si-password"
                    type="password"
                    placeholder="Enter your password"
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={siLoading}
                    data-ocid="auth.signin.password_input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-chat-green hover:bg-chat-green-dark text-white font-semibold h-11"
                  disabled={siLoading || !siUsername.trim() || !siPassword}
                  data-ocid="auth.signin.submit_button"
                >
                  {siLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {siLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* Register */}
            <TabsContent value="register" className="p-6 m-0">
              <form onSubmit={handleRegister} className="space-y-4">
                {!identity && (
                  <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground space-y-2">
                    <p className="font-medium text-foreground">
                      Internet Identity required
                    </p>
                    <p>
                      To create an account, you need to connect with Internet
                      Identity first.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={iiLogin}
                      disabled={isLoggingIn}
                      data-ocid="auth.ii_connect.button"
                    >
                      {isLoggingIn ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      {isLoggingIn
                        ? "Connecting..."
                        : "Connect with Internet Identity"}
                    </Button>
                  </div>
                )}
                {identity && (
                  <div className="bg-primary/10 rounded-lg p-2.5 text-sm text-primary flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-chat-green" />
                    Identity connected
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="reg-displayname">Display Name</Label>
                  <Input
                    id="reg-displayname"
                    placeholder="Your full name"
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                    disabled={regLoading}
                    data-ocid="auth.register.displayname_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-username">Username</Label>
                  <Input
                    id="reg-username"
                    placeholder="Choose a unique username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    autoComplete="username"
                    disabled={regLoading}
                    data-ocid="auth.register.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={regLoading}
                    data-ocid="auth.register.password_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm">Confirm Password</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    placeholder="Confirm your password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    autoComplete="new-password"
                    disabled={regLoading}
                    data-ocid="auth.register.confirm_input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-chat-green hover:bg-chat-green-dark text-white font-semibold h-11"
                  disabled={
                    regLoading ||
                    !regUsername.trim() ||
                    !regPassword ||
                    !regDisplayName.trim() ||
                    !identity
                  }
                  data-ocid="auth.register.submit_button"
                >
                  {regLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {regLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
