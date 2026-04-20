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
			await generate(this.app, this, this.app.workspace.getActiveFile() as TFile, 16, 9);
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

