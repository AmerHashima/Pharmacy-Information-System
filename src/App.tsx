import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import BranchesPage from "@/pages/branches/BranchesPage";
import StoresPage from "@/pages/store/StoresPage";
import ProductsPage from "@/pages/products/ProductsPage";
import RolesPage from "@/pages/roles/RolesPage";
import SalesPage from "@/pages/sales/SalesPage";
import SalesHistoryPage from "@/pages/sales/SalesHistoryPage";
import RefundHistoryPage from "@/pages/sales/RefundHistoryPage";
import SaleDetailPage from "@/pages/sales/SaleDetailPage";
import RefundDetailPage from "@/pages/sales/RefundDetailPage";
import StakeholdersPage from "@/pages/stakeholders/StakeholdersPage";
import StockPage from "@/pages/stock/StockPage";
import StockHistoryPage from "@/pages/stock/StockHistoryPage";
import StockLevelsPage from "@/pages/stock/StockLevelsPage";
import StockReturnsPage from "@/pages/stock/StockReturnsPage";
import StockTransactionsPage from "@/pages/stock/StockTransactionsPage";
import UsersPage from "@/pages/users/UsersPage";
import LookupsPage from "@/pages/lookups/LookupsPage";
import LookupDetailPage from "@/pages/lookups/LookupDetailPage";
import RSDPage from "@/pages/rsd/RSDPage";
import IntegrationProvidersPage from "@/pages/integrations/IntegrationProvidersPage";
import BranchIntegrationsPage from "@/pages/integrations/BranchIntegrationsPage";
import RsdLogsPage from "@/pages/rsd/RsdLogsPage";
import ProductFormPage from "@/pages/products/ProductFormPage";
import { LookupProvider } from "@/context/LookupContext";
import StockTransactionDetailPage from "./pages/stock/StockTransactionDetailPage";
import StockTransactionReturnPage from "./pages/stock/StockTransactionReturnPage";
import StockTransactionReturnDetailPage from "./pages/stock/StockTransactionReturnDetailPage";
import PermissionGate from "@/components/shared/PermissionGate";
import { PERMISSIONS } from "@/config/permissions";
import InvoiceTemplatePage from "./pages/invoiceBuilder/InvoiceTemplatePage";
import InvoiceShapesPage from "./pages/invoiceBuilder/InvoiceShapesPage";
import BranchFormPage from "./pages/branches/BranchFormPage";
import GenericsPage from "./pages/generics/GenericsPage";
import GenericFormPage from "./pages/generics/GenericFormPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

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
            <Route path="branches/new" element={<BranchFormPage />} />
            <Route path="branches/edit/:id" element={<BranchFormPage />} />
            <Route path="stores" element={<StoresPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/edit/:id" element={<ProductFormPage />} />
            <Route path="roles" element={<RolesPage />} />

            {/* Sales routes */}
            <Route path="sales" element={<SalesPage />} />
            <Route path="sales/history" element={<SalesHistoryPage />} />
            <Route path="sales/refunds" element={<RefundHistoryPage />} />
            <Route path="sales/:id" element={<SaleDetailPage />} />
            <Route path="sales/refund/:id" element={<RefundDetailPage />} />

            <Route path="stakeholders" element={<StakeholdersPage />} />

            {/* Stock routes */}
            <Route path="stock" element={<StockPage />} />
            <Route path="stock/history" element={<StockHistoryPage />} />
            <Route path="stock/levels" element={<StockLevelsPage />} />
            <Route path="stock/returns" element={<StockReturnsPage />} />
            <Route
              path="stock/transactions"
              element={<StockTransactionsPage />}
            />
            <Route
              path="stock/transactions/:id"
              element={<StockTransactionDetailPage />}
            />
            <Route
              path="stock/transactions/:id/return"
              element={<StockTransactionReturnPage />}
            />
            <Route
              path="stock/returns/:id"
              element={<StockTransactionReturnDetailPage />}
            />

            <Route path="rsd" element={<RSDPage />} />
            <Route path="rsd/logs" element={<RsdLogsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="lookups" element={<LookupsPage />} />
            <Route path="lookups/:lookupCode" element={<LookupDetailPage />} />
            <Route path="generics" element={<GenericsPage />} />
            <Route path="generics/new" element={<GenericFormPage />} />
            <Route path="generics/edit/:id" element={<GenericFormPage />} />
            <Route
              path="integrations/providers"
              element={<IntegrationProvidersPage />}
            />
            <Route
              path="integrations/settings"
              element={<BranchIntegrationsPage />}
            />
            <Route path="invoice-builder" element={<InvoiceShapesPage />} />
            <Route path="invoice-builder/new" element={<InvoiceTemplatePage />} />
            <Route path="invoice-builder/edit/:id" element={<InvoiceTemplatePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
