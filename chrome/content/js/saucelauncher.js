//var sauceURL = "http://smcq.dev.saucelabs.com:5000";
var sauceURL = "http://saucelabs.com";
var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
var lastURL = "";

var prefPage = function() {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
  var mainWindow = wm.getMostRecentWindow("navigator:browser");
  mainWindow.content.location = "chrome://saucelauncher/content/saucePrefs.html";
}

var go = function(os, browser, version) {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
  var mainWindow = wm.getMostRecentWindow("navigator:browser");
  
  var destURL = mainWindow.content.location.href;
  if ((mainWindow.content.document.title.indexOf("Sauce Scout") != -1) && lastURL) {
    destURL = lastURL;
  }
  else {
    lastURL = destURL;
  }
  
  var account = sauceUsername();
  if (!account) {
    mainWindow.content.location = "chrome://saucelauncher/content/saucePrefs.html";
    return;
  }
  var api_key = sauceAccessKey();
  if (!api_key) {
    mainWindow.content.location = "chrome://saucelauncher/content/saucePrefs.html";
    return;
  }
  
  var baseURL = sauceURL+"/scout/launch/"+account;
  var pString = "?os="+os+"&browser="+browser+"&version="+version+"&url="+destURL+"&auth_username="+account+"&auth_access_key="+api_key;
  var params = encodeURI(pString)
  var url = baseURL+params;
    
  try {
    var req = new XMLHttpRequest();
    req.open('POST', url, true);
    
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
        if(req.status == 200) {
          var rObj = JSON.parse(req.responseText);
          var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                             .getService(Components.interfaces.nsIWindowMediator);
          var mainWindow = wm.getMostRecentWindow("navigator:browser");
          var newTab = mainWindow.gBrowser.addTab(encodeURI(sauceURL+"/scout/live/"+rObj.task+"?auth_username="+account+"&auth_access_key="+api_key));
        }
        else {
          alert(req.responseText);
        }
      }
    }
    req.send(null);
  }
  catch(err) {
    alert(err);
  }
};

var saveValues = function() {
  var name = document.getElementById('usernameEnter').value;
  var key = document.getElementById('api_key').value;
  
  payObj = {"username":name, "access-key":key, "os":"Linux"}
  url = sauceURL+"/rest/v1/can_run_job";
  req = new XMLHttpRequest();
  req.open('POST', url, false);
  req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  req.send(JSON.stringify(payObj));

  var respObj = JSON.parse(req.responseText);
  if (!respObj.result) {
    if (respObj.msg.indexOf("Invalid") != -1){
      sauceResetUsername();
      sauceResetAccessKey();
      document.getElementById('sauceEnterError').innerHTML = "*Have your credentials changed?";
      return;
    }
    else if (respObj.msg.indexOf("parallel") != -1){
      document.getElementById('sauceEnterError').innerHTML = "*Is your limit on parallel tests currently maxed out?";
      return;
    }
    else {
      document.getElementById('sauceEnterError').innerHTML = "*Do you have available sauce minutes?";
      return;
    }
 }
  
 if (name && key) {
   sauceUsername(name);
   sauceAccessKey(key);
   var content = document.getElementById('sauceContent');
   content.innerHTML = "<h2>Thanks "+name+"!</h2> You are all set to start Scouting. <a href='#' onclick='history.go(-1)'>Go back to my page.</a>";
 }
 else {
   document.getElementById('sauceEnterError').innerHTML = "*Please fill out both fields.";
 }
};

var createPayLoad = function(fieldArray) {
  var payload = {};
  for (var i=0;i<fieldArray.length;i++){
    var field = fieldArray[i];
    var fieldValue = document.getElementById(field).value;
    //Dont allow empty fields
    if (!fieldValue) {
      throw("All fields are required.");
    }
    //validate email
    if (field == "email") {
      var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      if (fieldValue.search(emailRegEx) == -1) {
        throw("Please provide a valid email address.");
      }
    }
    if (field == "password") {
      if (fieldValue.length < 6) {
        throw("Password must be at least 6 characters.");
      }
    }
    payload[field] = fieldValue;
  }
  return payload;
};

var createAccount = function() {
  var sauceCreateError = document.getElementById('sauceCreateError');
  
  try {
    var payObj = createPayLoad(["name", "email", "usernameCreate","password"]);
    payObj.username = payObj["usernameCreate"];
    payObj.token = "0E44EF6E-B170-4CA0-8264-78FD9E49E5CD";
    alert(JSON.stringify(payObj));
    
    var url = sauceURL+"/rest/v1/users";
    var req = new XMLHttpRequest();
    req.open('POST', url, true);
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
        if(req.status == 200) {
          var rObj = JSON.parse(req.responseText);
          //backwards compat
          var key = rObj.access_key;
          var name = rObj.id;
          //save
          sauceUsername(name);
          sauceAccessKey(key);
        
          var content = document.getElementById('sauceContent');
          content.innerHTML = "<h2>Thanks "+name+"!</h2> You are all set to start Scouting. <a href='#' onclick='history.go(-1)'>Go back to my page.</a>";
        }
        else {
          sauceCreateError.innerHTML = "There was an error creating your account.";
        }
      }
    }
    req.send(JSON.stringify(payObj));
  }
  catch(err) {
    sauceCreateError.innerHTML = err;
  }
}

/** The username for connecting to sauce on demand - asks user if unknown. */
var sauceUsername = function (username) {
  if (username) {
    prefManager.setCharPref("extensions.saucelauncher.sauceusername", username);
  }
  if (prefManager.prefHasUserValue("extensions.saucelauncher.sauceusername")) {
    var name = prefManager.getCharPref("extensions.saucelauncher.sauceusername");
    if (name) {
      return name;
    }
  }
  //var name = recorderWindow.prompt("Please enter your Sauce OnDemand username.");
  //prefManager.setCharPref("extensions.saucelauncher.sauceusername", name);
  return;
};

/** The username for connecting to sauce on demand - asks user if unknown. */
var sauceResetUsername = function () {
  prefManager.setCharPref("extensions.saucelauncher.sauceusername", "");
  return;
};

/** The access key for connecting to sauce on demand - asks user if unknown. */
var sauceAccessKey = function (apiKey) {
  if (apiKey) {
    prefManager.setCharPref("extensions.saucelauncher.sauceaccesskey", apiKey);
  }
  if (prefManager.prefHasUserValue("extensions.saucelauncher.sauceaccesskey")) {
    var key = prefManager.getCharPref("extensions.saucelauncher.sauceaccesskey");
    if (key) {
      return key;
    } 
  }
  //var key = recorderWindow.prompt("Please enter your Sauce OnDemand access key.");
  //prefManager.setCharPref("extensions.saucelauncher.sauceaccesskey", key);
  return;
};

var sauceResetAccessKey = function () {
  prefManager.setCharPref("extensions.saucelauncher.sauceaccesskey", "");
  return;
};