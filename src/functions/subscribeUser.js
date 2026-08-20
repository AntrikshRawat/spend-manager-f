import axios from "axios";


function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}


export async function subscribeUser() {
  try {
    // register service worker
    const registration = await navigator.serviceWorker.register(
      "/service-worker.js",
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
        `${import.meta.env.VITE_VAPID_PUBLIC_KEY}`,
      ),
    });

    // send subscription to backend
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/userAccount/subscribe`,
      { subscription },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      },
    );
  } catch (err) {
    console.error("Subscription failed", err);
  }
}
