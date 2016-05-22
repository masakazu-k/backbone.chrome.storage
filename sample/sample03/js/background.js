
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // Writting your specifiec code here.
        return chromeStorageAdapter(request, sendResponse);
    });
console.log("extensionId", chrome.runtime.id);