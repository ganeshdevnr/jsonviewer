import * as vscode from 'vscode';
import * as _ from 'lodash';


export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.transformJson', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.languageId === 'json') {
            const transformedJson = await showInputAndGetTransformedJson(activeEditor.document);
            if (transformedJson) {
                const transformedDoc = await vscode.workspace.openTextDocument({ content: transformedJson, language: 'json' });
                await vscode.window.showTextDocument(transformedDoc);
            }
        } else {
            vscode.window.showErrorMessage('Please open a JSON file before running this command.');
        }
    });

    context.subscriptions.push(disposable);
}

async function showInputAndGetTransformedJson(document: vscode.TextDocument): Promise<string | undefined> {
    const jsonContent = document.getText();
    const transformedJson = await vscode.window.showInputBox({
        prompt: 'Enter a lodash function to transform the JSON',
        placeHolder: 'Example: _.pick(json, ["name", "age"])',
    });

    if (transformedJson) {
        try {
            const lodashFn = eval(`(function(json) { return ${transformedJson}; })`);
            const transformedResult = lodashFn(JSON.parse(jsonContent));
            return JSON.stringify(transformedResult, null, 2);
        } catch (error: any) {
            vscode.window.showErrorMessage('Error occurred while transforming JSON: ' + error.message);
        }
    }

    return undefined;
}

export function deactivate() {}
