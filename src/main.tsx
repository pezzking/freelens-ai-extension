import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {MainPage} from "./pages/mainPage/mainPage";
import "./index.css";
import "./dark-theme.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="container">
      <MainPage extension={null} />
    </div>
  </StrictMode>,
)
