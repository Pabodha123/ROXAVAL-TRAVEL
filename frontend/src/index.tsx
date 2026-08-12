import "./index.css";
import "./i18n";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}

// Fade out the static index.html splash once the app has actually painted —
// a double rAF waits a real frame past React's commit, not just the
// synchronous render() call, so the swap isn't visible as a flash.
const loaderEl = document.getElementById("app-loader");
if (loaderEl) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      loaderEl.classList.add("app-loader-hidden");
      setTimeout(() => loaderEl.remove(), 500);
    });
  });
}