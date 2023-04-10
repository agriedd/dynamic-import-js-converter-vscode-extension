export interface DynamicImport {
	path: string,
	match: string,
	name: string,
	index: number,
	static: string|null|StaticImport,
}
export interface StaticImport {
	name: string,
	render: string,
	match: string,
}