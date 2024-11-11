console.log("Background script initialized");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 Background received message:", message);

  if (message.type === "API_ERROR") {
    console.log("🚨 Processing API error:", message.error);

    // Show notification
    chrome.notifications.create(
      {
        type: "basic",
        iconUrl: "error-api.png",
        title: "API Error Detected",
        message: `Status: ${message.error.status}\nURL: ${message.error.url}`,
        priority: 2,
        requireInteraction: true,
      },
      (notificationId) => {
        console.log("🔔 Notification created:", notificationId);
      }
    );

    // Store error
    chrome.storage.local.get(["apiErrors"], (result) => {
      const errors = result.apiErrors || [];
      errors.push(message.error);
      chrome.storage.local.set({ apiErrors: errors.slice(-100) }, () => {
        console.log("💾 Error stored:", message.error);
      });
    });

    sendResponse({ received: true });
  }

  return true; // Keep message channel open for async response
});
