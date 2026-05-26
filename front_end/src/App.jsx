import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import StudentUsedGoodsHomepage from "./pages/HomePage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import MyPosts from "./pages/MyPosts";
import Profile from "./pages/Profile";
import Transactions from "./pages/Transactions";
import Cart from "./pages/Cart";
import Addresses from "./pages/Addresses";
import Orders from "./pages/Orders";
import Favorites from "./pages/Favorites";
import Reviews from "./pages/Reviews";

import Charities from "./pages/Charities";
import CreateCharity from "./pages/CreateCharity";
import CharityDetail from "./pages/CharityDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import UserRoute from "./components/UserRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentUsedGoodsHomepage />} />

        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route
          path="/create-post"
          element={
            <UserRoute>
              <CreatePost />
            </UserRoute>
          }
        />
        <Route
          path="/my-posts"
          element={
            <UserRoute>
              <MyPosts />
            </UserRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <UserRoute>
              <Profile />
            </UserRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <UserRoute>
              <Transactions />
            </UserRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <UserRoute>
              <Cart />
            </UserRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <UserRoute>
              <Addresses />
            </UserRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <UserRoute>
              <Orders />
            </UserRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <UserRoute>
              <Favorites />
            </UserRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <UserRoute>
              <Reviews />
            </UserRoute>
          }
        />
        
        <Route path="/charities" element={<Charities />} />
        <Route path="/create-charity" element={<CreateCharity />} />
        <Route path="/charity/:id" element={<CharityDetail />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
