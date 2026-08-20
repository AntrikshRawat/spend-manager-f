import { createBrowserRouter } from "react-router-dom";
import {
  LoginPage,
  HomePage,
  SignUpPage,
  MyAccounts,
  NotFound,
  CreateAccount,
  About,
  AccountDetails,
  RootLayout,
  Notifications,
  ChangePassword,
  ForgotPassword,
} from "./Importer";

export const router = createBrowserRouter([
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
