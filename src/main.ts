import { Plugin, TFile } from 'obsidian';
import { PluginSettings } from './types';
import { generate } from "./generator";
import { SettingTab } from './settings';

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
				await generate(this.app, this, file, 16, 9);
			} else {
				console.error("Not a file open, not generating thumbnail.");
				return;
			}
		});

		this.addSettingTab(new SettingTab(this.app, this));
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

