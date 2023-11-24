// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "zhuzhu" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand("console-prefix.addPrefix", addPrefix
	// () => {
    // // The code you place here will be executed every time your command is executed
    // // Display a message box to the user
    // vscode.window.showInformationMessage("addPrefix from zhuzhu!");
  	// }
  );

	context.subscriptions.push(disposable);
}

async function addPrefix() {
  vscode.window.showInformationMessage("zhuzhu addPrefix~~");
  // 获取当前打开的文件的editor
  const editor = vscode.window.activeTextEditor;
  // editor === undefind 表示没有打开的文件
  if (!editor) {
    return;
  }
  const textArray: Array<string> = [];
  // 当前被选中文本的位置信息数组（实际上就是range组成的数组）,如果没有手动选中自动帮他选中
  let ranges = editor.selections;
  if (ranges.every((item) => item.isEmpty)) {
    // 自动选中左边单词
    await vscode.commands.executeCommand("cursorWordLeftSelect");
    ranges = editor.selections;
  }
  ranges.forEach((range) => {
    // 通过位置信息拿到被选中的文本，然后拼接要插入的log
    const text = editor.document.getText(range);
    const insertText = text ? `console.log('${text}', Object.prototype.toString.call(${text}).split(' ')[1].split(']')[0], '========',${text});` : "console.log();";
    textArray.push(insertText);
  });

  // “光标换行” 调用vscode内置的换行命令，所有focus的光标都会换行
  vscode.commands.executeCommand("editor.action.insertLineAfter").then(() => {
    const positionList: Array<any> = [];
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const ranges = editor.selections;
    ranges.forEach((range, index) => {
      // 通过range拿到start位置的position
      const position = new vscode.Position(range.start.line, range.start.character);
      positionList.push(position);
    });
    // 编辑当前文件
    editor.edit((editBuilder) => {
      positionList.forEach((position, index) => {
        // 通过”坐标点“插入我们之前预设好的log文本
        editBuilder.insert(position, textArray[index]);
      });
    });
  });
}
// This method is called when your extension is deactivated
export function deactivate() {}
