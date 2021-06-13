chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.sync.get('savedTabGroups', result => {
		console.log(result.savedTabGroups)
		if(!result.savedTabGroups) {
			chrome.storage.sync.set({savedTabGroups: []})
		}
	})
	console.log(chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }));
	// chrome.storage.sync.set({savedTabGroups: []})
});
