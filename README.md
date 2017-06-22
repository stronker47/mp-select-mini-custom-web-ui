## Disclaimer: This is a modification/fork of the factory installed UI; I do not claim ownership over the original factory installed UI. 

## Features:
* Temperature readout, job progress bar, safe move menu.
* Reduces the html stored on the printer to 107(!) bytes.
* Web UI synced with latest commit on this repository.

## How to install:
Navigate to `http://YOURPRINTERSIP/up` and upload a html file containing the following to the THIRD upload bar:
```html
<html>
<script src="https://stronker47.github.io/mp-select-mini-custom-web-ui/deploy.js"></script>
</html>
```

## FAQ:
> How do I enable WIFI on my printer?

There are a number of ways you can read about [here](http://mpselectmini.com/wifi).
> My printer 404's when I try to go to /up.

> My printer doesn't have a web interface.

You may need to update the LCD firmware. [There's a fantastic tutorial here.](http://mpselectmini.com/ui_controller)

