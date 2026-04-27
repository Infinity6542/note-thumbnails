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

		this.addRibbonIcon("documents", "Create thumbnails", async () => {
			let bases = await getBases(this.app);
			console.debug(bases);
			for (const base of bases) {
				console.debug(base);
				let files = getFiles(this.app, base);
				for (const file of files) {
					console.debug(file);
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
				};
			};
		});

		this.addRibbonIcon("document", "Create thumbnail for this document", async () => {
			const file = this.app.workspace.getActiveFile();

			if (file instanceof TFile && file.extension != "base") {
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
		})

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

