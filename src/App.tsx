import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import BranchesPage from "@/pages/branches/BranchesPage";
import ProductsPage from "@/pages/products/ProductsPage";
import RolesPage from "@/pages/roles/RolesPage";
import SalesPage from "@/pages/sales/SalesPage";
import SaleDetailPage from "@/pages/sales/SaleDetailPage";
import StakeholdersPage from "@/pages/stakeholders/StakeholdersPage";
import StockPage from "@/pages/stock/StockPage";
import StockTransactionsPage from "@/pages/stock/StockTransactionsPage";
import UsersPage from "@/pages/users/UsersPage";
import LookupsPage from "@/pages/lookups/LookupsPage";
import RSDPage from "@/pages/rsd/RSDPage";
import LookupDetailPage from "@/pages/lookups/LookupDetailPage";
import IntegrationProvidersPage from "@/pages/integrations/IntegrationProvidersPage";
import BranchIntegrationsPage from "@/pages/integrations/BranchIntegrationsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

import { LookupProvider } from "@/context/LookupContext";
import StockTransactionDetailPage from "./pages/stock/StockTransactionDetailPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <LookupProvider>
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              </LookupProvider>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="sales/:id" element={<SaleDetailPage />} />
            <Route path="stakeholders" element={<StakeholdersPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route
              path="stock/transactions"
              element={<StockTransactionsPage />}
            />
            <Route
              path="stock/transactions/:id"
              element={<StockTransactionDetailPage />}
            />
            <Route path="rsd" element={<RSDPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="lookups" element={<LookupsPage />} />
            <Route path="lookups/:lookupCode" element={<LookupDetailPage />} />
            <Route
              path="integrations/providers"
              element={<IntegrationProvidersPage />}
            />
            <Route
              path="integrations/settings"
              element={<BranchIntegrationsPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
