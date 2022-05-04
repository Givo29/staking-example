import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import "core-js/features";

import ReactDOM from "react-dom";
import { Router } from "react-router-dom";

import App from "./App";

import history from "./services/history";
import { Toaster } from "react-hot-toast";

import "bootstrap/dist/css/bootstrap.css";
import "normalize.css/normalize.css";
import "index.css";

ReactDOM.render(
  <>
    <Toaster
      toastOptions={{
        success: {
          duration: 5000,
        },
      }}
    />
    <Toaster />
    <Router history={history}>
      <App />
    </Router>
  </>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
