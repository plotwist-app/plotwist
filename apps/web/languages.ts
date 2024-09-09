import { Language } from "@/types/languages";

export type SupportedLanguages = {
	label: string;
	value: Language;
	country: string;
	enabled: boolean;
	hreflang: string;
};

export const SUPPORTED_LANGUAGES: Array<SupportedLanguages> = [
	{
		label: "English",
		value: "en-US",
		country: "US",
		enabled: true,
		hreflang: "en-us",
	},
	{
		label: "Español",
		value: "es-ES",
		country: "ES",
		enabled: true,
		hreflang: "es-ES",
	},
	{
		label: "Français",
		value: "fr-FR",
		country: "FR",
		enabled: true,
		hreflang: "fr-FR",
	},
	{
		label: "Deutsch",
		value: "de-DE",
		country: "DE",
		enabled: true,
		hreflang: "de-DE",
	},
	{
		label: "Italiano",
		value: "it-IT",
		country: "IT",
		enabled: true,
		hreflang: "it-IT",
	},
	{
		label: "Português",
		value: "pt-BR",
		country: "BR",
		enabled: true,
		hreflang: "pt-BR",
	},
	{
		label: "日本語",
		value: "ja-JP",
		country: "JP",
		enabled: true,
		hreflang: "ja-JP",
	},
];

export const languages: Language[] = [
	"en-US",
	"es-ES",
	"fr-FR",
	"de-DE",
	"it-IT",
	"pt-BR",
	"ja-JP",
];
