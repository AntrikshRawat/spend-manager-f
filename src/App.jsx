import { ToastContainer } from "react-toastify";
import { subscribeUser } from "./functions/subscribeUser";
import "react-toastify/dist/ReactToastify.css";
import { RouterProvider } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { router } from "./Routers";
import useUserStore from "./store/useUserStore";
import socket from "./socket";

export default function App() {
  const user = useUserStore((u) => u.user);
  useEffect(() => {
    if (user && user._id) {
      subscribeUser();
    }
  }, [user]);

  useEffect(() => {
    if (!user || !user?._id) return;

    const updateFunction = () => {
      const event = new CustomEvent("updateEvent");
      window.dispatchEvent(event);
    };

    const notificationFunction = (note) => {
      const event = new CustomEvent("notificationEvent");
      window.dispatchEvent(event,note);
    };

    socket.emit("join_room", user?._id);

    socket.on("account-update", updateFunction);
    socket.on("payment-update", updateFunction);

    socket.on("account-notification", notificationFunction);
    socket.on("payment-notification", notificationFunction);
  }, [user]);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        theme="light"
      />
      <RouterProvider router={router} />
    </div>
  );
}
