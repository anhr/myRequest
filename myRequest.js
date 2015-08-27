var myRequest = {
	Create: function(url, data){
		var req;
		if(data)
			req = data.req;
		var myRequestData = {
				url: url
				, req: req
			};
		try{
			if((typeof myRequestData.req == 'undefined') || (myRequestData.req == null))
				myRequestData.req = this.loadXMLDoc();
		} catch(e) {
			var message;
			if(typeof e.message == 'undefined')
				message = e;
			else message = e.message;
			ErrorMessage("Your browser is too old and is not compatible with our site.\n\n"
				+ window.navigator.appName + " " + window.navigator.appVersion + "\n\n" + message);
			return null;
		}
		return myRequestData;
	}
	
	, loadXMLDoc: function (){
		var req;
	
		if (window.XMLHttpRequest){
			req = new XMLHttpRequest();
			if (!req)
				throw "new XMLHttpRequest() failed!"
		}
		else if (window.ActiveXObject){
			req = myRequest.NewActiveXObject();
			if (!req)
				throw "NewActiveXObject() failed!"
		}
		else throw "myRequest.loadXMLDoc(...) failed!";
		return req;
	}
	
	, NewActiveXObject: function (NewActiveXObject){
	  try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
		catch(e) {}
	  try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
		catch(e) {}
	  try { return new ActiveXObject("Msxml2.XMLHTTP"); }
		catch(e) {}
	  try { return new ActiveXObject("Microsoft.XMLHTTP"); }
		catch(e) {}
	  ErrorMessage('This browser does not support XMLHttpRequest. Probably, your security settings do not allow Web sites to use ActiveX controls installed on your computer. Refresh your Web page to find out the current status of your Web page or enable the "Initialize and script ActiveX controls not marked as safe" and "Run Active X controls and plug-ins" of the Security settings of the Internet zone of your browser.');
	  return null;
	}
	
	, XMLHttpRequestStart: function (myRequestData, onreadystatechange){
	
		this.XMLHttpRequestStop(myRequestData);//For compatibility with IE Windows Phone
		
		myRequestData.req.onreadystatechange = onreadystatechange;
		
		if((typeof myRequestData.url == 'undefined') || (myRequestData.url == null))
			throw "myRequestData.url = " + myRequestData.url + " failed!";
			
		//ATTENTION!!! do not works in IE
		if("onerror" in myRequestData.req){
			myRequestData.req.onerror = function(event){
				ErrorMessage("XMLHttpRequest error. url: " + myRequestData.url, false, false);
			}
		}
		
		this.XMLHttpRequestReStart(myRequestData);
	}
	
	, XMLHttpRequestReStart: function (myRequestData){
		try{
			myRequestData.req.open("GET", myRequestData.url, true);
			var timeout = (60 + 30) * 1000;//Внимание!!! Задержка должна быть больше CSocketWaitEvent::WaitResponse
//var timeout = 300;
//			if (typeof myRequestData.req.timeout != 'undefined')//for IE6
			if("timeout" in myRequestData.req)//for IE6
				myRequestData.req.timeout = timeout;
//			if (typeof myRequestData.req.ontimeout == 'undefined'){//for Safari, IE6
			if("ontimeout" in myRequestData.req)
				myRequestData.req.ontimeout = function() {
				  ErrorMessage( 'XMLHttpRequest timeout', false, false);
		//		  myRequest.XMLHttpRequestStop(this);
		//		  this.send(null);
				}
			else{//for Safari, IE6
				clearTimeout(myRequestData.timeout_id_SendReq);
				myRequestData.timeout_id_SendReq = setTimeout(function(){
					ErrorMessage( 'XMLHttpRequest timeout 2', false, false);
				}
				, timeout);
	consoleLog("setTimeout myRequestData.req.timeout_id_SendReq = " + myRequestData.req.timeout_id_SendReq);
			}
			myRequestData.req.send(null);
		}catch(e){
			ErrorMessage(e.message + " url: " + myRequestData.url, false, false);
		}
	}
	
	, XMLHttpRequestStop: function (myRequestData){
//consoleLog("XMLHttpRequestStop(" + dataID + ")");
		if(myRequestData.req == null)
			return;
		myRequestData.req.abort();
	}
	
	, ProcessReqChange: function (myRequestData, processStatus200){
		var req = myRequestData.req;
if(!isIE){
//	consoleLog("processReqChange(); req.statusText: " + req.statusText + ". req.status = " + req.status + ". req.readyState = " + req.readyState + ". req.responseText: " + req.responseText);
}	
		// only if req shows "complete"
		//http://www.w3schools.com/ajax/ajax_xmlhttprequest_onreadystatechange.asp
		//http://xmlhttprequest.ru/w3c
		switch(req.readyState)
		{
		case 4://request finished and response is ready
			{
				if(typeof req.status == "unknown"){//IE5 timeout
					consoleError('typeof XMLHttpRequest status == "unknown"');
					return true;
				}
				//Я не могу вставлять switch один в другой
				if(req.status == 200)//OK)
				{
					clearTimeout(myRequestData.timeout_id_SendReq);
//					return myRequestData.processStatus200(req);
					return processStatus200(req);
				}//200://OK
				else{
					ErrorMessage("Invalid XMLHttpRequest status : " + req.status + " url: " + myRequestData.url);
				}
			}
			break;
		case 1://server connection established
		case 2://request received
		case 3://processing request
			break;
	//		case 404:
		case 0://request not initialized
		default:
			throw "processReqChange(); req.readyState = " + req.readyState;
			break;
		}//switch(req.readyState)
		return true;
	}
	
	, processStatus200Error: function (xmlhttp){
		var error = myRequest.GetElementText(xmlhttp, 'error', true);
		if(error)
		{
			ErrorMessage(error);
			return true;
		}
		return false;
	}
	
	, GetElementText: function (xmlhttp, tagName, noDisplayErrorMessage){
		if(!xmlhttp.responseXML){
			if(noDisplayErrorMessage != true)
				ErrorMessage('GetXMLElementText(xmlhttp, ' + tagName + '); xmlhttp.responseXML is null.\nxmlhttp.responseText:\n' + xmlhttp.responseText);
			return null;
		}
		var element = xmlhttp.responseXML.getElementsByTagName(tagName);
		
		//ATTENTION!!! For IE set the content-type m_HttpResponse.SetContentType("text/xml");
		
		if(element.length == 0){
			if(noDisplayErrorMessage != true)
				ErrorMessage('GetXMLElementText(xmlhttp, ' + tagName + '); element.length == ' + element.length);
			return "";
		}
		var text = "";
		for(var i = 0; i < element.length; i++){
			if(typeof(element[i].textContent) == 'undefined')
			{
				if(typeof(element[i].text) == 'undefined')
				{
					ErrorMessage('GetXMLElementText(xmlhttp, ' + tagName + '); element[' + i + '].text) == undefined');
					return '';
				}
				if(text != "")
					text += " ";
				text += element[i].text;//IE
			}
			else text += element[i].textContent;//Chrome
		}
		return text;
	}
}

