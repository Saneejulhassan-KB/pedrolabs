import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./Components/Register/Register.jsx";
import AboutUs from "./pages/AboutUs/AboutUs";
import Services from "./pages/services/Services";
import Preloader from "./Components/Preloader/Preloader";
import Authnew from "./Components/Register/Authnew.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Product from "./pages/productPage/Product.jsx";
import Test from "./Components/test/Test.jsx";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/product" element={<Product />} />
          <Route path="/test" element={<Test />} />
          {/* <Route path="/register" element={<Register />} /> */}

          <Route path="/authnew" element={<Authnew />} />
          {/* <Route path="/register" element={<SignInSignUpForm />} /> */}
          <Route path="/preloader" element={<Preloader />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
