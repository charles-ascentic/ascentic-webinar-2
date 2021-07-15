import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	let panel: vscode.WebviewPanel;

	context.subscriptions.push(
		vscode.commands.registerCommand('dryrun-codeman.chat', async () => {
			const message = await vscode.window.showInputBox({
				title: "Chat Box",
				prompt: "Enter your message"
			});
			
			panel.webview.postMessage({ message });
		})
	);

	context.subscriptions.push(vscode.commands.registerCommand('dryrun-codeman.start', () => {
		panel = vscode.window.createWebviewPanel(
			'codeman',
			'Code Man',
			vscode.ViewColumn.One,
			{ 
				enableScripts: true
			}
		);

		// serve static local content
		// Get path to resource on disk
		const onDiskPath = vscode.Uri.file(
			path.join(context.extensionPath, 'media', 'logo.png')
		);

		// And get the special URI to use with the webview
		const logoImgSrc: vscode.Uri = panel.webview.asWebviewUri(onDiskPath);

		// And set its HTML content
		panel.webview.html = getWebviewContent(logoImgSrc);

		// Handle messages from the webview
		panel.webview.onDidReceiveMessage(
			(message) => {
				vscode.window.showInformationMessage(message.text);
			},
			undefined,
			context.subscriptions
	  	  );
	}));
}

