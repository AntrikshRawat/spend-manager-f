import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy load all components
const LoginPage = lazy(() => import("./pages/LoginPage"));
const HomePage = lazy(()=>import("./pages/HomePage"));
const SignUpPage = lazy(()=>import("./pages/SignUpPage"));
const MyAccounts = lazy(()=>import("./pages/MyAccounts"));
const NotFound = lazy(()=>import("./pages/NotFound"));
const CreateAccount = lazy(()=>import("./pages/CreateAccount"));
const About = lazy(()=>import("./pages/About"));
const AccountDetails = lazy(()=>import("./pages/AccountDetails"));
const RootLayout = lazy(()=>import("./components/RootLayout"));
import Notifications from "./components/Notifications";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import axios from "axios";
import { useEffect } from "react";
import useUserStore from "./store/useUserStore";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "my-accounts",
        element: <MyAccounts />,
      },
      {
        path: "my-accounts/:acId",
        element: <AccountDetails />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      },
      {
        path: "create-account",
        element: <CreateAccount />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "change-password",
        element: <ChangePassword />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

async function subscribeUser() {
  try {
    // register service worker
    const registration = await navigator.serviceWorker.register(
      "/service-worker.js"
    );

    // ask permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return;
    }

    // subscribe to push manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        `${import.meta.env.VITE_VAPID_PUBLIC_KEY}`
      ),
    });

    // send subscription to backend
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/userAccount/subscribe`,
      { subscription },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
  } catch (err) {
    console.error("Subscription failed", err);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function App() {
  const user = useUserStore((u) => u.user);
  useEffect(() => {
    if (user && user._id) {
      subscribeUser();
    }
  }, []);
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
