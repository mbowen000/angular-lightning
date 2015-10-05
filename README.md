# app

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.12.1.

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.

## Salesforce Integration

### Current:
- Dev assets are linked va baseurl configuration
- Templates are put into a templateCache/ directory on the static resource server
- Basic angular w/ routing capabilities

### Minimal todo:
- To get working in prod 
- Build minified versions of code and include them in static resource for upload
- Make sure functionality works

### Future Items:

- Low Priority: Deploy .page to SFDC
- Low Priority: Deploy static resources to SFDC
- https://github.com/tstachl/metaforce (can use metaforce and create grunt task that deploys - even does ZIP deploy!)
- Add yeoman custom scaffolding that will allow us to additional generate salesforce items automatically so that the visualforce page and static resource, in addition to what yeoman does now which is name the angular modules, etc.