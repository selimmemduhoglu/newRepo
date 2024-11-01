/**
 * @fileOverview HD2000 Nimbus TCPPort Javascript API
 * <p><b>Copyright (c) Enseo, Inc. 2011
 *
 * This material contains trade secrets and proprietary information
 * and	may not	 be used, copied, disclosed or	distributed	 except
 * pursuant to	a license from Enseo, Inc. Use of copyright notice
 * does not imply publication or disclosure.</b>
 */

////////////////////////////////////////////////////////////////////////
//
// Reference   : $Source: /cvsroot/calica/apps/rootfs_common/root/usr/bin/data/html/js/enseo_tcpport.js,v $
//
// Revision	   : $Revision: 1.5 $
//
// Date		   : $Date: 2012-06-19 22:01:08 $
//
// Author(s)   : Tom Miller
//
// Description : HD STB Nimbus TCPPort javascript API.
//
////////////////////////////////////////////////////////////////////////

var EO_TCPPortCtrlArray = null;

/* The Nimbus.TCPPort Object is used for string based TCP Port communication
 * 
 * To Use:
 *   - Allocate a TCPPort 					tcp = Nimbus.getTCPPort();
 *   - set up callback function				tcp.msgReceiveFnc = fCallback;	
 *   - open the request, setting parms		tcp.open("192.168.0.1", 5000);
 *   - execute the request 1 or more times	tcp.send("some data");
 *   - receive data with tcp.msgReceiveFnc(msg);
 *   - when done, delete					tcp.destroy();
 *
 *
 * msgReceiveFnc has 1 parmeters: the text as a string return data
 */ 

/**
 * Initialized TCP Ports for use.  This call is made during invocation
 * of a Nimbus.TCPPort.  It establishes a Helper array for processing callbacks
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.InitTCPPorts = function() {
	if (null == EO_TCPPortCtrlArray) {
		EO_TCPPortCtrlArray = new Array();
		return true;
	}
	return false;
}

/**
 * Gets an interface for creating and control a TCPPort object.
 * 
 * @return {Nimbus.TCPPort} Instance of the Nimbus.TCPPort interface, or null if the object could not be created
 */
 
Nimbus.getTCPPort = function(){

	// Create a new TCPPort object
	var obj = new Nimbus.TCPPort();
	if (obj != null) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getTCPPort");
	}
	return obj;
};

/**
 * Class providing an interface for creating and controlling a TCPPort - use Nimbus.getTCPPort 
 * to obtain an instance.   A TCPPort can be created to receive IP multicast or unicast messages.
 * 
 * @class
 */

Nimbus.TCPPort = function(){
	if (null == EO_TCPPortCtrlArray) {	Nimbus.InitTCPPorts();	}

	// The TCPPort object
	this.TCPPortObj = new EONimbusTCPPort();
	this.ID = this.TCPPortObj.GetID();
	Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.TCPPort constructor, ID= " + this.ID);

	EO_TCPPortCtrlArray.push(this);
};

/**
 * Deletes the TCPPort.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.TCPPort.prototype.destroy = function(){
	if (null == EO_TCPPortCtrlArray) { return false; }
	for (var i = 0; i < EO_TCPPortCtrlArray.length; i++) {
		if (EO_TCPPortCtrlArray[i] == this) {
			EO_TCPPortCtrlArray.splice(i,1);
			this.close();
			delete this;
			return true;
		}
	}
	return false
};


/**
 * Gets the TCPPort ID.
 * 
 * @return {Number} Channel ID
 * 
 */

Nimbus.TCPPort.prototype.getID = function(){
	if (this.TCPPortObj == null) {
		return 0;
	}
	return this.ID;
};

