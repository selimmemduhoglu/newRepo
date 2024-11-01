/**
 * @fileOverview HD2000 Nimbus HTTP Request Javascript API
 * <p><b>Copyright (c) Enseo, Inc. 2011
 *
 * This material contains trade secrets and proprietary information
 * and	may not	 be used, copied, disclosed or	distributed	 except
 * pursuant to	a license from Enseo, Inc. Use of copyright notice
 * does not imply publication or disclosure.</b>
 */

////////////////////////////////////////////////////////////////////////
//
// Reference   : $Source: /cvsroot/calica/apps/rootfs_common/root/usr/bin/data/html/js/enseo_httprequest.js,v $
//
// Revision	   : $Revision: 1.2 $
//
// Date		   : $Date: 2013-02-15 00:20:39 $
//
// Author(s)   : Tom Miller
//
// Description : HD STB Nimbus HTTP Request javascript API.
//
////////////////////////////////////////////////////////////////////////


/* Nimbus.HTTPRequest Object is a replacement use object for browser XMLHTTPRequest.  
 * Use of this object is not suspect to browser cross domain origin checks, supports
 * timeouts and closing of connections, and has controlled resource usage.
 * 
 * To Use:
 *   - Allocate a request 					req = Nimbus.getHTTPRequest();
 *   - set up callback function				req.msgCallBackFnc = fCallback;	
 *   - open the request, setting parms		req.open("GET", "http://192.168.0.1/data.json");
 *   - execute the request 1 or more times	req.send(null);
 *   - receive callback req.msgCallBackFnc(bSucces, value);
 *   - when done, delete					req.destroy();
 *
 *
 * msgCallBackFnc has 2 parmeters:
 *		the first is a boolean, true if successful, false is failed
 *		the second is the text as a string from the request if successful
 */ 

var EO_HTTPRequestCtrlArray = null;

/**
 * Initialized HTTP Requests for use.  This call is made during invocation
 * of a Nimbus.HTTPRequest.  It establishes a Helper array for processing callbacks
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.InitHTTPRequests = function() {
	if (null == EO_HTTPRequestCtrlArray) {
		EO_HTTPRequestCtrlArray = new Array();
		return true;
	}
	return false;
}

/**
 * Gets an interface for creating and control an HTTP Request object.
 * Nimbus.InitHTTPRequests() Must be called prior to invoking this function.
 * 
 * @return {Nimbus.HTTPRequest} Instance of the Nimbus.HTTPRequest interface, or null if the object could not be created
 */
 
Nimbus.getHTTPRequest = function(){
	// Create a new HTTP Request Object
	var req = new Nimbus.HTTPRequest();
	if (req != null) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getHTTPRequest");		
	}
	return req;
};

/**
 * Class providing an interface for creating and controlling a HTTPRequest - use Nimbus.getHTTPRequest 
 * to obtain an instance.   A HTTPRequest can be created to receive IP multicast or unicast messages.
 * 
 * @class
 */

Nimbus.HTTPRequest = function(){
	if (null == EO_HTTPRequestCtrlArray) {	Nimbus.InitHTTPRequests();	}

	// Create the HTTP Request object
	this.HTTPRequestObj = new EONimbusHTTPRequest();
	this.ID = this.HTTPRequestObj.GetID();
	Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.HTTPRequest constructor, ID= " + this.ID);

	EO_HTTPRequestCtrlArray.push(this);
};


/**
 * Deletes the HTTPRequest.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.HTTPRequest.prototype.destroy = function(){
	if (null == EO_HTTPRequestCtrlArray) { return false; }
	for (var i = 0; i < EO_HTTPRequestCtrlArray.length; i++) {
		if (EO_HTTPRequestCtrlArray[i] == this) {
			EO_HTTPRequestCtrlArray.splice(i,1);
			this.close();
			delete this;
			return true;
		}
	}
	return false
};

/**
 * Gets the HTTPRequest ID.
 * 
 * @return {Number} Channel ID
 * 
 */

