import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import WordleApp from "./WordleApp";

const REACT_VERSION = React.version;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <div>
      <WordleApp />
      {/* <div>React version: {REACT_VERSION}</div> */}
    </div>
  </React.StrictMode>
);
