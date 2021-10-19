import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getDatabase, ref, get, child, onValue, set, push } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCzW74luv8MD7EJ87WCFlzS1EIk8nJiicU",
    authDomain: "smart-live-code-editor.firebaseapp.com",
    databaseURL: "https://smart-live-code-editor-default-rtdb.firebaseio.com",
    projectId: "smart-live-code-editor",
    storageBucket: "smart-live-code-editor.appspot.com",
    messagingSenderId: "675027571856",
    appId: "1:675027571856:web:8dc95bb6e3683cdb133415",
	measurementId: "G-0YLQRCYQWP"
};

const userKey = sessionStorage.getItem('user-key');
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

var projectElement = null;
var project = null;
var projectKey = null;

var html = document.getElementById("html");
var css = document.getElementById("css");
var js = document.getElementById("js");
var code = document.getElementById("code").contentWindow.document;
var modal = document.getElementById("myModal");
var newProjectBtn = document.getElementById("new-project-btn");
var closeModalBtn = document.getElementById("close-modal-btn");
var optionContainer = document.getElementById("option-container");
var codeContainer = document.getElementById('code-container');
var outputContainer = document.getElementById('output-container');

document.body.style.overflow = 'hidden'

const userPath = ref(db, 'Users/' + userKey);
onValue(userPath, (snapshot) => {
	const data = snapshot.val();
	document.getElementById('user-name').textContent = 'Howdy, ' + data.first_name;
});

loadData();

html.value = html.value + "<!DOCTYPE html>\n";
html.value = html.value + "<html>\n";
html.value = html.value + "<head>\n";
html.value = html.value + "<title>Document</title>\n";
html.value = html.value + "</head>\n";
html.value = html.value + "<body>\n";
html.value = html.value + "</body>\n";
html.value = html.value + "</html>";

var tabButton = document.getElementById('new-tab-btn');
tabButton.onclick = function () {
    var tab = window.open("", "tab");
	tab.document.write(html.value+"<style>"+css.value+"</style>"+"<script>" + js.value + "</script>"); 
}

function compile() {
    document.body.onkeyup = function(){
        code.open();
		code.writeln(html.value+"<style>"+css.value+"</style>"+"<script>" + js.value + "</script>");
		code.close();
        compile();
    };
};

newProjectBtn.onclick = function() {
	modal.style.display = "block";
}

document.getElementById('new-project').onclick = function() {
	modal.style.display = "block";
}

closeModalBtn.onclick = function() {
	modal.style.display = "none";
}

function loadData() {
	const projectPath = ref(db, 'Users/' + userKey + "/Projects");
	onValue(projectPath, (snapshot) => {
		while(document.getElementById('project-list').hasChildNodes()) {
			document.getElementById('project-list').removeChild(document.getElementById('project-list').firstChild)
		}
		for(let i = 0; i < Object.keys(snapshot.val()).length; i++) {
			projectElement = document.createElement('a');
			projectElement.textContent = snapshot.child(Object.keys(snapshot.val())[i]).val().project_name;
			projectElement.href = "#";
			projectElement.onclick = function() {
				project = snapshot.child(Object.keys(snapshot.val())[i]).val().project_name;
				projectKey = Object.keys(snapshot.val())[i];
				document.getElementById('project-title').textContent = project;
				const dbProjectPath = ref(db, 'Users/' + userKey + "/Projects/" + projectKey);
				console.log(projectKey);
				onValue(dbProjectPath, (snapshot) => {
					const data = snapshot.val();
					if (data.html != null) {
						html.value = data.html;
						css.value = data.css;
						js.value = data.js;
						code.open();
						code.writeln(html.value+"<style>"+css.value+"</style>"+"<script>" + js.value + "</script>");
						code.close();
					} else {
						html.value = '';
						html.value = html.value + "<!DOCTYPE html>\n";
						html.value = html.value + "<html>\n";
						html.value = html.value + "<head>\n";
						html.value = html.value + "<title>Document</title>\n";
						html.value = html.value + "</head>\n";
						html.value = html.value + "<body>\n";
						html.value = html.value + "</body>\n";
						html.value = html.value + "</html>";
						css.value = '/* Start CSS from here. */'
						js.value = '// Start JS from here.'
					}
				});					
				optionContainer.style.display = 'block';
				codeContainer.style.display = 'block';
				document.getElementById('initial-div').style.display = 'none';
				document.body.style.overflow = 'auto';
			};
			document.getElementById("project-list").appendChild(projectElement);
		}
	});
}

function loadSpecificProject(key) {
	console.log(key);
}

document.getElementById('create-project-btn').onclick = function() {
	const projectName = document.getElementById('project-name');
	var projectRegex = /^[a-zA-Z0-9]+$/;
  	if (!projectRegex.test(projectName.value)) {
		document.getElementById('errordesc').textContent = ' Invalid project name, project name should contain alphabates and numbers only.'
        document.getElementById('error-div').style.display = 'flex';
	} else {
		var key = push(child(ref(db), 'Users/' + userKey + '/Projects')).key;
		set(ref(db, 'Users/' + userKey + "/Projects/" + key), {
			project_name: projectName.value
		})
		.then(() => {
			console.log('Project Created.');
			document.getElementById('error-div').style.display = 'none';
			modal.style.display = "none";
			loadData();
			loadSpecificProject(key);
		})
		.catch((error) => {
			errorDesc.textContent = ' Invalid project name, project name should contain alphabates and numbers only.'
            errorMsg.style.display = 'flex';
		});
	}
}

document.getElementById('save-project-btn').onclick = function() {
	set(ref(db, 'Users/' + userKey + "/Projects/" + projectKey), {
		html: html.value,
		css: css.value,
		js: js.value,
		project_name: project
	})
	.then(() => {
		alert('Project Saved.')
	})
	.catch((error) => {
		alert(error);
	});

}

document.getElementById('download-project-btn').onclick = function() {
	var htmlCode = html.value;
	var cssCode = '\n<style>\n' + css.value + '\n</style>\n';
	var jsCode = '\n<script>\n' + js.value + '\n</script>\n';
	var cssIncluded = concateFileCodes(htmlCode, htmlCode.match('<head>').index + 6, cssCode);
	var finalFileCode = concateFileCodes(cssIncluded, cssIncluded.match('</body>').index + 7, jsCode);
	var file = new Blob([finalFileCode], { type: "html/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.download = project + ".html";
    a.href = window.URL.createObjectURL(file);
    a.click(); 
}

document.getElementById('delete-project-btn').onclick = function() {
	set(ref(db, 'Users/' + userKey + "/Projects/" + projectKey), {
		html: null,
		css: null,
		js: null,
		project_name: null
	})
	.then(() => {
		optionContainer.style.display = 'none';
		codeContainer.style.display = 'none';
		outputContainer.style.display = 'none';
		document.body.style.overflow = 'hidden';
		document.getElementById('initial-div').style.display = 'flex';
	})
	.catch((error) => {
		alert(error);
	});
}

function concateFileCodes(str, index, stringToAdd){
	return str.substring(0, index) + stringToAdd + str.substring(index, str.length);
}

compile();