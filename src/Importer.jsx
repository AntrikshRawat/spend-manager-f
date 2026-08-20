import { lazy } from "react";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const MyAccounts = lazy(() => import("./pages/MyAccounts"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CreateAccount = lazy(() => import("./pages/CreateAccount"));
const About = lazy(() => import("./pages/About"));
const AccountDetails = lazy(() => import("./pages/AccountDetails"));
const RootLayout = lazy(() => import("./components/RootLayout"));
import Notifications from "./components/Notifications";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";

export {
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
};
