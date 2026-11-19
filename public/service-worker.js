// Take control right away so a fixed worker doesn't wait for every tab to close.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  // event.waitUntil keeps the worker alive until the notification is actually
  // shown. Without it, browsers can kill the worker first (notification lost).
  event.waitUntil(
    self.registration.showNotification(data.title || "Spend Manager", {
      body: data.body || "",
      icon: "/logo-256x256.png",
      badge: "/logo-96x96.png",
      data: { url: data.url || "/my-accounts" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Use the origin the worker runs on (works on previews / custom domains too).
  const url = new URL(
    event.notification.data?.url || "/my-accounts",
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }),
  );
});
