export type ProductionCountry = {
	iso_3166_1: string
	name: string
};

export type ProductionCompany = {
	id: number;
	logo_path: string;
	name: string;
	origin_country: string;
};

export type SpokenLanguage = {
	english_name: string;
	iso_639_1: string;
	name: string;
};

export type Genre = {
	id: number;
	name: string;
};
