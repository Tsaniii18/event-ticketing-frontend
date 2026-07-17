import { createElement, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageLoader from "./components/common/PageLoader";
import ProtectedRouteWrapper from "./components/layout/ProtectedRouteWrapper";
import { routes } from "./routes";

function App() {
  return (
    <div className="min-h-screen bg-app text-ink">
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {routes.map(({ path, Page, requiresAuth, roles }) => {
              const page = createElement(Page);
              const element = requiresAuth || roles
                ? <ProtectedRouteWrapper allowedRoles={roles}>{page}</ProtectedRouteWrapper>
                : page;

              return <Route key={path} path={path} element={element} />;
            })}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
