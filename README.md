# backbone.chrome.storage
A adaptor for Backbone.js with chrome-extention API(chrome.storage)

## Usage

### Using without background.
HTML:
```html
<script type="text/javascript" src="backbone.js"></script>
<script type="text/javascript" src="backbone.chrome.storage.API.js"></script>
<script type="text/javascript" src="backbone.chrome.storage.js"></script>
```

Model:
```javascript
// Below is default settings for chromeStorage.
Backbone.chromeStorageDefault.background = false;
Backbone.chromeStorageDefault.type = "local";

var SampleCollection = Backbone.Collection.extend({
  chromeStorage: new Backbone.chromeStorage("CollectionName"),  
  
  // If you need to change the settings of chromeStorage for ONLY this model,
  // set settings in second argument.
  chromeStorage: new Backbone.chromeStorage("CollectionName", {background:false, type:"local"}),

  // Any more.
});

### Using with background(Not Work).
For example.

manifest.json:
```javascript
{
  "manifest_version": 2,
  "background": {
    "scripts": ["js/lib/backbone.chrome.storage.API.js", "js/background.js"],
    "persistent": false
  },
  // Any more.
}
```

HTML:
```html
<script type="text/javascript" src="backbone.js"></script>
<script type="text/javascript" src="backbone.chrome.storage.API.js"></script>
<script type="text/javascript" src="backbone.chrome.storage.js"></script>
```

Model:
```javascript
// うんたらかんたら
Backbone.chromeStorageDefault.background = false;
Backbone.chromeStorageDefault.type = "local";

// If you want to getting/saving models by throwing another chrome-extension ,
// need to set the extensionId to "Backbone.chromeStorageDefault.extensionId".
Backbone.chromeStorageDefault.extensionId = "extensionId."; 

var SampleCollection = Backbone.Collection.extend({
  chromeStorage: new Backbone.chromeStorage("CollectionName"),
  
  // If you need to change the settings of chromeStorage for ONLY this model,
  // set settings in second argument.
  chromeStorage: new Backbone.chromeStorage("CollectionName", {background:true, extensionId: "[another extensionId].", type:"local"}),

  // Any more.
});
```

background.js:
```javascript
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // Writting your specifiec code here.
        return chromeStorageAdapter(request, sender, sendResponse);
    });
```

## License
MIT