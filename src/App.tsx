import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';

import "./App.css";
import { DomainWallet } from "./pages/domainWallet";
import { Home } from "./pages/home";
import { Landing } from "./pages/landing";
import { RegisterAuthFlows } from "./pages/registerAuthFlows";
import { RegisterName } from "./pages/registerName";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Landing />} />
      <Route path="/domainWallet" element={<DomainWallet />} />
      <Route path="/registerName" element={<RegisterName />} />
      <Route path="/registerAuthFlows" element={<RegisterAuthFlows />} />
      <Route path="/home" element={<Home />} />
    </Route>
  )
);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
