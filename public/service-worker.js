self.addEventListener("push", (event) => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.message,
    icon: "/logo-256x256.png",
    badge: "/logo-192x192.png" 
  });
});
