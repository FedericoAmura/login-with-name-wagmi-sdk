import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';

import "./App.css";
import { Home } from "./pages/home";
import { Landing } from "./pages/landing";
import { LitId } from "./pages/litId";
import { Register } from "./pages/register";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Landing />} />
      <Route path="/litid" element={<LitId />} />
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
