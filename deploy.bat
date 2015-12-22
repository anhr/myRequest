rem run as administrator


cd /D "G:\My documents\MyProjects\trunk\WebFeatures\WebFeatures\GoogleSite\myRequest"
set jsFolderDest=C:\inetpub\wwwroot\GoogleSite\myRequest\

xcopy index.htm %jsFolderDest%index.htm /Y
xcopy myRequest.js %jsFolderDest%myRequest.js /Y
xcopy XMLHttpRequest.xml %jsFolderDest%XMLHttpRequest.xml /Y
xcopy XMLHttpTwoRequest.xml %jsFolderDest%XMLHttpTwoRequest.xml /Y
xcopy PlainText.txt %jsFolderDest%PlainText.txt /Y

pause