/**
 * Set the Connection timeout, in seconds, for the TCPPort when it 
 * attempts to connect to the remote server.  This call must be made prior 
 * to opening the TCPPort.  The Default timeout is 3 seconds
 * 
 * @param {Number} seconds  Timeout, in seconds
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.TCPPort.prototype.setConnectionTimeout = function(seconds){
	if (this.TCPPortObj == null) {
		return false;
	}
	return this.TCPPortObj.SetConnectionTimeoutSeconds(seconds);
};

/**
 * Set the IP QoS IP_TOS files (Type of Service) which includes the 
 * Differentiated Services Code Point for the TCPPort.
 * The Default is 0, or do not set the IP_TOS field Type of Service.
 * 
 * @param {Number}  IpTOS IP_TOS Value
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.TCPPort.prototype.setIpTOS = function(IpTOS){
	if (this.TCPPortObj == null) {
		return false;
	}
	return this.TCPPortObj.SetIpTOS(IpTOS);
};

/**
 * Open the TCPPort and connected it to a remote server
 * 
 * @param {String}      Address    IP Address or Name.
 * @param {Number}      Port       IP  port.
 * @param {Boolean}     bAsyncOpen Optional: Open asynchronously if True.  This method will return
 *                                  True for this case.  Call the getConnectedStatus method to query whether
 *                                  the connection is open.  The Nimbus.Event.TCPPORT_STATUS event is
 *                                  sent when the connection is established.
 * @param {Numbrer}     asyncOpenRetryDelaySec 
 *                                  Optional: If bAsyncOpen is True, then this number specifies
 *                                  how often to retry connecting.  If 0, then only try once.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.TCPPort.prototype.open = function(address, port, bAsyncOpen, asyncOpenRetryDelaySec){
	if (this.TCPPortObj == null) {
		return false;
	}
	return this.TCPPortObj.Open(address, port, bAsyncOpen, asyncOpenRetryDelaySec);
};

/**
 * Closes the TCPPort.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.TCPPort.prototype.close = function(){
	if (this.TCPPortObj == null) {
		return false;
	}
	return this.TCPPortObj.Close();
};

/**
 * Gets the next message in the receive queue.  The message is effectively
 * consumed by calling this method.  This method can be called after the
 * Nimbus.Event.TCPPORT_STATUS with the ID for this port has been delivered
 * to the Nimbus Event Handler
 * 
 * @return {String} Message string if available, otherwise null
 * 
 */

Nimbus.TCPPort.prototype.getMessage = function(){
	if (this.TCPPortObj == null) {
		return false;
	}
	return this.TCPPortObj.GetMessage();
};

/**
 * Gets all messages in the receive queue.  The message is effectively
 * consumed by calling this method.  When messages are available, the event 
 * Nimbus.Event.TCPPORT_STATUS is passed to the main Nimbus app along with
 * the ID of the TCPPort. That can be called and handeld by 
 * Nimbus.HandleTCPPortEvent
 * If available, call app-implemented notification callback 'msgReceiveFnc'
 * 
 * @return {Number} Number messages read
 * 
 */

Nimbus.TCPPort.prototype.getMessages = function(){
	var count = 0;

	if (this.TCPPortObj == null) { 	return count; }

	while (1)
	{
		// Get the next message
		var msg = this.getMessage();
		if (msg == null) { return count; }
		count++;
		if (this.msgReceiveFnc) {
			this.msgReceiveFnc(msg);
		}
	}

	return count;
};


/**
 * Send a message to the TCPPort remote server.  If the send fails for any reason the 
 * TCPPort will be closed
 * Message can be a string or an Array of byte values.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.TCPPort.prototype.sendMessage = function(message){
	if (this.TCPPortObj == null) {
		return false;
	}
	if ('string' == typeof (message)) {
		// Pass the message string as-is
		return this.TCPPortObj.SendMessage(message);
	} else if ('object' == typeof (message)) {
		// Treat the message as an array of byte values.
		var m = message.toString();
		var nelms = message.length;
		return this.TCPPortObj.SendMessage(m, nelms);
	}
};

/**
 * Flushes the TCPPort receive message queue.  All messages currently in the
 * receive queue will be discarded.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.TCPPort.prototype.flush = function(){
	if (this.TCPPortObj == null) {
		return false;
	}
	return this.TCPPortObj.Flush();
};


/**
 * Gets the TCP connection status
 * 
 * @return {Boolean} True if successfully connected
 * 
 */

Nimbus.TCPPort.prototype.getConnectedStatus = function(){
	if (this.TCPPortObj == null) {
		return false;
	}
	return  this.TCPPortObj.GetConnectedStatus ();
};

/**
 * Helper function to process Nimbus.Event.TCPPORT_STATUS
 * Call this from inside the Nimbus Event Handler to look up 
 * the Nimbus.TCPPort object and invoke any necessary callbacks.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.HandleTCPPortEvent = function(event) {
	if (!EO_TCPPortCtrlArray ||  Nimbus.Event.TCPPORT_STATUS != event.EventMsg) {
		return false;
	}

	for (var i = 0; i < EO_TCPPortCtrlArray.length; i++) {
		if (EO_TCPPortCtrlArray[i].ID == event.EventData[0])
		{
			EO_TCPPortCtrlArray[i].getMessages();
			return true;
		}
	}

	return false;
}
