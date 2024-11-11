console.log("Content script initialized");

let debugDiv = null;

// Function to get color based on status code
function getErrorColor(status) {
  if (status >= 500) {
    return {
      background: "rgba(220, 53, 69, 0.9)", // Red for server errors
      color: "white",
    };
  } else if (status >= 400) {
    return {
      background: "rgba(255, 193, 7, 0.9)", // Yellow for client errors
      color: "black",
    };
  } else if (status >= 300) {
    return {
      background: "rgba(23, 162, 184, 0.9)", // Blue for redirects
      color: "white",
    };
  } else if (status === 0) {
    return {
      background: "rgba(108, 117, 125, 0.9)", // Gray for network errors
      color: "white",
    };
  }
  return {
    background: "rgba(40, 167, 69, 0.9)", // Green for success
    color: "white",
  };
}

function getSeverityText(status) {
  if (status >= 500) return "Critical Error";
  if (status >= 400) return "Warning";
  if (status >= 300) return "Redirect";
  if (status === 0) return "Network Error";
  return "Success";
}

function updateDebugDiv(status, url, message) {
  if (!debugDiv) return;

  console.log("Updating debug div:", { status, url, message });

  const colors = getErrorColor(status);
  debugDiv.style.backgroundColor = colors.background;
  debugDiv.style.color = colors.color;
  debugDiv.innerHTML = `
        <strong>${getSeverityText(status)}</strong><br>
        Status: ${status}<br>
        URL: ${url.substring(0, 50)}${url.length > 50 ? "..." : ""}
    `;

  debugDiv.style.animation = "none";
  debugDiv.offsetHeight;
  debugDiv.style.animation = "fadeInOut 2s ease-in-out";
}

function reportError(status, url, message) {
  console.log("🚨 Reporting error:", { status, url, message });

  updateDebugDiv(status, url, message);

  chrome.runtime.sendMessage({
    type: "API_ERROR",
    error: {
      status: parseInt(status) || 0,
      url: url,
      statusText: message,
      timestamp: new Date().toISOString(),
    },
  });
}

// Monitor XHR requests
const XHR = XMLHttpRequest.prototype;
const open = XHR.open;
const send = XHR.send;

XHR.open = function (method, url) {
  this._url = url;
  return open.apply(this, arguments);
};

XHR.send = function () {
  this.addEventListener("loadend", function () {
    if (this.status >= 400) {
      console.log("XHR Error:", this.status, this._url);
      reportError(this.status, this._url, this.statusText);
    }
  });
  return send.apply(this, arguments);
};

// Monitor fetch requests
const originalFetch = window.fetch;
window.fetch = async function (resource, init) {
  const url = typeof resource === "string" ? resource : resource.url;

  try {
    const response = await originalFetch.apply(this, arguments);
    if (!response.ok) {
      console.log("Fetch Error:", response.status, url);
      reportError(response.status, url, response.statusText);
    }
    return response;
  } catch (error) {
    console.log("Fetch Network Error:", url);
    reportError(0, url, error.message);
    throw error;
  }
};

function initializeDebugElements() {
  debugDiv = document.createElement("div");
  debugDiv.style.position = "fixed";
  debugDiv.style.bottom = "10px";
  debugDiv.style.left = "10px";
  debugDiv.style.padding = "10px";
  debugDiv.style.zIndex = "10000";
  debugDiv.style.fontSize = "12px";
  debugDiv.style.fontFamily = "monospace";
  debugDiv.style.borderRadius = "5px";
  debugDiv.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  debugDiv.style.transition = "all 0.3s ease";
  debugDiv.style.maxWidth = "300px";
  debugDiv.style.wordWrap = "break-word";
  debugDiv.style.cursor = "pointer";
  debugDiv.title = "Click to hide";

  debugDiv.addEventListener("click", () => {
    debugDiv.style.display = "none";
    setTimeout(() => {
      debugDiv.style.display = "block";
    }, 5000);
  });

  const style = document.createElement("style");
  style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0.3; transform: translateY(20px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0.8; transform: translateY(0); }
        }
    `;
  document.head.appendChild(style);

  const colors = getErrorColor(200);
  debugDiv.style.backgroundColor = colors.background;
  debugDiv.style.color = colors.color;
  debugDiv.textContent = "API Monitor Active";

  document.body.appendChild(debugDiv);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDebugElements);
} else {
  initializeDebugElements();
}

// Monitor network requests using Performance API
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (
      entry.initiatorType === "xmlhttprequest" ||
      entry.initiatorType === "fetch"
    ) {
      if (entry.responseStatus >= 400) {
        reportError(
          entry.responseStatus,
          entry.name,
          "Error detected by Performance API"
        );
      }
    }
  });
});

try {
  observer.observe({ entryTypes: ["resource"] });
} catch (e) {
  console.log("Performance API not available:", e);
}

console.log("✅ Content script setup complete");
