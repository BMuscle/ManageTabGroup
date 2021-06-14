/**
 * キャメルケースへ変換 sampleString
 * @param string
 * @return string
 */
 function camelCase(str){
  str = str.charAt(0).toLowerCase() + str.slice(1);
  return str.replace(/[-_](.)/g, function(match, group1) {
      return group1.toUpperCase();
  });
}

function save_option(key, value) {
  chrome.storage.sync.set({ [key]: value })
}

function checkEvent(event) {
	save_option(this.key, event.target.checked)
}

function registCheckbox(id) {
  let element = document.getElementById(id)
	element.addEventListener('click', { key: camelCase(id), handleEvent: checkEvent });
  chrome.storage.sync.get('activatesTheTabGroupWhenOpened', result => {
    element.checked = result.activatesTheTabGroupWhenOpened;
  })
}

registCheckbox('activates_the_tab_group_when_opened');
