import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import PermissionRoute from "./PermissionRoute";
import AuthUserReducer from "../../features/auth-user/api/AuthUserSlice";
import type { Permissions } from "../../types/common";

const renderAt = (
  path: string,
  groupKey: string,
  permission: Permissions | null | undefined
) => {
  const store = configureStore({
    reducer: { authUser: AuthUserReducer },
    preloadedState: {
      authUser: {
        user: {
          user_id: "u1",
          hash_id: "h1",
          title_name_th: "",
          title_name_en: "",
          first_name: "",
          last_name: "",
          image_url: "",
          ...(permission === undefined ? {} : { permission }),
        },
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<div>home</div>} />
          <Route
            path="/guarded"
            element={
              <PermissionRoute groupKey={groupKey}>
                <div>guarded page</div>
              </PermissionRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

const grant = (mode: string): Permissions => ({
  ui: {
    "log-management": {
      enabled: true,
      groups: { "overall-map": mode as never },
      prints: {},
    },
  },
});

describe("PermissionRoute", () => {
  it('renders the page on "edit"', () => {
    renderAt("/guarded", "overall-map", grant("edit"));

    expect(screen.getByText("guarded page")).toBeInTheDocument();
  });

  it('renders the page on "active" — read-only still gets in', () => {
    renderAt("/guarded", "overall-map", grant("active"));

    expect(screen.getByText("guarded page")).toBeInTheDocument();
  });

  it('redirects home on "none" rather than rendering the page', () => {
    renderAt("/guarded", "overall-map", grant("none"));

    expect(screen.queryByText("guarded page")).not.toBeInTheDocument();
    expect(screen.getByText("home")).toBeInTheDocument();
  });

  it("redirects home for a key the server never granted", () => {
    renderAt("/guarded", "chart-top-users", grant("edit"));

    expect(screen.queryByText("guarded page")).not.toBeInTheDocument();
    expect(screen.getByText("home")).toBeInTheDocument();
  });

  it("redirects home when the whole service is disabled", () => {
    renderAt("/guarded", "overall-map", {
      ui: {
        "log-management": {
          enabled: false,
          groups: { "overall-map": "edit" },
          prints: {},
        },
      },
    });

    expect(screen.queryByText("guarded page")).not.toBeInTheDocument();
    expect(screen.getByText("home")).toBeInTheDocument();
  });

  it("holds — renders neither page nor redirect — while permissions are unknown", () => {
    renderAt("/guarded", "overall-map", undefined);

    expect(screen.queryByText("guarded page")).not.toBeInTheDocument();
    // Crucially not bounced home either: the refresh in App.tsx has yet to land.
    expect(screen.queryByText("home")).not.toBeInTheDocument();
  });

  it("redirects once permissions are known to be absent", () => {
    renderAt("/guarded", "overall-map", null);

    expect(screen.getByText("home")).toBeInTheDocument();
  });
});
