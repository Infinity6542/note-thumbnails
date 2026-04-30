import { Command, parseYaml, Plugin, TFile } from 'obsidian';
import { Base, BaseSchema, PluginSettings } from './types';
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
					const parsed = parseYaml(base.content) as BaseSchema;
					console.debug(parseYaml(base.content));
					let width, height;
					const view = parsed.views[base.cardsIndex];
					if (parsed.views && view) {
						width = view.cardSize as number;
						height = width * (view.imageAspectRatio as number);
					} else {
						width = 1080;
						height = 1920;
					}

					let files = getFiles(this.app, base);
					for (const file of files) {
						if (file instanceof TFile) {
							if (!this.files.find((f) => f === file)) {
								this.files.push(file);
							}
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

		// this.registerEvent(
		// 	this.app.vault.on("modify", async (file: TAbstractFile) => {
		// 		const base = this.bases.find((f) => f.file === file);
		// 		if (!base) return;
		//
		// 		const parsed = parseYaml(base.content) as BaseSchema;
		// 		console.debug(parseYaml(base.content));
		// 		let width, height;
		// 		const view = parsed.views[base.cardsIndex];
		// 		if (parsed.views && view) {
		// 			width = view.cardSize as number;
		// 			height = width * (view.imageAspectRatio as number);
		// 		} else {
		// 			width = 1080;
		// 			height = 1920;
		// 		}
		// 		if (file instanceof TFile && base) {
		// 			const files = getFiles(this.app, base);
		// 			for (const file of files) {
		// 				if (file instanceof TFile) {
		// 					if (!this.files.find((f) => f === file)) {
		// 						this.files.push(file);
		// 					}
		// 					let path = await generate(this.app, this, file, height, width);
		// 					if (typeof path === "string") {
		// 						await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
		// 							frontmatter["thumbnail"] = `[[${path}]]`;
		// 						});
		// 					}
		// 				} else {
		// 					console.error("Not a file open, not generating thumbnail.");
		// 					return;
		// 				}
		// 			};
		// 		}
		// 	}),
		// );

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