Nimbus.HTTPRequest.prototype.getID = function(){
	if (this.HTTPRequestObj == null) {
		return 0;
	}
	return this.ID;
};

/**
 * Open the HTTPRequest, preparing it to connect it to a remote URL.  An HTTP Request Object
 * can be opened, and then used multiple times with the send function.  Subsequent calls to open
 * will fail unless the object has been closed either explicitly or by a send error.  The default
 * behavior is to run asynchronously, with retrieved message being notified as available using
 * Nimbus.Event.HTTPREQUEST_MESSAGE
 * 
 * @param {String}  Method, should be either "HEAD", "GET" or "POST"
 * @param {String}  URL, the fully qualified remote URL to connect
 * @param {Boolean} Run Async, (OPTIONAL) defaults to true
 * @param {String}  Username,  (OPTIONAL) Username to use with HTTP Request
 * @param {String}  Password,  (OPTIONAL) Password for Username to use with HTTP Request
 * @param {Number}  TimeoutMS, (OPTIONAL) Timeout, in milliseconds, for the request to live.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.HTTPRequest.prototype.open = function(Method, URL, bAsync, Username, Password, Timeout){
	if (this.HTTPRequestObj == null) {
		return false;
	}
	return this.HTTPRequestObj.Open(Method, URL, bAsync, Username, Password, Timeout);
};

/**
 * Get the current HTTP Status code
 * 
 * @return {Number} HTTP Status code.  It will be 0 on any errors
 * 
 */
Nimbus.HTTPRequest.prototype.getHTTPstatus = function() {
	if (this.HTTPRequestObj == null) {
		return 0;
	}
	return this.HTTPRequestObj.HTTPStatus();
}


/**
 * Aborts an HTTPRequest.
 * 
 * @return {Boolean} True if successful
 * 
 */
Nimbus.HTTPRequest.prototype.abort = function(){
	return this.close();
}

/**
 * Closes the HTTPRequest.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.HTTPRequest.prototype.close = function(){
	if (this.HTTPRequestObj == null) {
		return false;
	}
	return this.HTTPRequestObj.Close();
};

/**
 * Adds an HTTP Header to the HTTPRequest.  Existing Headers will be preserved.  
 * The request must be open prior to adding headers.
 *
 * @param {String} Header Header to be added or modified. 
 * @param {String} Value Value assigned to the header
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.HTTPRequest.prototype.setRequestHeader = function(Header, Value){
	if (this.HTTPRequestObj == null) {
		return false;
	}
	return this.HTTPRequestObj.AddHeader(Header+": "+Value);
};

/**
 * Send a message to the HTTPRequest remote server.  If the send fails for any reason the 
 * HTTPRequest will be closed
 *
 * @param {String} PostData (OPTIONAL) Data to post in send, used for "POST" Method HTTP Requests
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.HTTPRequest.prototype.send = function(PostData){
	if (this.HTTPRequestObj == null) {
		return false;
	}
	return this.HTTPRequestObj.Send(PostData);
};

/**
 * Gets the next message in the receive queue.  The message is effectively
 * consumed by calling this method.  When messages are available, the event 
 * Nimbus.Event.HTTPREQUEST_MESSAGE is passed to the main Nimbus app along with
 * the ID of the HTTPRequest
 * 
 * @return {String} Message string if available, otherwise null
 * 
 */

Nimbus.HTTPRequest.prototype.getMessage = function(){
	if (this.HTTPRequestObj == null) {
		return null;
	}
	this.status =  this.HTTPRequestObj.HTTPStatus();
	return this.HTTPRequestObj.GetMessage();
};

