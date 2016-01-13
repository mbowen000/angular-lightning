# Angular Lightning

> Angular bindings and UI Components for Salesforce Lightning Design System

## Current Status

We have working components for many of the Lightning Design Components. The dependencies are not very lightweight and the build process is not very clean yet but that should be around the corner.

For now you can view demo's of the available lightning components here:

https://angular-lightning.herokuapp.com/

## Developer Info

### Adding a Module

- Create a new js file for your module in scripts/fields or scripts/utils depending if its a field or a util. If its something else ask Mike/Ashar
- Use the following to define your module: 
    ```javascript

        angular.module('angular-lightning.mymodule', [])

        .controller(['dependency', function(dependency) {
            // some code here
        }]);

    ```
- Add your module to the imports in `main.js` so that it's included in the build...
```javascript
    // this just pulls in all the submodules
angular.module('angular-lightning', [ 
    'angular-lightning.datepicker',
    ... 
    'angular-lightning.progress',
    'angular-lightning.sticky',
    'angular-lightning.mymodule'
]);
```
- Include the script on the index.html page (with the others in the build:js tag)
```markup 
    <script src="scripts/utils/tooltip.js"></script>
    <script src="scripts/utils/tabs.js"></script>
    ...
    <script src="scripts/utils/mymodule.js"></script>
```
- **Add A Demo** on the index.html page and a code snippet on Github Gist and include it so people know about your module!

## Coming Soon

- More code coverage
- Cleaner Build Process
- Cleaned up build dependencies and dev dependencies
- CI Server

## Questions

mike@smbhd.com