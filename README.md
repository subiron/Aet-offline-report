# Aet-offline-report
Simple tool that allows to download AET report and view it offline without connection to AETs REST API

### How to use it

#### Downloading the report
execute:
< aet-offline-report binary file > "< retport url > "
 
 e.g. foe windows 
 
 ```aet-offline-report.exe "http://aet-vagrant/report.html?company=aet0&project=aet2&correlationId=aet0-aet2-main0-1483601066568```
 
 notice quotes around report URL param and missing anchor part in url (e.g '#suite') 
 
 
#### Starting webServer with the report: 
 Just run binary file without parameters.
 
 
#### Other platforms 
Currently only windows binaries are released,
of course you can build this by yourself from the sources ;)



#### Disclaimer 
The 'static' folder contains files generated from ['report'](https://github.com/Cognifide/aet/tree/master/report) module of [AET](https://github.com/Cognifide/aet) project