import { useAuth } from "@/_core/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChangePassword from "@/pages/ChangePassword";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Users from "@/pages/Users";
import type { ReactNode } from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

/**
 * Everything except /login sits behind a session. A user carrying a temporary
 * password is funnelled to /cambiar-contrasena until they pick their own.
 */
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) return null;
  if (!user) return <Redirect to="/login" />;
  if (user.mustChangePassword && location !== "/cambiar-contrasena") {
    return <Redirect to="/cambiar-contrasena" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/cambiar-contrasena">
        <RequireAuth>
          <ChangePassword />
        </RequireAuth>
      </Route>
      <Route path="/usuarios">
        <RequireAuth>
          <Users />
        </RequireAuth>
      </Route>
      <Route path="/">
        <RequireAuth>
          <Home />
        </RequireAuth>
      </Route>
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
