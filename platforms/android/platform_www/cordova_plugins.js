cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-printer.Printer",
      "file": "plugins/cordova-plugin-printer/www/printer.js",
      "pluginId": "cordova-plugin-printer",
      "clobbers": [
        "plugin.printer",
        "cordova.plugins.printer"
      ]
    },
    {
      "id": "cordova-plugin-cleartext.CordovaPluginsCleartext",
      "file": "plugins/cordova-plugin-cleartext/www/CordovaPluginsCleartext.js",
      "pluginId": "cordova-plugin-cleartext",
      "clobbers": [
        "cordova.plugins.CordovaPluginsCleartext"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-whitelist": "1.3.3",
    "cordova-plugin-printer": "0.7.3",
    "cordova-plugin-cleartext": "1.0.0"
  };
});