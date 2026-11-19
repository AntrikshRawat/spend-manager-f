import { ToastContainer } from "react-toastify";
import { subscribeUser } from "./functions/subscribeUser";
import "react-toastify/dist/ReactToastify.css";
import { RouterProvider } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { router } from "./Routers";
import useUserStore from "./store/useUserStore";
import socket from "./socket";

export default function App() {
  const userId = useUserStore((u) => u.user?._id);

  // Push (background) notifications: set up once per logged-in user.
  useEffect(() => {
    if (!userId) return;
    subscribeUser();
  }, [userId]);

  // In-app (socket) notifications.
  useEffect(() => {
    if (!userId) return;

    const updateFunction = () => {
      window.dispatchEvent(new CustomEvent("updateEvent"));
    };

    const notificationFunction = (note) => {
      window.dispatchEvent(new CustomEvent("notificationEvent", { detail: note }));
    };

    // Socket.IO rooms are per-connection: after any reconnect (network switch,
    // phone sleep, server restart) the user is no longer in their room, so we
    // must join again on every "connect", not just once.
    const joinRoom = () => socket.emit("join_room", userId);
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    // Mobile browsers pause sockets in the background; wake it up on return.
    const onVisible = () => {
      if (document.visibilityState === "visible" && !socket.connected) {
        socket.connect();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    socket.on("account-update", updateFunction);
    socket.on("payment-update", updateFunction);
    socket.on("account-notification", notificationFunction);
    socket.on("payment-notification", notificationFunction);
    socket.on("reminder-notification", notificationFunction);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      socket.off("connect", joinRoom);
      socket.off("account-update", updateFunction);
      socket.off("payment-update", updateFunction);
      socket.off("account-notification", notificationFunction);
      socket.off("payment-notification", notificationFunction);
      socket.off("reminder-notification", notificationFunction);
    };
  }, [userId]);

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
