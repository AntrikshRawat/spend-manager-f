import axiosInstance from "./axiosInstance";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function sameKey(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

let inFlight = null;

export function subscribeUser() {
  // App can call this more than once; run a single subscription at a time.
  if (!inFlight) {
    inFlight = doSubscribe().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function doSubscribe() {
  try {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      return;
    }

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.error("VITE_VAPID_PUBLIC_KEY is not set; push is disabled.");
      return;
    }

    // Only prompt when the user hasn't decided yet.
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") return;

    await navigator.serviceWorker.register("/service-worker.js");
    // .ready resolves only once the worker is active; subscribing before that fails.
    const registration = await navigator.serviceWorker.ready;

    const serverKey = urlBase64ToUint8Array(vapidKey);
    let subscription = await registration.pushManager.getSubscription();

    // A subscription made with a different VAPID key can never receive pushes.
    if (subscription) {
      const current = subscription.options?.applicationServerKey;
      if (current && !sameKey(new Uint8Array(current), serverKey)) {
        await subscription.unsubscribe();
        subscription = null;
      }
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: serverKey,
      });
    }

    // Always re-sync with the backend so a dropped/expired record is restored.
    await axiosInstance.post(
      `${import.meta.env.VITE_BACKEND_URL}/userAccount/subscribe`,
      { subscription: subscription.toJSON() },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      },
    );
  } catch (err) {
    console.error("Subscription failed", err);
  }
}
