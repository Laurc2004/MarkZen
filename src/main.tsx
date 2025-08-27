import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import "./styles/main.scss";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
