const colors = {
	grey: { backgroundColor: "#606367", color: "#fff" },
	blue: { backgroundColor: "#3873e0", color: "#fff" },
	red: { backgroundColor: "#c84031", color: "#fff" },
	yellow: { backgroundColor: "#d5792d", color: "#202124" },
	green: { backgroundColor: "#458b47", color: "#fff" },
	pink: { backgroundColor: "#bf3182", color: "#fff" },
	purple: { backgroundColor: "#883ede", color: "#fff" },
	cyan: { backgroundColor: "#357981", color: "#fff" },
	orange: { backgroundColor: "#ffa500", color: "#fff" }
}

function generateUuid() {
	let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
	for (let i = 0, len = chars.length; i < len; i++) {
		switch (chars[i]) {
			case "x":
				chars[i] = Math.floor(Math.random() * 16).toString(16);
				break;
			case "y":
				chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
				break;
		}
	}
	return chars.join("");
}

function openTabGroup() {
	let tabGroup = this.tabGroup
	if (tabGroup.tabs.length > 0) {
		// 1つめはグループを作成する
		chrome.tabs.create({ active: false, url: tabGroup.tabs[0].url }).then(createdTab => {
			chrome.tabs.group({ tabIds: [createdTab.id] }).then(async groupId => {
				// groupのアップデート
				chrome.storage.sync.get('activatesTheTabGroupWhenOpened', async result => {
					chrome.tabGroups.update(groupId, { title: tabGroup.title, color: tabGroup.color, collapsed: !result.activatesTheTabGroupWhenOpened })
					// 2つめ以降はグループに追加していく
					for (let i = 1; i < tabGroup.tabs.length; i++) {
						let createdTab = await chrome.tabs.create({ active: false, url: tabGroup.tabs[i].url })
						chrome.tabs.group({ groupId: groupId, tabIds: [createdTab.id] })
					}
					reloadCurrentTabGroups();
				})
			})
		})
	}
}

function saveTabGroup() {
	let tabGroup = this.tabGroup // 参照できるように
	chrome.storage.sync.get('savedTabGroups', result => {
		chrome.tabs.query({ windowId: tabGroup.windowId }).then(tabs => {
			let filteredTabs = tabs.filter(tab => tab.groupId == tabGroup.id)
			chrome.storage.sync.set({ savedTabGroups: result.savedTabGroups.concat({ uuid: generateUuid(), title: tabGroup.title, color: tabGroup.color, tabs: filteredTabs }) }, () => {
				reloadSavedTabGroups();
			})
		})
	})
}

function trashTabGroup() {
	let tabGroup = this.tabGroup // 参照できるように
	chrome.storage.sync.get('savedTabGroups', result => {
		chrome.storage.sync.set({ savedTabGroups: result.savedTabGroups.filter(savedTabGroup => savedTabGroup.uuid !== tabGroup.uuid) }, () => {
			reloadSavedTabGroups();
		})
	})
}

function closeTabGroup() {
	let tabGroup = this.tabGroup // 参照できるように
	chrome.tabs.query({ windowId: tabGroup.windowId }).then(tabs => {
		let filteredTabIds = tabs.filter(tab => tab.groupId == tabGroup.id).map(tab => tab.id)
		chrome.tabs.remove(filteredTabIds).then(() => {
			reloadCurrentTabGroups();
		});
	})
}

function reloadSavedTabGroups() {
	chrome.storage.sync.get("savedTabGroups", result => {
		let savedTabGroupsElement = document.getElementById("saved_tab_group_contents");
		while (savedTabGroupsElement.firstChild) {
			savedTabGroupsElement.removeChild(savedTabGroupsElement.firstChild);
		}
		// window.alert(`タブグループ現状 ${result.savedTabGroups}`)
		result.savedTabGroups.forEach(savedTabGroup => {
			// 親要素のtabGroup要素の作成
			let tabGroupElementContent = document.createElement("div");
			tabGroupElementContent.className = "saved-tab-group-content";
			// 子要素 開くボタン
			let tabGroupElement = document.createElement("button"); // これのさらに親を作成し、削除ボタンを追加する
			tabGroupElement.className = "saved-tab-group";
			tabGroupElement.innerHTML = savedTabGroup.title;
			tabGroupElement.style.backgroundColor = colors[savedTabGroup.color].backgroundColor;
			tabGroupElement.style.color = colors[savedTabGroup.color].color;
			tabGroupElement.addEventListener("click", { tabGroup: savedTabGroup, handleEvent: openTabGroup });
			tabGroupElementContent.appendChild(tabGroupElement);
			// 子要素 削除ボタン
			let tabGroupTrashElement = document.createElement("img"); // これのさらに親を作成し、削除ボタンを追加する
			tabGroupTrashElement.src = "./resources/trash.svg";
			tabGroupTrashElement.className = "saved-tab-group-trash";
			tabGroupTrashElement.addEventListener("click", { tabGroup: savedTabGroup, handleEvent: trashTabGroup });
			tabGroupElementContent.appendChild(tabGroupTrashElement);

			savedTabGroupsElement.appendChild(tabGroupElementContent);
		})
	})
}

function reloadCurrentTabGroups() {
	//tabGroup一覧を取得し、popupに表示する
	chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }).then((currentTabGroups) => {
		let currentTabGroupsElement = document.getElementById("current_tab_group_contents");
		while (currentTabGroupsElement.firstChild) {
			currentTabGroupsElement.removeChild(currentTabGroupsElement.firstChild);
		}
		currentTabGroups.forEach(currentTabGroup => {
			// 親要素のtabGroup要素の作成
			let tabGroupElementContent = document.createElement("div");
			tabGroupElementContent.className = "current-tab-group-content";
			// 子要素 開くボタン
			let tabGroupElement = document.createElement("button");
			tabGroupElement.className = 'current-tab-group';
			tabGroupElement.innerHTML = currentTabGroup.title;
			tabGroupElement.style.backgroundColor = colors[currentTabGroup.color].backgroundColor;
			tabGroupElement.style.color = colors[currentTabGroup.color].color;
			tabGroupElement.addEventListener('click', { tabGroup: currentTabGroup, handleEvent: saveTabGroup });
			tabGroupElementContent.appendChild(tabGroupElement);
			// 子要素 閉じるボタン
			let tabGroupCloseElement = document.createElement("img");
			tabGroupCloseElement.src = "./resources/close.svg";
			tabGroupCloseElement.className = "saved-tab-group-close";
			tabGroupCloseElement.addEventListener("click", { tabGroup: currentTabGroup, handleEvent: closeTabGroup });
			tabGroupElementContent.appendChild(tabGroupCloseElement);
			// tabGroup要素の追加
			currentTabGroupsElement.appendChild(tabGroupElementContent);
		})
	})
}

reloadSavedTabGroups();
reloadCurrentTabGroups();
