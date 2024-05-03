import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';

import "./App.css";
import { Home } from "./pages/home";
import { Landing } from "./pages/landing";
import { DomainWallet } from "./pages/domainWallet";
import { Register } from "./pages/register";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Landing />} />
      <Route path="/domainWallet" element={<DomainWallet />} />
      <Route path="/register" element={<Register />} />
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
