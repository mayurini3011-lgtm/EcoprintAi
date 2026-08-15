import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Overview = lazy(() => import("./pages/Overview.tsx"));
const Analyze = lazy(() => import("./pages/Analyze.tsx"));
const DesignStudio = lazy(() => import("./pages/DesignStudio.tsx"));
const Assistant = lazy(() => import("./pages/Assistant.tsx"));
const DyeLibrary = lazy(() => import("./pages/DyeLibrary.tsx"));
const History = lazy(() => import("./pages/History.tsx"));
const SavedDesigns = lazy(() => import("./pages/SavedDesigns.tsx"));
const Reports = lazy(() => import("./pages/Reports.tsx"));
const Pricing = lazy(() => import("./pages/Pricing.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const Account = lazy(() => import("./pages/Account.tsx"));
const Studio = lazy(() => import("./pages/Studio.tsx"));
const Dyes = lazy(() => import("./pages/Dyes.tsx"));
const DyeDetail = lazy(() => import("./pages/DyeDetail.tsx"));
const Tailors = lazy(() => import("./pages/Tailors.tsx"));
const TailorDetail = lazy(() => import("./pages/TailorDetail.tsx"));
const Orders = lazy(() => import("./pages/Orders.tsx"));
const Farmer = lazy(() => import("./pages/Farmer.tsx"));
const Manufacturer = lazy(() => import("./pages/Manufacturer.tsx"));
const Security = lazy(() => import("./pages/Security.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Verify = lazy(() => import("./pages/Verify.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

/** Fade/slide each route in and out for a polished page-change feel. */
function AnimatedRoutes({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Routes location={location}>{children}</Routes>
      </motion.div>
    </AnimatePresence>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <AnimatedRoutes>
              <Route path="/" element={<Landing />} />
              <Route path="/verify/:garmentId" element={<Verify />} />
              <Route
                path="/auth"
                element={<AuthPage redirectAfterAuth="/dashboard" />}
              />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Overview />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/studio"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Studio />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/analyze"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Analyze />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/design-studio"
                element={
                  <RequireAuth>
                    <AppShell>
                      <DesignStudio />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/assistant"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Assistant />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/dye-library"
                element={
                  <RequireAuth>
                    <AppShell>
                      <DyeLibrary />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/history"
                element={
                  <RequireAuth>
                    <AppShell>
                      <History />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/designs"
                element={
                  <RequireAuth>
                    <AppShell>
                      <SavedDesigns />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/reports"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Reports />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/pricing"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Pricing />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/checkout"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Checkout />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/account"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Account />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/dyes"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Dyes />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/dyes/:code"
                element={
                  <RequireAuth>
                    <AppShell>
                      <DyeDetail />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/tailors"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Tailors />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/tailors/:code"
                element={
                  <RequireAuth>
                    <AppShell>
                      <TailorDetail />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/orders"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Orders />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/farmer"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Farmer />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/manufacturer"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Manufacturer />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/security"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Security />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AppShell>
                      <Admin />
                    </AppShell>
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFound />} />
            </AnimatedRoutes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
