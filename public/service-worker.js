self.addEventListener("push", (event) => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/logo-256x256.png",
    data: { url: data.url },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close(); // close the notification

  const url = `https://spend-manager-f.vercel.app${event.notification.data.url}`; // get URL from data

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
