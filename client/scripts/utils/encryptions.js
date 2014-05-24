function hashCode(string) {
	var hash = 0;
	if (string.length == 0) return hash;
	for (var i = 0; i < string.length; i++) {
		char = string.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

function encrypt(data) {
	debugger;
	var key = "73889508735794557106878853278705";
	console.log(CryptoJS.AES.decrypt(CryptoJS.AES.encrypt(data, key).toString(), "73889508735794557106878853278705").toString(CryptoJS.enc.Utf8));
	return CryptoJS.AES.encrypt(data, key).toString();
}