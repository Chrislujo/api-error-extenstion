document.addEventListener("DOMContentLoaded", async () => {
  console.log("Popup script loaded!");

  // Get the errors div
  const errorsDiv = document.getElementById("errors");

  function displayErrors() {
    chrome.storage.local.get(["apiErrors"], (result) => {
      const errors = result.apiErrors || [];
      if (errors.length === 0) {
        errorsDiv.innerHTML = "<p>No errors detected yet.</p>";
      } else {
        errorsDiv.innerHTML = ""; // Clear existing errors
        errors.forEach((error) => {
          const errorElement = document.createElement("div");
          errorElement.className = "error";
          errorElement.innerHTML = `
            <strong>Status:</strong> ${error.status}<br>
            <strong>URL:</strong> ${error.url}<br>
            <strong>Time:</strong> ${new Date(error.timestamp).toLocaleString()}
          `;
          errorsDiv.appendChild(errorElement);
        });
      }
    });
  }

  // Initial display
  displayErrors();

  // Add clear button functionality
  const clearButton = document.getElementById("myButton");
  clearButton.textContent = "Clear Errors";
  clearButton.addEventListener("click", async () => {
    await chrome.storage.local.set({ apiErrors: [] });
    displayErrors();
  });

  // Add test buttons functionality
  document.getElementById("test404").addEventListener("click", async () => {
    console.log("Testing 404 error...");
    try {
      const response = await fetch("https://httpstat.us/404");
      console.log("404 test response:", response.status);

      if (!response.ok) {
        // Send error to background script
        chrome.runtime.sendMessage({
          type: "API_ERROR",
          error: {
            status: response.status,
            url: "https://httpstat.us/404",
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error("404 test error:", error);
    }
  });

  document.getElementById("test500").addEventListener("click", async () => {
    console.log("Testing 500 error...");
    try {
      const response = await fetch("https://httpstat.us/500");
      console.log("500 test response:", response.status);

      if (!response.ok) {
        // Send error to background script
        chrome.runtime.sendMessage({
          type: "API_ERROR",
          error: {
            status: response.status,
            url: "https://httpstat.us/500",
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error("500 test error:", error);
    }
  });

  // Listen for storage changes to update the display
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.apiErrors) {
      displayErrors();
    }
  });
});
