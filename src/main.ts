import { Command, parseYaml, Plugin, TFile } from 'obsidian';
import { Base, PluginSettings } from './types';
import { generate } from "./generator";
import { SettingTab } from './settings';
import { getBases, getFiles } from './listeners/bases';

const defaultSettings: PluginSettings = {
	mode: "speed",
	folder: "thumbnails"
}

export default class ThumbnailPlugin extends Plugin {
	settings: PluginSettings;
	bases: Base[] = [];
	files: TFile[] = [];

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "thumbnail-generate-all",
			name: "Generate thumbnails",
			callback: async () => {
				let bases = await getBases(this);
				console.debug(bases);
				for (const base of bases) {
					// TODO: automatic rebuilding of thumbnails upon changes in base cards config
					// TODO: automatic rebulding of thumbnails upon changes in file
					// TODO: make this safer
					const width = parseYaml(base.content).views[0].cardSize as number;
					const height = width * parseYaml(base.content).views[0].imageAspectRatio;
					let files = getFiles(this.app, base);
					for (const file of files) {
						console.debug(file);
						if (file instanceof TFile) {
							console.debug(height, width)
							let path = await generate(this.app, this, file, height, width);
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
			}
		} as Command);

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

		this.registerInterval(window.setInterval(() => {
			(async () => {
				console.debug("Automatically looking for bases...");
				await getBases(this);
			})().catch(e => console.error("Thumbnails -", e));
		}, 10 * 1000));
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

