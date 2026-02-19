import Electrobun, { ApplicationMenu, BrowserWindow, Screen, Utils } from "electrobun/bun";

const APP_URL = "https://messages.google.com/web/conversations";
const ELECTROBUN_GITHUB_URL = "https://github.com/blackboardsh/electrobun";
const UNREAD_COUNT_REGEX = /^\((\d+)\)\s/;

ApplicationMenu.setApplicationMenu([
	{
		submenu: [
			{ label: "About Messages", action: "app-about" },
			{ type: "separator" },
			{ role: "quit" },
		],
	},
	{
		label: "File",
		submenu: [{ role: "close" }],
	},
	{
		label: "Edit",
		submenu: [
			{ label: "Undo", action: "edit-undo", accelerator: "z" },
			{ label: "Redo", action: "edit-redo", accelerator: "shift+z" },
			{ type: "separator" },
			{ label: "Cut", action: "edit-cut", accelerator: "x" },
			{ label: "Copy", action: "edit-copy", accelerator: "c" },
			{ label: "Paste", action: "edit-paste", accelerator: "v" },
			{
				label: "Paste and Match Style",
				action: "edit-paste-match-style",
				accelerator: "shift+option+v",
			},
			{ label: "Delete", action: "edit-delete" },
			{ label: "Select All", action: "edit-select-all", accelerator: "a" },
		],
	},
	{
		label: "View",
		submenu: [{ role: "toggleFullScreen" }],
	},
	{
		label: "Window",
		submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "bringAllToFront" }],
	},
]);

const primaryDisplay = Screen.getPrimaryDisplay();
const windowWidth = 1180;
const windowHeight = 820;
const windowX = Math.round((primaryDisplay.workArea.width - windowWidth) / 2) + primaryDisplay.workArea.x;
const windowY = Math.round((primaryDisplay.workArea.height - windowHeight) / 2) + primaryDisplay.workArea.y;

const mainWindow = new BrowserWindow({
	title: "Messages",
	url: APP_URL,
	partition: "persist:google-messages",
	titleBarStyle: "default",
	frame: {
		width: windowWidth,
		height: windowHeight,
		x: windowX,
		y: windowY,
	},
});

let lastPageTitle = "";
let lastUnreadCount: number | null = null;

const checkUnreadCount = async (): Promise<void> => {
	try {
		const title = await mainWindow.webview.rpc.request.evaluateJavascriptWithResponse({
			script: "document.title",
		});

		if (typeof title !== "string" || title === lastPageTitle) {
			return;
		}

		lastPageTitle = title;
		const match = title.match(UNREAD_COUNT_REGEX);
		const unreadCount = match ? Number(match[1]) : 0;

		if (lastUnreadCount === null) {
			lastUnreadCount = unreadCount;
			return;
		}

		if (unreadCount > lastUnreadCount) {
			const newMessages = unreadCount - lastUnreadCount;
			Utils.showNotification({
				title: "Messages",
				body:
					newMessages === 1
						? "You have a new message."
						: `You have ${newMessages} new messages.`,
			});
		}

		lastUnreadCount = unreadCount;
	} catch {
		// Ignore transient script/navigation errors while pages load.
	}
};

const unreadPollTimer = setInterval(() => {
	void checkUnreadCount();
}, 5000);

mainWindow.webview.on("dom-ready", () => {
	void checkUnreadCount();
});

mainWindow.webview.on("did-navigate", () => {
	lastPageTitle = "";
	lastUnreadCount = null;
	void checkUnreadCount();
});

const runEditCommand = (action: string): void => {
	if (action === "edit-paste" || action === "edit-paste-match-style") {
		const clipboardText = Utils.clipboardReadText();
		const escapedText = JSON.stringify(clipboardText);
		mainWindow.webview.executeJavascript(`
			(() => {
				const target = document.activeElement;
				if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
					return false;
				}
				const value = ${escapedText};
				const start = target.selectionStart ?? target.value.length;
				const end = target.selectionEnd ?? start;
				target.setRangeText(value, start, end, "end");
				target.dispatchEvent(new Event("input", { bubbles: true }));
				return true;
			})();
		`);
		return;
	}

	const commandByAction: Record<string, string> = {
		"edit-undo": "undo",
		"edit-redo": "redo",
		"edit-cut": "cut",
		"edit-copy": "copy",
		"edit-delete": "delete",
		"edit-select-all": "selectAll",
	};

	const command = commandByAction[action];
	if (!command) {
		return;
	}

	mainWindow.webview.executeJavascript(`document.execCommand(${JSON.stringify(command)});`);
};

Electrobun.events.on("application-menu-clicked", async (event) => {
	if (event.data.action === "app-about") {
		const result = await Utils.showMessageBox({
			type: "info",
			title: "About Messages",
			message: "A cross-platform Google Messages app powered by Electrobun",
			buttons: ["OK", "Electrobun GitHub"],
			defaultId: 0,
			cancelId: 0,
		});

		if (result.response === 1) {
			Utils.openExternal(ELECTROBUN_GITHUB_URL);
		}

		return;
	}

	runEditCommand(event.data.action);
});

mainWindow.webview.setNavigationRules([
	"^*",
	"*://messages.google.com/*",
	"*://accounts.google.com/*",
	"*://*.google.com/*",
	"^http://*",
]);

mainWindow.webview.on("new-window-open", (event) => {
	if (event.detail.url) {
		Utils.openExternal(event.detail.url);
	}
});

mainWindow.on("close", () => {
	clearInterval(unreadPollTimer);
	Utils.quit();
});

console.log("Google Messages wrapper started");
