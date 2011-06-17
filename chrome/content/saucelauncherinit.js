var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
                   .getService(Components.interfaces.nsIPrefService);

var Overlay = {
  init: function(){
    firstrun = true;   
    try {
       firstrun = Prefs.getBoolPref("extensions.saucelauncher.firstrun");
    }
    catch(e){
      //nothing
    }
    finally{
      if (firstrun){
        Prefs.setBoolPref("extensions.saucelauncher.firstrun", false);  
        // Insert code for first run here        

        // The example below loads a page by opening a new tab.
        // Useful for loading a mini tutorial
        window.setTimeout(function(){
          gBrowser.selectedTab = gBrowser.addTab("chrome://saucelauncher/content/about.html");
        }, 1500); //Firefox 2 fix - or else tab will get closed
       
      }    
    }
    window.removeEventListener("load",function(){ Overlay.init(); },true);
  }
};


window.addEventListener("load",function(){ Overlay.init(); },true);
