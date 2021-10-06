function switchPreview() {
	if (document.getElementById('preview-switch').checked) {
		document.getElementById("output-container").style.display = 'block';
		html.style.height = '250px';
		css.style.height = '250px';
		js.style.height = '250px';
        document.body.style.overflow = 'auto';
	} else {
		document.getElementById("output-container").style.display = 'none';
		html.style.height = '25.5rem';
		css.style.height = '25.5rem';
		js.style.height = '25.5rem';
        document.body.style.overflow = 'hidden';
	}
}

function openSidebar() {
	document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeSidebar() {
	document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}

function logoutUser() {
	sessionStorage.removeItem('user-key');
	sessionStorage.clear();
	location.href = "login.html";
}