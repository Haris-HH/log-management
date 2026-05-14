import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store";
import './index.css'
import App from './App.tsx'
import './i18n';
import 'leaflet/dist/leaflet.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </ThemeProvider>
)
