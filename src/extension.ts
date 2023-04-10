// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DynamicImport, StaticImport } from './types/extension';
import { getNameFromPath } from './helpers/get-name';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dynamic-import-js-converter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('dynamic-import-js-converter.dynamicToStaticImport', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from Dynamic Import JS Converter!');
		let activeDocument: vscode.TextDocument|undefined = vscode.window.activeTextEditor?.document;
		console.log("Ok!");
		console.log("type", activeDocument?.languageId);
		
		if(activeDocument?.languageId === "javascript"){
			/**
			 * menghapus komentar
			 * 
			 */
			let cleanCode : string = activeDocument.getText().replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
			let regexMatcher = new RegExp(/\(\s*\)\s*=>\s*import\(\s*(['"`][^'"`]*['"`])\s*\)/, 'g');
			let matchs = cleanCode.matchAll(regexMatcher);

			let match : IteratorResult<RegExpMatchArray, any>;
			let dynamicImportList: DynamicImport[] = [];
			let index : number = 0;
			while(!(match = matchs.next())?.done){
				if(match?.value?.length && (match?.value[1] ?? false)){
					let name: string|boolean = getNameFromPath(match.value[1]);
					dynamicImportList.push({
						name: typeof name === "string" ? name : "TanpaNama",
						index,
						path: match.value[1],
						match: match.value[0],
						static: null
					});
					index++;
				}
			}
			let staticImportList: StaticImport[] = []
			dynamicImportList.forEach((e: DynamicImport) => {
				// TODO: cek dengan path
				let indexFound : number = staticImportList.findIndex(stat => stat.name === e.name);
				let exists : boolean = indexFound >= 0;
				let staticItem : StaticImport|null = null;

				if(exists){
					staticItem = staticImportList[indexFound];
				} else {
					staticItem = {
						name: e.name,
						render: `import ${e.name} from ${e.path};`,
						match: e.match
					};
					staticImportList.push(staticItem);
					staticItem = staticImportList[indexFound];
				}
				e.static = staticItem
			});
			let toRenderStatic: string = staticImportList.filter(e => activeDocument?.getText().search(e.render)).map(e => e.render).join("\n") + "\n\n";
			vscode.window.activeTextEditor?.edit((editBuilder) => {
				if(activeDocument){
					const pattern = /^((import\s+[^'"]+\s+from\s+['"][^'"]+['"];\s*)+)|(import\s+[^'"]+\s+from\s+['"][^'"]+['"];?)$/gm;
					const hasImport = pattern.exec(activeDocument.getText());
			
					let newDoc : string = "";
					
					if (hasImport) {
						newDoc = activeDocument.getText().replace(/^((import\s+[^'"]+\s+from\s+['"][^'"]+['"];\s*)+)|(import\s+[^'"]+\s+from\s+['"][^'"]+['"];?)$/gm, "$1" + toRenderStatic.toString());
					} else {
						newDoc = activeDocument.getText().replace(/^.*$/m, toRenderStatic.toString());
					}
					
					staticImportList.forEach(e => {
						newDoc = newDoc.replaceAll(e.match, e.name);
					});

					editBuilder.replace(new vscode.Range(activeDocument.lineAt(0).range.start, activeDocument.lineAt(activeDocument.lineCount - 1).range.end), newDoc);
					activeDocument.save();
				}
			});
			
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
