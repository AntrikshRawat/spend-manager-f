import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import MyAccounts from './pages/MyAccounts'
import NotFound from './pages/NotFound'
import CreateAccount from './pages/CreateAccount'
import About from './pages/About'
import AccountDetails from './pages/AccountDetails'
import RootLayout from './components/RootLayout'
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; // Required CSS
import Notifications from './components/Notifications';

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
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default function App() {
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
  )
}