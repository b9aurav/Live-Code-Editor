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

var html = document.getElementById("html");
var css = document.getElementById("css");
var js = document.getElementById("js");
var code = document.getElementById("code").contentWindow.document;
var modal = document.getElementById("myModal");
var newProjectBtn = document.getElementById("new-project-btn");
var closeModalBtn = document.getElementById("close-modal-btn");

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

closeModalBtn.onclick = function() {
	modal.style.display = "none";
}

function loadData() {
	// document.getElementById("project-list").removeChild(document.getElementById("project-list").firstChild);
	while(document.getElementById('project-list').hasChildNodes()) {
		document.getElementById('project-list').removeChild(document.getElementById('project-list').firstChild)
	}
	// document.getElementById('project-list').childNodes.forEach(element => {
	// 	document.getElementById('project-list').removeChild(element);
	// });
	const projectPath = ref(db, 'Users/' + userKey + "/Projects");
	onValue(projectPath, (snapshot) => {
		snapshot.forEach(function(childSnapshot) {
			var project = document.createElement('a');
			project.textContent = childSnapshot.val().project_name;
			project.href = '#'
			document.getElementById("project-list").appendChild(project);
		});
	});
}

document.getElementById('create-project-btn').onclick = function() {
	const projectName = document.getElementById('project-name');
	var projectRegex = /^[a-zA-Z0-9]+$/;
  	if (!projectRegex.test(projectName.value)) {
		document.getElementById('errordesc').textContent = ' Invalid project name, project name should contain alphabates and numbers only.'
        document.getElementById('error-div').style.display = 'flex';
	} else {
		set(ref(db, 'Users/' + userKey + "/Projects/" + push(child(ref(db), 'Users/' + userKey + '/Projects')).key), {
			project_name: projectName.value
		})
		.then(() => {
			console.log('Project Created.');
			document.getElementById('error-div').style.display = 'none';
			modal.style.display = "none";
			loadData();
		})
		.catch((error) => {
			errorDesc.textContent = ' Invalid project name, project name should contain alphabates and numbers only.'
            errorMsg.style.display = 'flex';
		});
	}
}

compile();