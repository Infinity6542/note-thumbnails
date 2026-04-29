import { App, TFile, parseYaml } from "obsidian";
import { Base } from "../types";
import ThumbnailPlugin from "main";

type Filter =
	| undefined
	| string
	| { and: Filter[] }
	| { or: Filter[] }
	| { not: Filter[] };

interface Schema {
	filters?: Filter;
	views?: Array<{ filters: Filter;[key: string]: unknown }>;
}

export async function getBases(plugin: ThumbnailPlugin): Promise<Array<Base>> {
	const files = plugin.app.vault.getFiles().filter((v) => v.extension === "base");
	const bases: Array<Base> = [];
	for (const file of files) {
		const base = plugin.bases.find((f) => f.path == file.path);
		if (base) {
			plugin.bases.remove(base);
		}
		bases.push({
			path: file.path,
			file: file,
			content: await plugin.app.vault.read(file),
		});
	}
	plugin.bases = bases;
	return bases;
}

export function getFiles(app: App, base: Base) {
	const parsed = parseYaml(base.content) as Schema;
	const files = app.vault.getFiles();
	const globalFilters: Filter = parsed.filters;
	return files.filter((f) => match(app, f, globalFilters));
}

function match(app: App, file: TFile, node: Filter): boolean {
	if (node) {
		if (typeof node === "string") return filter(app, file, node);
		if ("and" in node) return node.and.every((f) => match(app, file, f));
		if ("or" in node) return node.or.some((f) => match(app, file, f));
		if ("not" in node) return node.not.every((f) => !match(app, file, f));
	}
	return true;
}

function resolveProperty(file: TFile, frontmatter: Record<string, unknown>, path: string): unknown {
	if (path.startsWith("file.")) {
		switch (path.slice(5)) {
			case "basename": return file.basename;
			case "name": return file.name;
			case "fullname": return file.name;
			case "ext": return file.extension;
			case "path": return file.path;
			case "folder": return file.parent?.path ?? "";
			case "size": return file.stat.size;
			case "ctime": return file.stat.ctime;
			case "mtime": return file.stat.mtime;
			case "tags": return frontmatter.tags ?? [];
		}
	}
	if (path.startsWith("note.")) return frontmatter[path.slice(5)];
	return frontmatter[path];
}

function filter(app: App, file: TFile, expr: string): boolean {
	if (expr.startsWith("!")) {
		return !filter(app, file, expr.slice(1));
	}

	const cache = app.metadataCache.getFileCache(file);
	const frontmatter = cache?.frontmatter ?? {};

	// file.hasTag("tag")
	const hasTagMatch = expr.match(/^file\.hasTag\("(.+?)"\)$/);
	if (hasTagMatch?.[1]) {
		const tags = (cache?.tags ?? []).map((t) => t.tag.replace("#", ""));
		return tags.includes(hasTagMatch[1]);
	}

	// file.hasLink("note")
	const hasLinkMatch = expr.match(/^file\.hasLink\("(.+?)"\)$/);
	if (hasLinkMatch?.[1]) {
		return (cache?.links ?? []).some((l) => l.link === hasLinkMatch[1]);
	}

	// file.hasProperty("key")
	const hasPropMatch = expr.match(/^file\.hasProperty\("(.+?)"\)$/);
	if (hasPropMatch?.[1]) {
		return hasPropMatch[1] in frontmatter;
	}

	// file.inFolder("folder")
	const inFolderMatch = expr.match(/^file\.inFolder\("(.+?)"\)$/);
	if (inFolderMatch?.[1]) {
		return file.path.startsWith(inFolderMatch[1]);
	}

	// file.*.contains("value") / file.*.containsAny("value") / file.*.containsAll("value")
	const containsMatch = expr.match(/^([\w.]+)\.(contains|containsAny|containsAll)\("(.+?)"\)$/);
	if (containsMatch?.[1] && containsMatch[2] && containsMatch[3]) {
		const [, path, method, arg] = containsMatch as [string, string, string, string];
		const value = stringify(resolveProperty(file, frontmatter, path));
		const args = arg.split(",").map((a) => a.trim());

		switch (method) {
			case "contains": return value.includes(arg);
			case "containsAny": return args.some((a) => value.includes(a));
			case "containsAll": return args.every((a) => value.includes(a));
		}
	}

	// Comparison: file.name == "x", file.folder != "ass", price > 2
	const compMatch = expr.match(/^([\w.]+)\s*(==|!=|>=|<=|>|<)\s*"?([^"]*)"?$/);
	if (compMatch?.[1] && compMatch[2] && compMatch[3] !== undefined) {
		const [, path, op, val] = compMatch as [string, string, string, string];
		const fileVal = resolveProperty(file, frontmatter, path);

		switch (op) {
			case "==": return stringify(fileVal) === val;
			case "!=": return stringify(fileVal) !== val;
			case ">": return Number(fileVal) > Number(val);
			case "<": return Number(fileVal) < Number(val);
			case ">=": return Number(fileVal) >= Number(val);
			case "<=": return Number(fileVal) <= Number(val);
		}
	}

	return true;
}

function stringify(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (Array.isArray(value)) return value.join(", ");
	if (typeof value === "object") return JSON.stringify(value);
	if (typeof value === "number" || typeof value === "boolean") return value.toString();
	if (typeof value === "string") return value;
	return "";
}
