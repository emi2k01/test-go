# Ticket printer server

HTTP server that listens for requests to print tickets.

On startup, it will ask for a few options. This is only to quickly test functionality. We will later convert this program to a service that starts when the OS starts up. For that, we will to expose the configuration through the server and allow the client to change the settings.

## Contributing

### Run for development

```sh
npm run dev
```

### Build

```sh
npm run build
```

### Export to an executable

```sh
npm i -g pkg
pkg .
```
