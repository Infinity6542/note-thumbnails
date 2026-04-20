/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @microsoft/sdl/no-inner-html */
import { App, MarkdownRenderer, Component, TFile, WorkspaceLeaf, MarkdownView } from 'obsidian';
import { delay } from "./utils";
import { err } from "./types";
import ThumbnailPlugin from "./main";
import domtoimage from "dom-to-image-more";

export async function generate(app: App,
	plugin: ThumbnailPlugin,
	file: TFile,
	rHeight: number,
	rWidth: number,
	// Height and width are passed as ratio options, not physical pixel values
): Promise<string | err> {
	try {
		console.debug("Started generation");
		let div: HTMLElement;
		// if (app.vault.getAbstractFileByPath(".thumbnail")) {
		// 	await app.vault.createFolder(".thumbnail");
		// };
		const width = 1080;
		const height = Math.round(width * (rHeight / rWidth));

		let path = `${plugin.settings.folder}/${file.path}.jpg`
		switch (plugin.settings.mode) {
			case "speed": {
				const returned = await renderMD(app, file);
				div = returned instanceof HTMLElement ? returned : document.body.createDiv();
				console.debug(div);
				break;
			}
			case "quality": {
				const returned = await renderCM(app, file, height, width);
				div = returned instanceof HTMLElement ? returned : document.body.createDiv();
				console.debug(div);
				break;
			}
			default: {
				console.debug("e");
				div = document.createDiv();
			}
		}

		const title = document.createElement("h1");
		title.textContent = file.basename;
		div.prepend(title);

		div.style.width = `${width}px`;
		div.style.height = `${height}px`;
		const data = await domtoimage.toJpeg(div);
		const base64 = data.split(",")[1];
		if (!base64) throw new Error("[ERR] [TML] [GEN] Couldn't generate thumbnail");
		const binary = Uint8Array.from(atob(base64 as string), c => c.charCodeAt(0));
		const lock = app.vault.getFileByPath(path);
		if (lock) {
			await app.vault.modifyBinary(lock, binary);
		} else {
			await app.vault.createBinary(path, binary);
		}

		div.remove();
		return path;
	} catch (e) {
		const error: err = {
			code: -1,
			message: e,
		}
		console.debug(error);
		return error;
	}
}

async function renderMD(
	app: App,
	file: TFile,
) {
	try {
		console.debug("Rendering via MarkdownRenderer");
		const container = document.body.createDiv();
		container.addClass("markdown-preview-view", "markdown-rendered");
		if (document.body.hasClass("theme-dark")) container.addClass("theme-dark");
		document.body.appendChild(container);

		const content = await app.vault.read(file);
		const component = new Component();
		component.load();
		await MarkdownRenderer.render(app, content, container, file.path, component);
		await delay(500);

		component.unload();
		return container;
	} catch (e) {
		console.error(e);
		const returnObj: err = {
			code: -1,
			message: e,
		}
		return returnObj;
	}
}

async function renderCM(
	app: App,
	file: TFile,
	height: number,
	width: number,
) {
	try {
		console.debug("Rendering via CodeMirror");
		const leaf: WorkspaceLeaf = app.workspace.getLeaf(true);
		await leaf.openFile(file, { active: false });
		const view: MarkdownView = leaf.view as MarkdownView;
		const state = view.getState() as { mode: string };
		const container = document.body.createDiv();

		if (state.mode != "preview") {
			await view.setState({ mode: "preview" }, { history: false });
		}

		let html: string;

		// @ts-expect-error, not typed
		const cm = view.editor.cm;
		if (cm) {
			cm.viewState.printing = true;
			cm.measure();
			await delay(500);
			view.editor.scrollTo(0, Number.MAX_SAFE_INTEGER);
			await delay(500);

			const contentDiv = view.contentEl.querySelector(".cm-content.cm-lineWrapping");
			const tempDiv = document.createElement("div");
			tempDiv.className = "markdown-source-view mod-cm6 is-live-preview";

			tempDiv.innerHTML = contentDiv ? contentDiv.innerHTML : "";

			tempDiv.querySelectorAll(".cm-active").forEach(el => el.removeClass("cm-active"));
			tempDiv.querySelectorAll(".edit-block-button, .callout-fold, .cm-widgetBuffer, .table-col-drag-handle, .cm-fold-indicator, .table-row-btn, .table-row-drag-handle, .table-col-btn, .table-row-drag-handle").forEach(el => el.remove());

			const styles = `
        <style>
          .export-image-root .list-bullet {
              margin-left: -24px !important;
          }
          .export-image-root .cm-formatting.cm-formatting-list.cm-formatting-list-ul.cm-list-1 {
              margin-left: 12px !important;
          }
          .export-image-root .list-bullet:after {
              left: 10px !important;
          }
        </style>
      `;

			html = `<div class="thumbnail-cm-renderer-container markdown-source-view mod-cm6 is-live-preview" style="height: ${height}px; width: ${width}px;">
					${styles}
					${tempDiv.innerHTML}
					</div>`

			cm.viewState.printing = false;
			cm.measure();
		} else {
			html = "";
		}

		container.innerHTML = html;
		await delay(500);
		leaf.detach();
		return container;
	} catch (e) {
		console.error(e);
		const returnObj: err = {
			code: -1,
			message: e,
		};
		return returnObj;
	}
}
