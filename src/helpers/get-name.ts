export const getNameFromPath = (path: string) : string|boolean =>{
	path = path.replace(/('|"|`)/g, "")
	const pattern = /\/([A-Z][^\/]*)\.\w+$/;
	const match = pattern.exec(path);

	if (match) {
		const variableName = match[1];
		return variableName;
	} else {
		return false;
	}
}