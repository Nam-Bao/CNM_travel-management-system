import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      {/* Outlet chính là nơi render ra các component con (HomePage, Detail,...) */}
      <main className="flex-grow w-full bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;