import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SupabaseProvider } from "./lib/supabase";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppShell from "./components/layout/AppShell";

// Lazy load all modules for better performance
const DashboardPage = React.lazy(() => import("./modules/Dashboard").then(m => ({ default: m.DashboardPage })));
const BusinessOperationsPage = React.lazy(() => import("./modules/BusinessOperations").then(m => ({ default: m.BusinessOperationsPage })));
const ProfilePage = React.lazy(() => import("./modules/Profile").then(m => ({ default: m.ProfilePage })));
const SupportPage = React.lazy(() => import("./modules/Support").then(m => ({ default: m.SupportPage })));
const AccountingPage = React.lazy(() => import("./modules/Accounting").then(m => ({ default: m.AccountingPage })));
const AdminConfigPage = React.lazy(() => import("./modules/AdminConfig").then(m => ({ default: m.AdminConfigPage })));
const MultiCompanyPage = React.lazy(() => import("./modules/MultiCompany").then(m => ({ default: m.MultiCompanyPage })));
const HRMPage = React.lazy(() => import("./modules/HRM").then(m => ({ default: m.HRMPage })));
const CompliancePage = React.lazy(() => import("./modules/Compliance").then(m => ({ default: m.CompliancePage })));
const TaxPage = React.lazy(() => import("./modules/Tax").then(m => ({ default: m.TaxPage })));
const ReportingPage = React.lazy(() => import("./modules/Reporting").then(m => ({ default: m.ReportingPage })));
const RevenuePage = React.lazy(() => import("./modules/Revenue").then(m => ({ default: m.RevenuePage })));
const LeasesPage = React.lazy(() => import("./modules/Leases").then(m => ({ default: m.LeasesPage })));
const IntangiblesPage = React.lazy(() => import("./modules/Intangibles").then(m => ({ default: m.IntangiblesPage })));
const FairValuePage = React.lazy(() => import("./modules/FairValue").then(m => ({ default: m.FairValuePage })));
const ConsolidationPage = React.lazy(() => import("./modules/Consolidation").then(m => ({ default: m.ConsolidationPage })));
const SegmentsPage = React.lazy(() => import("./modules/Segments").then(m => ({ default: m.SegmentsPage })));
const PPPPage = React.lazy(() => import("./modules/PPP").then(m => ({ default: m.PPPPage })));
const RelatedPartiesPage = React.lazy(() => import("./modules/RelatedParties").then(m => ({ default: m.RelatedPartiesPage })));
const PoliciesPage = React.lazy(() => import("./modules/Policies").then(m => ({ default: m.PoliciesPage })));
const PayrollPage = React.lazy(() => import("./modules/Payroll").then(m => ({ default: m.PayrollPage })));
const MFRSPage = React.lazy(() => import("./modules/MFRS").then(m => ({ default: m.MFRSPage })));
const LedgerPage = React.lazy(() => import("./modules/Ledger").then(m => ({ default: m.LedgerPage })));
const InvoicingPage = React.lazy(() => import("./modules/Invoicing").then(m => ({ default: m.InvoicingPage })));
const CashFlowPage = React.lazy(() => import("./modules/CashFlow").then(m => ({ default: m.CashFlowPage })));

// Loading component for lazy-loaded modules
const ModuleLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading module...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <AuthProvider>
          {/* Only wrap protected app pages with AppShell. Do NOT show AppShell (header/background) on HomePage or LoginPage. */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <DashboardPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/business"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <BusinessOperationsPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <ProfilePage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <SupportPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <AccountingPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <AdminConfigPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/multicompany"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <MultiCompanyPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hrm"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <HRMPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/compliance"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <CompliancePage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tax"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <TaxPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reporting"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <ReportingPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/revenue"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <RevenuePage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leases"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <LeasesPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/intangibles"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <IntangiblesPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/fairvalue"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <FairValuePage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/consolidation"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <ConsolidationPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/segments"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <SegmentsPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ppp"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <PPPPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/relatedparties"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <RelatedPartiesPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/policies"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <PoliciesPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <PayrollPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mfrs"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <MFRSPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ledger"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <LedgerPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoicing"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <InvoicingPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cashflow"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<ModuleLoadingFallback />}>
                      <CashFlowPage />
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}

export default App;
