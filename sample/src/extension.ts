import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "dryrun" is now active!');

	context.subscriptions.push(
		vscode.commands.registerCommand('dryrun.helloWorld', () => {
			vscode.window.showInformationMessage('Hello World from dryrun!!');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('dryrun.helloName', () => {
			vscode.window.showWarningMessage('Hello World from Ascentic!!');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('dryrun.toggleComment', () => {
			vscode.commands.executeCommand('editor.action.commentLine');
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
