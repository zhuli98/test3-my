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
	let addPrefixFunc = vscode.commands.registerCommand("console-prefix.addPrefix", addPrefix);
  let deleteConFunc = vscode.commands.registerCommand("console-prefix.deleteConsole", deleteConsole);
  let hoverFunc = vscode.languages.registerHoverProvider("javascript", {
    provideHover: (res:any) => {
      return new vscode.Hover("hello222");
    },
  });

	context.subscriptions.push(addPrefixFunc);
  context.subscriptions.push(hoverFunc);
  context.subscriptions.push(deleteConFunc);
}

// 从下到上逐行删除console.log  点一次删一行 便于检查
function deleteConsole() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    let lineAll = 0
    for (let i = document.lineCount -1 ; i > 0 ; i--) {
      const line = document.lineAt(i);
      if (line.text.includes(`console.log('》======`) || line.text.includes(`console.log("》======`)) {
        setCursorPosition(i - 1 >= 0 ? i - 1 : 0, 0);
        lineAll++;
        setTimeout(()=>{
          editor.edit((editBuilder) => {
            editBuilder.delete(line.rangeIncludingLineBreak);
          });
        },500)
        break;
      }
    }
  }
}

// 光标移动到具体位置
function setCursorPosition(lineNumber:any, columnNumber:any) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const position = new vscode.Position(lineNumber, columnNumber);
    const selection = new vscode.Selection(position, position);
    editor.selection = selection;
    editor.revealRange(selection, vscode.TextEditorRevealType.InCenter);
  }
}

// 在选中的单词下一行加入console.log  如何
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
    const insertText = text ? `console.log('》======','${text}', Object.prototype.toString.call(${text}).split(' ')[1].split(']')[0], '======》',${text});` : "console.log();";
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
