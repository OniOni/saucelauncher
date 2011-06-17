// Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
// 
// const Cc = Components.classes;
// const Ci = Components.interfaces;
// 
// function SauceLauncherAboutHandler() {
// }
// 
// SauceLauncherAboutHandler.prototype = {
//     newChannel : function(aURI) {
//         var ios = Cc["@mozilla.org/network/io-service;1"].
//                   getService(Ci.nsIIOService);
// 
//         var channel = ios.newChannel(
//           "chrome://saucelauncher/content/about.html",
//           null,
//           null
//         );
// 
//         channel.originalURI = aURI;
//         return channel;
//     },
// 
//     getURIFlags: function(aURI) {
//         return Ci.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT;
//     },
// 
//     classDescription: "About Sauce Launcher Page",
//     classID: Components.ID('ec8030f7-c20a-464f-9b0e-13a3a9e97384'),
//     contractID: "@mozilla.org/network/protocol/about;1?what=saucelauncher",
//     QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule])
// }
// 
// function NSGetModule(aCompMgr, aFileSpec) {
//   return XPCOMUtils.generateModule([SauceLauncherAboutHandler]);
// }