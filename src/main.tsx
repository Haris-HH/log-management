import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from './hooks/useTheme';
import { NavPositionProvider } from './hooks/useNavPosition';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";

import "./index.css";
import App from "./App.tsx";
import "./i18n";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <CssBaseline />

    <BrowserRouter>
      <NavPositionProvider>
        <Provider store={store}>
          <PersistGate
            loading={null}
            persistor={persistor}
          >
            <App />
          </PersistGate>
        </Provider>
      </NavPositionProvider>
    </BrowserRouter>
  </ThemeProvider>
);