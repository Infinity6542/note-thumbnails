import { Plugin, TFile } from 'obsidian';
import { PluginSettings } from './types';
import { generate } from "./generator";
import { SettingTab } from './settings';
import { getBases, getFiles } from './listeners/bases';

const defaultSettings: PluginSettings = {
	mode: "speed",
	folder: "thumbnails"
}

export default class ThumbnailPlugin extends Plugin {
	settings: PluginSettings;
	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("document", "Create thumbnail", async () => {
			const file = this.app.workspace.getActiveFile();
			if (file instanceof TFile) {
				let path = await generate(this.app, this, file, 16, 9);
				if (typeof path === "string") {
					await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
						frontmatter["thumbnail"] = `[[${path}]]`;
					});
				}
			} else {
				console.error("Not a file open, not generating thumbnail.");
				return;
			}
		});

		this.addSettingTab(new SettingTab(this.app, this));

		let bases = await getBases(this.app);
		bases.forEach((base) => {
			console.debug(getFiles(this.app, base));
		});
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			defaultSettings,
			await this.loadData() as Partial<PluginSettings>
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

