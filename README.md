# regex

## Usage

1. Install package adding to package.json:
    ```json
    
    "dependencies": {
        "@exabyte-io/regex": "2023.9.1"
    }
    ```
Or using npm:
    ```bash
    npm i @exabyte-io/regex@2023.9.1
    ```

2. Import package:
    ```javascript
    import regexSchemas from "@exabyte-io/regex/lib/schemas";
    ```

3. Use regex schemas:
    ```javascript
   const calculationPattern = regexSchemas.espresso["5.8.1"].["pw.x"].calculation;
   const regex = new RegExp(calculationPattern.regex, calculationPattern.flags.join("));
   ```
   
## Development
To run tests:
```bash
npm test
```
To run lint:
```bash
npm run lint
```
To build regex schemas for development:
```bash
npm run build:schemas:dev
```

## Add new regex schemas
1. Add new yamls for `stdin` and `stdout` to `assets/file/applications/<application_name>/<application_version>/<unit_name>/`
2. Run `npm run build:schemas:dev` to generate new regex schemas for dev
3. Add tests for newly added regex schemas