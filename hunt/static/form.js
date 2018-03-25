
function isAlNum(code) {
  return (code > 47 && code < 58) || // numeric (0-9)
    (code > 64 && code < 91) || // upper alpha (A-Z)
    (code > 96 && code < 123); // lower alpha (a-z)
}

// https://stackoverflow.com/questions/22845913/function-to-replicate-the-output-of-java-lang-string-hashcode-in-python-and-no
String.prototype.hashCode = function() {
  let char;
  for(var ret = 0, i = 0, len = this.length; i < len; i++) {
    char = this.charCodeAt(i);
    if(!isAlNum(char)) {
      continue;
    }
    ret = (31 * ret + char) << 0;
  }
  return ret;
};

// https://stackoverflow.com/a/697841
function tohex(number) {
  if(number < 0) {
    number = 0xFFFFFFFF + number + 1;
  }
  let hex = ("00000000" + number.toString(16)).substr(-8);
  return hex;
}

function submitForm() {
  let password = document.getElementsByName("input-password")[0].value;
  let hash = tohex((SALT + password).toLowerCase().hashCode());
  let url = "page_" + hash + ".html";
  document.location.href = url;
}
