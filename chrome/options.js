// Saves options to chrome.storage
function saveOptions() {
  var developerMode = document.getElementById('developer-mode').checked;
  chrome.storage.sync.set({
    developerMode: developerMode
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    developerMode: false
  }, function(items) {
    document.getElementById('developer-mode').checked = items.developerMode;
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('developer-mode').addEventListener('click',
    saveOptions);
