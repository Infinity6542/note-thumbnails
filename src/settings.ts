import { PluginSettingTab, App, Setting, TFolder, debounce } from "obsidian";
import ThumbnailPlugin from "./main";
import { FolderSelector } from "components";

export class SettingTab extends PluginSettingTab {
	plugin: ThumbnailPlugin;

	constructor(app: App, plugin: ThumbnailPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Mode")
			.addDropdown((d) => d
				.addOption("speed", "Faster")
				.addOption("quality", "Quality")
				.setValue(this.plugin.settings.mode)
				.onChange(async (value) => {
					this.plugin.settings.mode = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Folder path")
			.setDesc("The folder to store thumbnails.")
			.addText((text) => {
				const validate = (path: string) => {
					const folder = this.app.vault.getAbstractFileByPath(path);
					const valid = folder && folder instanceof TFolder;
					text.inputEl.toggleClass("note-thumbnails-error-input", !valid);
					text.inputEl.title = valid ? "" : "Invalid folder";
				}

				const saveAndValidate = async (v: string) => {
					this.plugin.settings.folder = v;
					await this.plugin.saveSettings();
					validate(v);
				}

				const debounceUpdate = debounce(saveAndValidate, 250);

				text.setValue(this.plugin.settings.folder)
				.onChange((v) => {
						debounceUpdate(v);
					})

				validate(this.plugin.settings.folder);

				new FolderSelector(this.app, text.inputEl);
			})
	}
}