/**
 * Gets all messages in the receive queue.  The message is effectively
 * consumed by calling this method.  When messages are available, the event 
 * Nimbus.Event.HTTPREQUEST_MESSAGE is passed to the main Nimbus app along with
 * the ID of the HTTPRequest. That can be called and handeld by 
 * Nimbus.HandleHTTPRequestEvent
 * If available, call app-implemented notification callback 'msgCallBackFnc'
 * 
 * @return {Number} Number messages read
 * 
 */

Nimbus.HTTPRequest.prototype.getMessages = function(){
	var count = 0;

	if (this.HTTPRequestObj == null) { 	return count; }

	while (1)
	{
		// Get the next message
		var msg = this.getMessage();
		if (msg == null) { return count; }
		count++;
		if (this.msgCallBackFnc) {
			this.msgCallBackFnc("EO_ERROR" != msg, msg);
		}
	}

	return count;
};

/**
 * Gets the named header from the header receive queue.  
 *
 * @param {String} Name of Header to be retrieved
 * 
 * @return {String} Header value string if available, otherwise null
 * 
 */

Nimbus.HTTPRequest.prototype.getResponseHeader = function(Name){
	if (this.HTTPRequestObj == null) {
		return null;
	}
	return this.HTTPRequestObj.GetHeader(Name);
};

/**
 * Gets all headers in the receive queue. 
 *
 * @return {String} String with all headers
 * 
 */

Nimbus.HTTPRequest.prototype.getAllResponseHeaders = function(){
	var count = 0;

	if (this.HTTPRequestObj == null) { 	return count; }

	return this.HTTPRequestObj.GetAllHeaders();
};


/**
 * Flushes the HTTPRequest receive message and header queues.  All data currently in the
 * queues will be discarded.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.HTTPRequest.prototype.flush = function(){
	if (this.HTTPRequestObj == null) {
		return false;
	}
	return this.HTTPRequestObj.Flush();
};

/**
 * Helper function to process Nimbus.Event.HTTPREQUEST_MESSAGE 
 * Call this from inside the Nimbus Event Handler. 
 * It will look up an Nimbus.HTTPRequest object and invoke any 
 * necessary callbacks.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.HandleHTTPRequestEvent = function(event) {
	if (!EO_HTTPRequestCtrlArray ||
		(Nimbus.Event.HTTPREQUEST_MESSAGE != event.EventMsg)) {
		return false;
	}

	for (var i = 0; i < EO_HTTPRequestCtrlArray.length; i++) {
		if (EO_HTTPRequestCtrlArray[i].ID == event.EventData[0])
		{
			EO_HTTPRequestCtrlArray[i].getMessages();
			return true;
		}
	}

	return false;
}

/**
 * Open the HTTPRequest for download, preparing it to connect it to a remote URL.
 * Subsequent calls to open will fail unless the object has been closed either
 * explicitly or by a send error.  The default behavior is to run asynchronously.
 * 
 * @param {String}  Drive, the local drive to store to downloaded file
 * @param {String}  URL, the fully qualified remote URL to connect
 * @param {Boolean} Run Async, (OPTIONAL) defaults to true
 * @param {String}  Username,  (OPTIONAL) Username to use with HTTP Request
 * @param {String}  Password,  (OPTIONAL) Password for Username to use with HTTP Request
 * @param {Number}  TimeoutMS, (OPTIONAL) Timeout, in milliseconds, for the request to live.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.HTTPRequest.prototype.openDownload = function(Drive, URL, bAsync, Username, Password, Timeout){
	if (this.HTTPRequestObj == null) {
		return false;
	}
	return this.HTTPRequestObj.OpenDownload(Drive, URL, bAsync, Username, Password, Timeout);
};

/**
 * Get the current percent transferred from a openDownload() call
 * 
 * @return {Number} Percentage transferred
 * 
 */
Nimbus.HTTPRequest.prototype.getPercentTransferred = function() {
	if (this.HTTPRequestObj == null) {
		return 0;
	}
	return this.HTTPRequestObj.PercentTransferred();
}