function getWebviewContent(logoSrc: vscode.Uri) {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Code Man</title>
		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css">
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsnview@1.0.6/build/index.css" />
  
		<style>
		  * {
			  background-color: #1e1e1e;
			  color: #fff;
		  }
  
			body {
				margin: 0;
				padding: 0;
				font-family: 'Courier New', Courier, monospace;
				background-color: #1e1e1e;
				color: #fff;
		  }
  
		  input {
			  border-radius: 0% !important;
		  }
  
		  button {
			  border-radius: 0% !important;
			  margin: auto auto 1rem;
		  }
  
		  a:not(.active) {
			  color: white !important;
		  }
  
		  figure > blockquote {
			  color: coral !important;
		  }
  
		  i.bi {
			  background-color: transparent;
			  color: black;
		  }
  
		  textarea {
			  margin: 2rem 1rem;
			  width: 90% !important;
		  }

		  #chatMessage {
			  text-align: center;
		  }
  
		</style>
	</head>
	<body>
	  <div id="mainContainer" class="row">
		  <div class="col-md-10">
			  <div class="input-group flex-nowrap">
				  <div class="input-group-prepend">
					  <select class="form-select" id="httpMethod" aria-label="Default select example">
						  <option value="GET" selected>GET</option>
						  <option value="POST">POST</option>
						  <option value="PUT">PUT</option>
						  <option value="DELETE">DELETE</option>
						  <option value="PATCH">PATCH</option>
						  <option value="HEAD">HEAD</option>
						  <option value="OPTIONS">OPTIONS</option>
					  </select>
				  </div>
				  <input type="text" id="httpUrl" class="form-control" placeholder="Enter the API URL" aria-label="api-url" aria-describedby="addon-wrapping">
			  </div>
		  </div>
  
		  <button onclick="callAPI()" class="btn btn-warning col-md-2"><i class="bi bi-box-arrow-in-right"></i> SEND</button>
	  </div>
	  
	  <div id="requestContainer">
		  <figure>
			  <blockquote class="blockquote">
				Request
			  </blockquote>
		  </figure>
  
		  <ul class="nav nav-tabs" id="requestTabs">
			  <li class="nav-item">
				<a class="nav-link active" aria-current="page" href="#" id="reqParams">Params</a>
			  </li>
			  <li class="nav-item">
				<a class="nav-link" href="#" id="reqHeaders">Headers</a>
			  </li>
			  <li class="nav-item">
				  <a class="nav-link" href="#" id="reqBody">Body</a>
			  </li>
		  </ul>
  
		  <div id="requestDynamicContent">
			  <table class="table table-dark">
				  <tr class="table-dark">
					  <th class="table-dark">Key</th>
					  <th class="table-dark">Value</th>
				  </tr>
				  <tr class="table-dark">
					  <td class="table-dark">
						  <input data-type="key" class="form-control" type="text" />
					  </td>
					  <td class="table-dark">
						  <input data-type="value" class="form-control" type="text" />
					  </td>
				  </tr>
				  <tr class="table-dark">
					  <td class="table-dark">
						  <input data-type="key" class="form-control" type="text" />
					  </td>
					  <td class="table-dark">
						  <input data-type="value" class="form-control" type="text" />
					  </td>
				  </tr>
			  </table>
		  </div>
	  </div>
  
	  <div id="responseContainer">
		  <figure>
			  <blockquote class="blockquote">
				Response
			  </blockquote>
		  </figure>
  
		  <ul class="nav nav-tabs" id="responseTab">
			  <li class="nav-item">
				<a class="nav-link active" aria-current="page" href="#" id="resOutput">Output</a>
			  </li>
			  <li class="nav-item">
				<a class="nav-link" href="#" id="resHeader">Headers</a>
			  </li>
		  </ul>
  
		  <div id="dynamicResponseContainer">
			  <pre id="output">
  
			  </pre>
		  </div>
	  </div>
  
	  <div class="row">
		  <img src="${logoSrc}" class="col-md-2 offset-md-5" />
	  </div>

	  <div id="chatMessage"></div>
  
  
	  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
	  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>
  
	  <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js"></script>
	  <script src="https://cdn.jsdelivr.net/npm/jsnview@1.0.6/build/index.min.js"></script>
  
	  <script>
		  let selectedRequestTab = 'reqParams';
		  let selectedResponseTab = 'resOutput';
		  const params = {}; // object to hold query params
		  const headers = {}; // object array to hold request headers
		  let body = ''; // JSON String
  
		  let responseHeaders = {};
		  let responseOutput = {};

		  let vscodeInstance;
  
  
		  // Functions
		  function callAPI() {
			  if (!body) {
				  body = document.getElementById('reqBodyJson') && document.getElementById('reqBodyJson').value;
			  }
  
			  let payLoad = {};

			  if (body) {
                payLoad = body.split(',').map(set => set.replace(\/[\\n{}\\"]\/g, '').trim()).filter(set => set).map(keypair => keypair.split(':')).reduce((acc, set) => ({...acc, [set[0]]: set[1].trim()}), {})
              }
  
			  console.log('CHDLLK: ', headers, params,payLoad);
			  axios({
				  method: document.getElementById('httpMethod').value,
				  url: document.getElementById('httpUrl').value,
				  data: payLoad,
				  responseType: 'json'
				  })
				  .then((response) => {
					  // make the output tab active
					  document.getElementById('resHeader').classList.remove('active');
					  document.getElementById('resOutput').classList.add('active');
  
					  // clear current output
					  document.getElementById('output').innerText = '';
  
					  // render json
					  document.getElementById('output').appendChild(jsnview(response.data, { displayItemsLen: true , displayTypes: true }));
  
					  responseHeaders = {
						  ...response.headers,
						  status: response.status
					  };
  
					  responseOutput = response.data;

					  // posting message back to extension
					  vscodeInstance.postMessage({
						  text: 'Done with fetching...'
					  });
				  });
		  }
  
		  // Events
		  document.getElementById('requestTabs').addEventListener('click', (e) => {
			  // Saving previous data
			  if (selectedRequestTab === 'reqBody') {
				  body = document.getElementById('reqBodyJson').value;
			  } else if (selectedRequestTab === 'reqParams') {
				  const paramKeys = Array.from(document.querySelectorAll('input[data-type="key"]')).map(element => element.value).filter((value) => value !== '');
				  const paramValues = Array.from(document.querySelectorAll('input[data-type="value"]')).map(element => element.value).filter((value) => value !== '');
				  
				  // update api URI
				  if (paramKeys.length > 0 && paramValues.length > 0) {
					  document.getElementById('httpUrl').value = paramKeys.reduce((acc, key, index) => {
						  if (index === paramKeys.length - 1) {
							  return acc + key + '=' + paramValues[index]
						  }
						  return acc + key + '=' + paramValues[index] + '&';
					  }, document.getElementById('httpUrl').value.slice(0, document.getElementById('httpUrl').value.indexOf('?')) + '?' );
  
					  // saving data in variable
					  paramKeys.forEach((key, index) => params[key] = paramValues[index]);
  
					  console.log(paramKeys); 
				  }
			  } else {
				  // reqHeaders
				  const paramKeys = Array.from(document.querySelectorAll('input[data-type="key"]')).map(element => element.value).filter((value) => value !== '');
				  const paramValues = Array.from(document.querySelectorAll('input[data-type="value"]')).map(element => element.value).filter((value) => value !== '');
  
				  if (paramKeys.length > 0 && paramValues.length > 0) {
					  // saving data in variable
					  paramKeys.forEach((key, index) => headers[key] = paramValues[index]);
  
					  console.log(headers);
				  }
			  }
  
			  // remove active class to currently selected tab
			  document.querySelector('#' + selectedRequestTab).classList.remove('active');
  
			  // add active class to currently selected tab
			  document.querySelector('#' + e.target.id).classList.add('active');
			  selectedRequestTab = e.target.id;
  
			  if (selectedRequestTab === 'reqBody') {
				  const textArea = document.createElement('textarea');
				  textArea.classList.add('form-control');
				  textArea.rows = 5;
				  textArea.id = 'reqBodyJson';
				  textArea.value = body;
  
				  document.querySelector('#requestDynamicContent').innerHTML = '';
				  document.querySelector('#requestDynamicContent').appendChild(textArea);
  
				  textArea.addEventListener('keydown', (e) => {
					  if(e.which === 9) { 
						  // stop tab behaviour
						  e.preventDefault();  
					  }
				  });
  
				  textArea.addEventListener('keyup', (e) => {
					  if (e.which === 13) {
						  // Add tab on enter   
						  textArea.value = textArea.value.slice(0, e.target.selectionStart) + '    ' + textArea.value.slice(e.target.selectionStart);
					  }
				  });
			  } else {
				  // default two empty rows
				  let rows = \`<tr class="table-dark">
						  <td class="table-dark">
							  <input data-type="key" class="form-control" type="text" />
						  </td>
						  <td class="table-dark">
							  <input data-type="value" class="form-control" type="text" />
						  </td>
					  </tr>
					  <tr class="table-dark">
						  <td class="table-dark">
							  <input data-type="key" class="form-control" type="text" />
						  </td>
						  <td class="table-dark">
							  <input data-type="value" class="form-control" type="text" />
						  </td>
					  </tr>\`;
				  
				  const dataObject = selectedRequestTab === 'reqParams' ? params: headers;
  
				  console.log(selectedRequestTab, dataObject);
  
				  if (Object.keys(dataObject).length > 0) {
					  rows = '';
					  Object.keys(dataObject).forEach((key) => {
						  rows += \`<tr class="table-dark">
							  <td class="table-dark">
								  <input data-type="key" class="form-control" type="text" value=\${key} />
							  </td>
							  <td class="table-dark">
								  <input data-type="value" class="form-control" type="text" value=\${dataObject[key]} />
							  </td>
						  </tr>\`;
					  })
				  }
  
				  // reqParams or reqHeaders
				  const html = \`
				  <table class="table table-dark">
					  <tr class="table-dark">
						  <th class="table-dark">Key</th>
						  <th class="table-dark">Value</th>
					  </tr>
					  \${rows}
				  </table>
				  \`;
				  document.querySelector('#requestDynamicContent').innerHTML = '';
				  document.querySelector('#requestDynamicContent').innerHTML = html;
			  }
		  });
  
		  // response tabs
		  document.getElementById('responseTab').addEventListener('click', (e) => {
			  console.log(e.target.id, document.querySelector('#' + selectedResponseTab));
			  // remove active class to currently selected tab
			  document.querySelector('#' + selectedResponseTab).classList.remove('active');
  
			  // add active class to currently selected tab
			  document.querySelector('#' + e.target.id).classList.add('active');
			  selectedResponseTab = e.target.id;
  
			  const content = selectedResponseTab === 'resOutput' ? responseOutput: responseHeaders;
  
			  // clear current output
			  document.getElementById('output').innerText = '';
  
			  // render json
			  document.getElementById('output').appendChild(jsnview(content, { displayItemsLen: true , displayTypes: true }));
		  });

		  // receiving message from extension
		  window.addEventListener('message', event => {
            const { message } = event.data; // The JSON data our extension sent
			console.log(event.data);
			document.getElementById('chatMessage').innerHTML = \`<h1>\${message}</h1>\`;
        });

		// posting data back to vscode extension
		vscodeInstance = acquireVsCodeApi();

		console.log(vscodeInstance)

	  </script>
	</body>
	</html>`;
  }

export function deactivate() {}
