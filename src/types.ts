import { TFile, TFolder, SearchResult } from "obsidian";

export interface PluginSettings {
	mode: string; // only speed and quality are accepted
	folder: string;
}

export interface err {
	code: number;
	message?: unknown;
}

export interface FolderMatch {
	item: TFolder;
	match: SearchResult;
}

export interface Base {
	path: string;
	file: TFile;
	content: string;
	cardsIndex: number;
}

export interface BaseSchema {
	filters?: Filter;
	views: Array<{ filters: Filter;type: string;[key: string]: unknown }>;
}

export type Filter =
	| undefined
	| string
	| { and: Filter[] }
	| { or: Filter[] }
	| { not: Filter[] };
