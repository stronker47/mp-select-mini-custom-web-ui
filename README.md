# mp-select-mini-custom-web-ui
Improvements to the factory web user interface for the Monoprice MP Select Mini 3D printer.

Features:
* Reduced the html on the printer to 107(!) bytes.
* Web UI synced with latest commit on this repository.
* Fixed bug where it was possible to move axes to negative positions through move menu.

How to install:
Navigate to `http://YOURPRINTERSIP/up` and upload a html file containing the following to the THIRD upload bar:
```html
<html>
<script src="https://stronker47.github.io/mp-select-mini-custom-web-ui/deploy.js"></script>
</html>
```
