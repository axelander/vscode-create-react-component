const vscode = require('vscode');
const fs = require('fs-extra');
const path = require('path');

async function newComponent(filePath, type) {
  const dirPath = fs.lstatSync(filePath).isDirectory() ? filePath : path.dirname(filePath);
  try {
    const input = await vscode.window.showInputBox({ prompt: 'Component name', value: `${dirPath}/NewComponent`, valueSelection: [dirPath.length + 1, dirPath.length + 13] });
    const componentName = input.replace(`${dirPath}/`, '');
    const componentDir = `${dirPath}/${componentName}`;

    const pathExists = await fs.pathExists(componentDir);
    if (pathExists) {
      vscode.window.showErrorMessage(`Component ${componentName} already exists`);
      return;
    }

    await fs.ensureDir(componentDir);

    const compContent = await fs.readFile(path.resolve(__dirname, `./templates/${type}/Component.js`), 'utf8');
    await fs.outputFile(`${componentDir}/${componentName}.js`, compContent.replace(/{{COMPONENT_NAME}}/g, componentName));

    const indexContent = await fs.readFile(path.resolve(__dirname, `./templates/${type}/index.js`), 'utf8');
    await fs.outputFile(`${componentDir}/index.js`, indexContent.replace(/{{COMPONENT_NAME}}/g, componentName));

    let styleExtension = 'css';
    if (type === 'NativeComponent') styleExtension = 'styles.js';
    if (type === 'WebBemSassComponent') styleExtension = 'scss';

    let styles = await fs.readFileSync(path.resolve(__dirname, `./templates/${type}/Component.${styleExtension}`), 'utf8');
    styles = styles.replace(/{{COMPONENT_NAME}}/g, componentName)

    await fs.writeFile(`${componentDir}/${componentName}.${styleExtension}`, styles)

    const [file] = await vscode.workspace.findFiles(`**/${componentName}.js`);

    vscode.window.showTextDocument(file);
    vscode.window.showInformationMessage(`component ${componentName} created successfully!`);
  } catch (e) {
    vscode.window.showErrorMessage(`Failed to create component ${componentName}`);
  }
}

async function newWebComponent ({ path: filePath }) {
  await newComponent(filePath, 'WebComponent');
}

async function newNativeComponent({ path: filePath }) {
  await newComponent(filePath, 'NativeComponent');
}

async function newWebBemSassComponent ({ path: filePath }) {
  await newComponent(filePath, 'WebBemSassComponent');
}

function activate(context) {
  console.log('Congratulations, your extension "create-react-component" is now active!');

  context.subscriptions.push(vscode.commands.registerCommand('crc.newWebComponent', newWebComponent));
  context.subscriptions.push(vscode.commands.registerCommand('crc.newNativeComponent', newNativeComponent));
  context.subscriptions.push(vscode.commands.registerCommand('crc.newWebBemSassComponent', newWebBemSassComponent));
}
exports.activate = activate;
