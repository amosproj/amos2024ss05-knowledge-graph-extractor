import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Home from "../Home";
import Graph from "../Graph";
import "./index.css";

function App() {
  return (
    <main className="main_wrapper">
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/graph"
            element={<Graph />}
          />
        </Routes>
      </Router>
    </main>
  );
}

export default App;
