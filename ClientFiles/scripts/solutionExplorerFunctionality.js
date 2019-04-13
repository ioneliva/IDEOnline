//Note for this entire file - variable clickedItem is a global initialized in solutionExplorerUI
document.getElementById("openInTab").addEventListener("mousedown", openInTab);

//open selected file into tab and editor
function openInTab() {
	let tab = document.getElementById(formatForTabId(clickedItem.id));

	if (tab) {		//if file is already present in tabs, we only open that tab
		setActiveTab(tab);
		setActiveEditor(getEditorLinkedTo(tab));
	} else {		//create new tab, named as the file
		let tab = createTabFor(clickedItem.id);
		setActiveTab(tab);
		let editor = attachNewEditorFor(tab);
		setActiveEditor(editor);
	}
}
