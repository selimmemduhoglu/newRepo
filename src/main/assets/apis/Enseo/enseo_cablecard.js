/**
 * @fileOverview Enseo Nimbus AppLog Javascript API
 * <p><b>Copyright (c) Enseo, Inc. 2009-2010
 *
 * This material contains trade secrets and proprietary information
 * and	may not	 be used, copied, disclosed or	distributed	 except
 * pursuant to	a license from Enseo, Inc. Use of copyright notice
 * does not imply publication or disclosure.</b>
 */

////////////////////////////////////////////////////////////////////////
//
// Reference   : $Source: /cvsroot/calica/apps/rootfs_common/root/usr/bin/data/html/js/enseo_cablecard.js,v $
//
// Revision	   : $Revision: 1.1 $
//
// Date		   : $Date: 2012-03-26 15:04:12 $
//
// Description : Nimbus GUI Assist javascript API.
//
////////////////////////////////////////////////////////////////////////


/**
* GUI Assist object class.
* 
* @class
* @constructor
*/

/**
 * Gets an interface for querying and controlling CableCARD.
 * 
 * @return {Nimbus.CableCARD} Instance of the Nimbus.CableCARD interface, or
 * null if the object could not be created
 */

Nimbus.getCableCARD = function()
{
	// Create a new browser window class
	var win = new Nimbus.CableCARD();
	if (win != null) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getCableCARD");
	}
	return win;
};

/**
 * Objtect to query and control CableCARD.
 * 
 * @class
 */

Nimbus.CableCARD = function()
{
    // Create a browser window object
    this.CableCARDObj = new EONimbusCableCARD();
    
    Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.CableCARD constructor");
};

/**
 * Query support for CableCARD.
 * 
 * @return {Boolean} True if CableCARD is supported.
 */

Nimbus.CableCARD.prototype.supportCableCARD = function () {
	return this.CableCARDObj.SupportCableCARD ();
};


/**
 * Query if CableCARD is installed and is online.  This method will
 * return no value if CableCARD is not supported.
 * 
 * @return {Boolean} True if a CableCARD POD is installed and online.
 */

Nimbus.CableCARD.prototype.getOnlineState = function () {
	return this.CableCARDObj.GetOnlineState ();
};

/**
 * Query the CableCARD binding information.
 * 
 * @return {Object}
 * 	{Boolean} online 	- True if CableCARD is installed and online.  If false the remaining members are not present. <br>
 * 	{String}  hostID 	- Host ID <br>
 *  {String}  cardID 	- Card ID <br>
 *  {String}  serial 	- Card serial number <br>
 *  {String}  data 		- Additional binding data if supplied by the CableCARD POD <br>
 *  {Number}  manufactuerID - Manufacturer ID <br>
 *  {String}  manufacturer  - Manufacturer name derived from manufacturerID <br>
 *  {Number}  cardVersion   - Manufactuer specific card version <br>
 *  {String}  validated     - "1" if host/card pair valid. "0" if host/card pair not valid. "?" if condition unknown. <br>
 *
 */

Nimbus.CableCARD.prototype.getBinding = function () {
	try {
		var json = this.CableCARDObj.GetBinding ();
		if (json == null) {
			return null;
		}
		return eval('(' + json + ')');
	}
	catch (e) {}
	return null;
};

/**
 * Query the CableCARD channel map.
 * 
 * @return {Object}
 *   {Array} ChannelMap  - Array of CableCARD channel objects
 *      {Object}         - CableCARD channel object
 *        {Number} ChannelID     - Channel number within native channel ring <br>
 *        {String} ChannelType   - Channel type, CableCARD <br>
 *        {String} ChannelLabel  - Channel label, shortened version of channel title <br>
 *        {Object} CableCARDChannelParams -  Channel parameters specifica to CableCARD <br>
 *          {Number} VirtualChannelNumber - Channel number within CableCARD channel map <br>
 *          {String} SourceID    - Unique identifier for this channel <br>
 *          {String} Title       - CableCARD channel title <br>
 *          {String} LongTitle   - CableCARD channel long title. <br>
 *          {String} PhysicalChannelIDType - For CableCARD channels this has value Freq <br>
 *          {Number} Frequency   - CableCARD channel frequency (Hz) if PhysicalChannelIDType is Freq <br>
 *          {String} DemodMode   - CableCARD channel demod mode (Auto, QAM64, QAM256, QAM512...) <br>
 *          {String} ProgramSelectionMode = Program selection mode (normally PATProgram) <br>
 *          {Number} ProgramID   - Program ID if ProgramSelectionMode is PATProgram or PATProgramIndex. <br>
 *                                 Minor ID if ProgramSelectionMode is VCTChannel. <br>
 *          {Number} MajorID     - Major ID if ProgramSelectionMode is VCTChannel.  (Not present otherwise). <br>
 *          {Number} VideoPID    - Video PID if ProgramSelectionMode is PID. (Not present otherwise). <br>
 *          {Number} AudioPID    - Audio PID if ProgramSelectionMode is PID. (Not present otherwise). <br>
 *
 */

Nimbus.CableCARD.prototype.getChannelMap = function () {
	try {
		var json = this.CableCARDObj.GetChannelMap ();
		if (json == null) {
			return null;
		}
		this.CableCARDObj.ReleaseData ();
		return eval('(' + json + ')');
	}
	catch (e) {}
	return null;
};

/**********************************************************************************************
***********************************************************************************************
**********************************************************************************************/
