var NumPanels = 16;
var CurPanel = 1;

var bDoHandshaking = true;

// Network pull code update settings
var Update_LocationIP = "192.168.1.141";
var Update_Port = "";
var Update_Protocol = "ftp";
var Update_Username = "anonymous";
var Update_Password = "";
var Update_FilePath = "updates/update.eoc";

// Content update settings used to load default html content
var ContentUpdate_LocationIP = "192.168.255.20";
var ContentUpdate_Port = "";
var ContentUpdate_Protocol = "ftp";
var ContentUpdate_Username = "anonymous";
var ContentUpdate_Password = "";
var ContentUpdate_File = "update.xml";
var ContentUpdate_Folder = "hd2000_init";
var ContentUpdate_Drive = "System Drive";

var RTSPStartPosition = 0;
var RTSPPosition = RTSPStartPosition;

var NumTestChanOptions = 20;
var NumSetInputOptions = 14;

var AVInputList; 						// List of A/V inputs

var bVideoInWindow = true;
var VideoRectIndex = 0;

// Video window size/position
var VideoRect = new Array();
VideoRect[0] = new Object;
VideoRect[0].x = 590;
VideoRect[0].y = 150;
VideoRect[0].width = 550;
VideoRect[0].height = 309;

VideoRect[1] = new Object;
VideoRect[1].x = 958;
VideoRect[1].y = 40;
VideoRect[1].width = 300;
VideoRect[1].height = 170;

VideoRect[2] = new Object;
VideoRect[2].x = 0;
VideoRect[2].y = 0;
VideoRect[2].width = 1280;
VideoRect[2].height = 720;

var VideoBlendingMode = "uniform_alpha";
//	var VideoBlendingMode = "uniform_alpha";
//	var VideoBlendingMode = "page_alpha";
//	var VideoBlendingMode = "colorkey_alpha";

var ScreenWidth = window.innerWidth;
var ScreenHeight = window.innerHeight;

var bUseSpacialNav = false;
var bUseSpacialNavHighlighting = false;

var UpdateTime = 0;

var bUseSTBVolumeIndicator = false; 		// Set to true to enable STB volume/mute indictors

var AutoRFUpdateChannel = 79; 			// RF channel to check for an RF update
var bAutoRFUpdateSearch = true; 			// Search other channels for an update stream

var bCheckURL = false; 					// Set to true to enable server connectivity checking
var URLToCheck = "192.168.1.2";
var URLCheckTimeout = 10;
var URLCheckPeriod = 20;
// Test data for SetAppData()
var TestData = "Test string for setAppData.";

//			var KeyboardTypeData = "RCMM";				// Keyboard Type data for SetKeyboardMap() and GetKeyboardMap()
var KeyboardTypeData = "4PPM"; 			// Keyboard Type data for SetKeyboardMap() and GetKeyboardMap()

//			var KeyboardMapData = "Auto";				// Keyboard Map data for SetKeyboardMap() 
var KeyboardMapData = "US"; 				// Keyboard Map data for SetKeyboardMap() 
//			var KeyboardMapData = "UK";					// Keyboard Map data for SetKeyboardMap() 

var CurrentBtnFlags = BUTTONS_NONE;

var BrowserWin = null; 					// Browser window
var TestURL1 = "http://news.google.com/nwshp?hl=en&tab=wn";
var TestURL2 = "http://www.weather.com/outlook/recreation/outdoors/hourbyhour/75081?from=36hr_topnav_outdoors";

var BrowserWidget;
var BrowserWidgetPath = new Array();
BrowserWidgetPath[0] = "touch_the_sky.wgt";
BrowserWidgetPath[1] = "MSNBC News_6412_1.0.wgt";
BrowserWidgetPath[2] = "google_reader.wgt";
//			BrowserWidgetPath[3] = "Google Map_7383_1.13.wgt";
var BrowserWidgetIndex = 0;
var BrowserWidgetX1 = 500;
var BrowserWidgetY1 = 30;
var BrowserWidgetX2 = 200;
var BrowserWidgetY2 = 100;

var bShowBrowserInitially = false;

var CntEnableUpdates = 0;

var DataChanList = new Array(); 			// Data channel objects
var CurChanIndex = 0;

var bExtPowerControl = false;



//////////////////////////////////////////////////////////////////////////////////////////
// Page initialization handler						
//////////////////////////////////////////////////////////////////////////////////////////
function InitPage2() {


    // Enable/disable auto spacial nav by the browser for arrow keys
    Nimbus.setAutoSpacialNavigationEnable(bUseSpacialNav);
    Nimbus.setAutoSpacialNavigationHighlighting(bUseSpacialNavHighlighting);

    // Allow Options menu
    Nimbus.setOptionsMenuEnable(false);




    // Populate channel options using the channel list
    for (i = 0; i < NumTestChanOptions; i++) {
        if (i < ChanList.length) {
            var e = document.getElementById("chlnk" + i);
            if (e != null) {
                Nimbus.logMessage("Setting label for chan " + (i + 1));
                e.innerHTML = ChanList[i].Label;
            }
        } else {
            var e = document.getElementById("ch" + i);
            if (e != null) {
                e.style.visibility = "hidden";
            }
        }
    }
    // Disable all of the play controls
    ShowControls(BUTTONS_NONE);

    // Handle Power - Turn the TV on if it was off
    var TVController = Nimbus.getTVController();
    if (TVController != null) {
        if (TVController.getPower()) {
            // TV Is already in the 'On' state, so do nothing
            Nimbus.logMessage("INFO: TV reports being ON");
        } else {
            // TV is in the OFF state
            Nimbus.logMessage("INFO: TV reports being OFF");
            // Ask the TV to turn on
            TVController.setPower(true);
        }

        // Enable/disable the volume & mute display by the STB.  If disabled,
        // then TV UI should be enabled to show a volume indicator.
        TVController.setVolumeIndicatorEnable(bUseSTBVolumeIndicator);

    } else {
        Nimbus.logMessage("Failed to get TVController");
    }

    // Show various info read via the Nimbus API
    //ShowInfo();

    // Enable mouse pointer
    SetMousePointerEnable(true);

    // Create an event listener for events generated by native code
    Nimbus.addEventListener(EventHandler);

    // Tune to the default channel
    Tune(DefChannel, false, true, BUTTONS_ALL);

    DataChanList[0] = new DataChan();
    DataChanList[1] = new DataChan();
    DataChanList[2] = new DataChan();
    DataChanList[3] = new DataChan();

    // Start a timer
    setInterval(TimerHandler, 500);

    // Timer hander
    var count = 0;
    function TimerHandler() {
        count++;
        // Handshake with native code to indicate we are alive (this is required)
        if (bDoHandshaking) {
            Nimbus.handshake("EnseoTest");
        }

        // Update player info panel
        ShowPlayerInfo(false);

        // Read the output status
        ReadOutputStatus();

        if (CntEnableUpdates) {
            if (--CntEnableUpdates == 0) {
                // Enable screen and video window updates
                Nimbus.setScreenUpdateEnable(true, true);
            }
        }

        //					// Trigger an update a few seconds after loading the page					
        //					if (++UpdateTime == 10) {
        //						// Handle Power - Turn the TV off
        //						var TVController = Nimbus.getTVController();
        //						if (TVController != null) {
        //							TVController.setPower(false);
        //						}
        //						FirmwareUpdateNetworkPull();
        //					}

        //					// Trigger a reboot
        //					if (++UpdateTime == 2) {
        //						Nimbus.logMessage("Rebooting...");
        //						Nimbus.reboot();
        //					}

    }
    document.getElementById('PrevPanelButton').addEventListener('click', PrevCmdPanel, false);
    document.getElementById('NextPanelButton').addEventListener('click', NextCmdPanel, false);

    // Setup the onclick handler for the URL entry form
    document.URLEntryForm.ok_button.onclick = HandleOkButton;
    document.URLEntryForm.onsubmit = HandleSubmit;
    // Set the default text in the form
    document.URLEntryForm.URLInputText.value = "http://www.google.com";

    if (bShowBrowserInitially) {
        // Show the browser window
        BrowserWinCreate(TestURL1);
        // Show a widget window
        BrowserWidgetCreate();
    }

    // Enable loading of remote URLs
    Nimbus.setMainPageLoadingEnable(true);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Show the selected command panel
//////////////////////////////////////////////////////////////////////////////////////////
function ShowPanel(panel) {
    Nimbus.logMessage("ShowPanel: " + panel);
    var e = document.getElementById("panel_name");
    if (e == null) {
        return false;
    }
    var disp_panel = panel + 1;
    e.innerHTML = "Panel " + disp_panel;

    var bShown = false;
    for (p = 0; p < NumPanels; p++) {
        var e = document.getElementById("cmd_panel" + p);
        if (typeof e != null) {
            if (panel == p) {
                e.style.visibility = "visible";
                bShown = true;
            } else {
                e.style.visibility = "hidden";
            }
        }
    }
    return bShown;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Show the next command panel
//////////////////////////////////////////////////////////////////////////////////////////
function NextCmdPanel(ev) {
    CurPanel += 1;
    if (!ShowPanel(CurPanel)) {
        CurPanel = 0;
        ShowPanel(CurPanel);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Show the previous command panel
//////////////////////////////////////////////////////////////////////////////////////////
function PrevCmdPanel(ev) {
    CurPanel -= 1;
    if (CurPanel < 0) {
        CurPanel = NumPanels - 1;
    }
    ShowPanel(CurPanel);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Get a string for the specified player status code
//////////////////////////////////////////////////////////////////////////////////////////
function GetPlayerStatusStr(StatusCode) {
    switch (StatusCode) {
        case Nimbus.Player.Status_OK: return "Ok";
        case Nimbus.Player.Status_Reacquiring: return "Re-acquiring";
        case Nimbus.Player.Status_NoRFHW: return "No RF Hardware";
        case Nimbus.Player.Status_PowerOff: return "Power Off";
        case Nimbus.Player.Status_DemodLockFailed: return "Demod Lock Failed";
        case Nimbus.Player.Status_NotAuthorized: return "Not Authorized";
        case Nimbus.Player.Status_Authorizing: return "Authorizing";
        case Nimbus.Player.Status_Pending: return "Pending";
        case Nimbus.Player.Status_Closed: return "Closed";
        case Nimbus.Player.Status_EndOfStream: return "End of stream";
        case Nimbus.Player.Status_NotAvailable: return "Resource not available";
        case Nimbus.Player.Status_RTSP_TCPOpenFailed: return "RTSP TCP Open Failed";
        case Nimbus.Player.Status_RTSP_OptionsReqFailed: return "RTSP Options Req Failed";
        case Nimbus.Player.Status_RTSP_DescribeReqFailed: return "RTSP Describe Req Failed";
        case Nimbus.Player.Status_RTSP_SetupReqFailed: return "RTSP Setup Req Failed";
        case Nimbus.Player.Status_RTSP_PlayReqFailed: return "RTSP Play Req Failed";
        case Nimbus.Player.Status_RTSP_PauseReqFailed: return "RTSP Pause Req Failed";
        case Nimbus.Player.Status_AnalogDecoderLockFailed: return "Analog Decoder Lock Failed";
        case Nimbus.Player.Status_AnalogCaptureOpenFailed: return "Analog Capture Open Failed";
        case Nimbus.Player.Status_TSPlayer_OpenFailed: return "TS Player Open Failed";
        case Nimbus.Player.Status_TSPlayer_PlayFailed: return "TS Player Play Failed";
        case Nimbus.Player.Status_TSPlayer_PATError: return "TS Player PAT Error";
        case Nimbus.Player.Status_TSPlayer_PMTError: return "TS Player PMT Error";
        case Nimbus.Player.Status_TSPlayer_VCTError: return "TS Player VCT Error";
        case Nimbus.Player.Status_TSPlayer_ProgramNotAvail: return "TS Player Program Not Avail";
        case Nimbus.Player.Status_TSPlayer_PlaybackError: return "TS Player Playback Error";
        case Nimbus.Player.Status_IP_OpenFailed: return "IP Open Failed";
        case Nimbus.Player.Status_Error:
        default: break;
    }
    return "Error";
}

//////////////////////////////////////////////////////////////////////////////////////////
// Display player status information
//////////////////////////////////////////////////////////////////////////////////////////
function ShowPlayerInfo(bLog) {
    var info;
    info = "PLAYER STATUS <br>";
    var player = Nimbus.getPlayer();
    if (player == null) {
        info += "No Active Player"
    } else {
        // Read the player status
        var bReady = player.isReady();
        var bInError = player.isInError();
        var status = player.getErrorStatus();
        var speed = player.getSpeed();
        var position = player.getPosition();
        var length = player.getContentLength();
        var bVChipBlocking = player.isVChipBlocking();

        var ready_status = "Ready= ";
        if (bReady) {
            ready_status += "yes";
        } else {
            ready_status += "no";
        }
        var error_status = "Error= ";
        if (bInError) {
            error_status += "yes, ";
        } else {
            error_status += "no, ";
        }
        error_status += GetPlayerStatusStr(status);
        info += ready_status + ", " + error_status;
        info += "<br>";
        if (bReady) {
            info += "Speed= " + speed;
            info += ", Position= " + position.toFixed(2) + "s";
            info += ", Length= " + length.toFixed(2) + "s";
        }
        info += "<br>";
        var rating = player.getProgramRating();
        info += "Rating: ";
        if (rating != null) {
            info += rating;
        } else {
            info += "unknown";
        }
        info += ", VChip Blocking: ";
        if (bVChipBlocking) {
            info += "yes";
        } else {
            info += "no";
        }
        info += "<br>";
        var title = player.getProgramTitle();
        info += "Title: ";
        if (title != null) {
            info += title;
        } else {
            info += "unknown";
        }
    }
    if (bLog) {
        Nimbus.logMessage(info);
    }

    // Display the info
    msg = document.getElementById("player_info");
    msg.innerHTML = info;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Read the output status
//////////////////////////////////////////////////////////////////////////////////////////
function ReadOutputStatus() {
    var msg = "OutputStatus: "
    msg += "Active= ";
    if (Nimbus.isOutputActive()) {
        msg += "yes";
    } else {
        msg += "no";
    }
    msg += ", Protected= ";
    if (Nimbus.getOutputProtection()) {
        msg += "yes";
    } else {
        msg += "no";
    }
    // Uncomment to see log messages showing the status
    //Nimbus.logMessage(msg);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Close the player
//////////////////////////////////////////////////////////////////////////////////////////
function Close() {
    //Nimbus.logMessage("Tune: closing current player\n");
    var player = Nimbus.getPlayer();
    if (player != null) {
        player.close();
    }
    //ShowPlayerInfo(true);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Tune to the specified content
//////////////////////////////////////////////////////////////////////////////////////////
function Tune(ChanIndex, bClose, bPlay, btn_flags) {
    if (bClose) {
        Close();
    }
    CurChanIndex = ChanIndex;
    content = ChanList[ChanIndex].ChanDesc;

    var player = Nimbus.getPlayer(content, RTSPStartPosition, "0123456789abcdef1");
    if (player != null) {
        // Allow retry on open failure (applicable to RTSP only)
        player.setRetryEnable(true);
        if (bPlay) {
            Nimbus.logMessage("Tune: got a player, issuing play");
            player.play();
        }
    } else {
        Nimbus.logMessage("Tune: player not available");
        return;
    }

    // Show video window 
    ShowVideo();

    // Update player info panel
    ShowPlayerInfo(true);

    // Show/hide playback controls as needed				
    CurrentBtnFlags = btn_flags;
    ShowControls(btn_flags);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Set the specified player content using the setContent method
//////////////////////////////////////////////////////////////////////////////////////////
function SetPlayerContent(ChanIndex, btn_flags) {
    if (ChanIndex >= ChanList.length) {
        Nimbus.logMessage("Tune: channel index is invalid: " + ChanIndex);
        return;
    }
    content = ChanList[ChanIndex].ChanDesc;

    Nimbus.logMessage("SetPlayerContent: getting a player for content= " + content);
    // Get the current player
    var player = Nimbus.getPlayer();
    if (player != null) {
        Nimbus.logMessage("SetPlayerContent: got the current player, issuing setContent");
        player.setContent(content);
    } else {
        Nimbus.logMessage("SetPlayerContent: player not available");
        return;
    }
    CurrentBtnFlags = btn_flags;
    ShowControls(btn_flags);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Issue play command
//////////////////////////////////////////////////////////////////////////////////////////
function Play() {
    var player = Nimbus.getPlayer();
    if (player != null) {
        player.play();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Issue stop command
//////////////////////////////////////////////////////////////////////////////////////////
function Stop() {
    var player = Nimbus.getPlayer();
    if (player != null) {
        player.stop();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Issue pause command
//////////////////////////////////////////////////////////////////////////////////////////
function Pause() {
    var player = Nimbus.getPlayer();
    if (player != null) {
        player.pause();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Issue speed command
//////////////////////////////////////////////////////////////////////////////////////////
function SetSpeed(speed) {
    var player = Nimbus.getPlayer();
    if (player != null) {
        player.setSpeed(speed);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Get the speed
//////////////////////////////////////////////////////////////////////////////////////////
function GetSpeed() {
    var player = Nimbus.getPlayer();
    if (player != null) {
        return player.getSpeed();
    }
    return 0;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Issue position command
//////////////////////////////////////////////////////////////////////////////////////////
function SetPosition(position) {
    var player = Nimbus.getPlayer();
    if (player != null) {
        Nimbus.logMessage("SetPosition= " + position + "s");
        player.setPosition(position);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Test the position command
//////////////////////////////////////////////////////////////////////////////////////////
function TestPosition(dir) {
    RTSPPosition += 200 * dir;
    Nimbus.logMessage("TestPosition, changing position to= " + RTSPPosition + "s");

    SetPosition(RTSPPosition);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Reset position to the starting position
//////////////////////////////////////////////////////////////////////////////////////////
function ResetPosition() {
    RTSPPosition = RTSPStartPosition;
    Nimbus.logMessage("Resetting position to the start position= " + RTSPStartPosition + "s");
    SetPosition(RTSPPosition);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Request position
//////////////////////////////////////////////////////////////////////////////////////////
function GetPosition() {
    var player = Nimbus.getPlayer();
    if (player != null) {
        var position = player.getPosition();
        var msg;
        if (position != null) {
            msg = "Position= " + position + "s";
        } else {
            msg = "Position not available";
        }
        var panel = document.getElementById("stb_info");
        panel.innerHTML = msg;
        Nimbus.logMessage(msg);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Show the specified player control buttons
//////////////////////////////////////////////////////////////////////////////////////////

var BUTTONS_NONE = 0;
var BUTTONS_ALL = 0x1f;
var BUTTONS_RFANALOG = 0x0a;
var BUTTONS_RFDIGITAL = 0x0e;
var BUTTONS_IP = 0x0e;
var BUTTONS_RTSP = 0x1f;

function ShowControls(btn_flags) {
    var e;
    e = document.getElementById("btn_fast_reverse");
    if (typeof e != null) {
        e.style.visibility = btn_flags & 0x1 ? "visible" : "hidden";
    }
    e = document.getElementById("btn_play");
    if (typeof e != null) {
        e.style.visibility = btn_flags & 0x2 ? "visible" : "hidden";
    }
    e = document.getElementById("btn_pause");
    if (typeof e != null) {
        e.style.visibility = btn_flags & 0x4 ? "visible" : "hidden";
    }
    e = document.getElementById("btn_stop");
    if (typeof e != null) {
        e.style.visibility = btn_flags & 0x8 ? "visible" : "hidden";
    }
    e = document.getElementById("btn_fast_forward");
    if (typeof e != null) {
        e.style.visibility = btn_flags & 0x10 ? "visible" : "hidden";
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Get size of div
//////////////////////////////////////////////////////////////////////////////////////////
function GetDivRect(ID) {
    // Determine the position of the div
    var x = 0;
    var y = 0;
    var width = 0;
    var height = 0;
    var e = document.getElementById(ID);
    if (typeof e != null) {
        width = e.offsetWidth - 4;
        height = e.offsetHeight - 4;
        // The position offset is relative to the containing element.  As such,
        // the offset of all containing parents needs to be added-in.
        while (e) {
            x += e.offsetLeft;
            y += e.offsetTop;
            e = e.offsetParent;
        }
        // Add-in border width
        x += 2;
        y += 2;

        rect = new Object;
        rect.x = x;
        rect.y = y;
        rect.width = width;
        rect.height = height;
        //					Nimbus.logMessage("Div rect: " + "x=" + rect.x + ", y=" + rect.y + ", w=" + rect.width + ", h=" + rect.height + "\n");			
        return rect;
    }
    return null;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Show the video window
//////////////////////////////////////////////////////////////////////////////////////////
function ShowVideo() {
    var player = Nimbus.getPlayer();
    if (player != null) {
        player.setPictureFormat("Widescreen");
        var rect = new Object;
        rect.x = 0;
        rect.y = 0;
        rect.width = ScreenWidth;
        rect.height = ScreenHeight;

        var e = document.getElementById("video_win");

        if (bVideoInWindow) {
            rect = VideoRect[VideoRectIndex];
            e.style.left = rect.x + "px";
            e.style.top = rect.y + "px";
            e.style.width = rect.width + "px";
            e.style.height = rect.height + "px";




            var rectWin = GetDivRect("video_win");
            if (typeof rectWin != null) {
                rect = rectWin;
            }
        }


        // Set the video layer rect
        player.setVideoLayerRect(rect.x, rect.y, rect.width, rect.height);

        if (VideoBlendingMode == "colorkey") {
            // Set the background color to magenta
            e.style.backgroundColor = "#000000";
            // Use magenta for the chroma key
            player.setChromaKeyColor(0x00000000);
            player.setVideoLayerBlendingMode("colorkey");
            player.setVideoLayerTransparency(1);

        } else if (VideoBlendingMode == "uniform_alpha") {
            // Set the background color to black
            e.style.backgroundColor = "#000000";
            player.setVideoLayerBlendingMode("uniform_alpha");
            player.setVideoLayerTransparency(1);

        } else if (VideoBlendingMode == "page_alpha") {
            // Set the background color to nothing
            e.style.backgroundColor = "";
            player.setVideoLayerBlendingMode("page_alpha");
            player.setVideoLayerTransparency(1);

            // Make sure there isn't a background color on the body element
            var eBody = document.getElementById("body");
            eBody.style.backgroundColor = "";

        } else if (VideoBlendingMode == "colorkey_alpha") {
            // Set the background color to black
            e.style.backgroundColor = "#000000";
            // Use magenta for the chroma key
            player.setChromaKeyColor(0x00000000);
            player.setVideoLayerBlendingMode("colorkey_alpha");
            player.setVideoLayerTransparency(1);

            // Put some text over the video to check the blending
            etext = document.getElementById("text_over_video");
            var etext_rect = GetDivRect("text_over_video");

            etext.style.left = rect.x + "px";
            etext.style.width = (rect.width - 4) + "px";
            etext.style.top = (rect.y + rect.height - etext_rect.height - 4) + "px";
            etext.style.visibility = "visible";

            Nimbus.logMessage("pos= " + etext.style.left + ", " + etext.style.top);


        } else {
            Nimbus.logMessage("Bad video blending mode");
        }
        e.style.visibility = "visible";
        player.setVideoLayerEnable(true);

        if (bVideoInWindow) {
            // Show the player controls
            var rectCtl = GetDivRect("play_controls");
            e = document.getElementById("play_controls");
            e.style.left = (rect.x) + "px";
            e.style.top = (rect.y + rect.height + 10) + "px";
            e.style.visibility = "visible";

            // Show the audio controls
            rectCtl = GetDivRect("audio_controls");
            e = document.getElementById("audio_controls");
            e.style.left = (rect.x - rectCtl.width - 15) + "px";
            e.style.top = (rect.y + rect.height - rectCtl.height - 3) + "px";
            e.style.visibility = "visible";

            // Restore the buttons
            ShowControls(CurrentBtnFlags);
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Hide the video window
//////////////////////////////////////////////////////////////////////////////////////////
function HideVideo() {
    var player = Nimbus.getPlayer();
    if (player != null) {
        player.close();
    }
    // Hide the div
    var e = document.getElementById("video_win");
    var f = document.getElementById("fullscreen_back");
    if (e != null) {
        e.style.visibility = "hidden";
        player.setVideoLayerEnable(false);
    }
    if (f != null) {
        f.style.visibility = "hidden";
        player.setVideoLayerEnable(false);
    }

}

//////////////////////////////////////////////////////////////////////////////////////////
// Show video window using a color key
//////////////////////////////////////////////////////////////////////////////////////////
function ShowVideoColorKey() {
    if (VideoBlendingMode != "colorkey") {
        VideoBlendingMode = "colorkey";
    }
    ShowVideo();
}

//////////////////////////////////////////////////////////////////////////////////////////
// Show video window using a uniform alpha channel
//////////////////////////////////////////////////////////////////////////////////////////
function ShowVideoUniformAlpha() {
    if (VideoBlendingMode != "uniform_alpha") {
        VideoBlendingMode = "uniform_alpha";
    }
    ShowVideo();
}

//////////////////////////////////////////////////////////////////////////////////////////
// Show video window using the alpha channel of the page
//////////////////////////////////////////////////////////////////////////////////////////
function ShowVideoPageAlpha() {
    if (VideoBlendingMode != "page_alpha") {
        VideoBlendingMode = "page_alpha";
    }
    ShowVideo();
}

//////////////////////////////////////////////////////////////////////////////////////////
// Show video window using a color key with alpha
//////////////////////////////////////////////////////////////////////////////////////////
function ShowVideoColorKeyAlpha() {
    if (VideoBlendingMode != "colorkey_alpha") {
        VideoBlendingMode = "colorkey_alpha";
    }
    ShowVideo();
}

//////////////////////////////////////////////////////////////////////////////////////////
// Show video in a window
//////////////////////////////////////////////////////////////////////////////////////////
function ShowVideoInWindow() {
    // Defer screen and video window updates for crispness
    //Nimbus.setScreenUpdateEnable(false, false);
    //CntEnableUpdates = 1;

    bVideoInWindow = true;
    ShowVideo();

    // Re-enable auto spacial nav by the browser for arrow keys
    if (bUseSpacialNav) {
        Nimbus.setAutoSpacialNavigationEnable(true);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Show video in as fullscreen
//////////////////////////////////////////////////////////////////////////////////////////
function ShowVideoFullscreen() {
    bVideoInWindow = false;
    ShowVideoColorKey();
    //ShowVideoUniformAlpha();
    //				ShowVideoPageAlpha();

    // Disable auto spacial nav by the browser for arrow keys so that all keypresses
    // can be used to exit fullscreen mode
    if (bUseSpacialNav) {
        //Nimbus.setAutoSpacialNavigationEnable(true);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Toggle full screen video
//////////////////////////////////////////////////////////////////////////////////////////
function ToggleVideoFullscreen() {
    // Defer screen and video window updates for crispness
    //Nimbus.setScreenUpdateEnable(false, false);
    //CntEnableUpdates = 1;

    if (bVideoInWindow) {
        ShowVideoFullscreen();
    } else {
        ShowVideoInWindow();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Handler for volume-up button
//////////////////////////////////////////////////////////////////////////////////////////
function IncrementVolume() {
    var TVController = Nimbus.getTVController();
    if (TVController != null) {
        var CurrentVolume = TVController.getVolume();
        CurrentVolume += 3;
        if (CurrentVolume > 99) CurrentVolume = 99;
        TVController.setVolume(CurrentVolume);
    } else {
        Nimbus.logMessage("ERROR: No Valid TV Controller")
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Handler for volume down button
//////////////////////////////////////////////////////////////////////////////////////////
function DecrementVolume() {
    var TVController = Nimbus.getTVController();
    if (TVController != null) {
        var CurrentVolume = TVController.getVolume();
        CurrentVolume -= 3;
        if (CurrentVolume < 0) CurrentVolume = 0;
        TVController.setVolume(CurrentVolume);
    } else {
        Nimbus.logMessage("ERROR: No Valid TV Controller")
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Handler for mute button
//////////////////////////////////////////////////////////////////////////////////////////
function ToggleMute() {
    var TVController = Nimbus.getTVController();
    if (TVController != null) {
        var CurrentMute = TVController.getMute();
        CurrentMute = !CurrentMute;
        TVController.setMute(CurrentMute);
    } else {
        Nimbus.logMessage("ERROR: No Valid TV Controller")
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Handler for power button
//////////////////////////////////////////////////////////////////////////////////////////
function TogglePower() {
    var TVController = Nimbus.getTVController();
    if (TVController != null) {
        if (TVController.getPower()) {
            Close();
            Nimbus.logMessage("Setting power state to OFF");
            TVController.setPower(false);
        } else {
            Nimbus.logMessage("Setting power state to ON");
            TVController.setPower(true);
            Tune(DefChannel, false, true, BUTTONS_ALL);
        }
    }
}
//////////////////////////////////////////////////////////////////////////////////////////
// Set mouse pointer enable
//////////////////////////////////////////////////////////////////////////////////////////
function SetMousePointerEnable(state) {
    Nimbus.setMousePointerEnable(state);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Toggle mouse pointer visiblity
//////////////////////////////////////////////////////////////////////////////////////////
function ToggleMousePointerEnable() {
    var bEnabled = Nimbus.getMousePointerEnable();
    bEnabled = !bEnabled;
    Nimbus.logMessage("ToggleMousePointerEnable: pointer is now " + bEnabled);
    SetMousePointerEnable(bEnabled);
}













var HandleLastRTSPReq = 0;



//////////////////////////////////////////////////////////////////////////////////////////
// Enable a firmware update using a streaming channel (RF/IP)
//////////////////////////////////////////////////////////////////////////////////////////
function FirmwareUpdateStreamPush(UpdateChan) {
    Nimbus.logMessage("Enabling firmware update using streaming push method: " + UpdateChan);
    Nimbus.updateFirmwareStreamPush(UpdateChan);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Enable a configuration update (ie. STB settings + channel ring) using a streaming channel (RF/IP)
//////////////////////////////////////////////////////////////////////////////////////////
function ConfigurationUpdateStreamPush(UpdateChan) {
    Nimbus.logMessage("Enabling configuration update using streaming push method: " + UpdateChan);
    Nimbus.updateConfigurationStreamPush(UpdateChan);
}




//////////////////////////////////////////////////////////////////////////////////////////
// Clear the browser cookies
//////////////////////////////////////////////////////////////////////////////////////////
function ClearCookies() {
    Nimbus.clearCookies();
}










//////////////////////////////////////////////////////////////////////////////////////////
// Open a UDP unicast data channel (server)
//////////////////////////////////////////////////////////////////////////////////////////
DataChan.prototype.OpenUDPUnicastServer = function (port, rawMode) {
    Nimbus.logMessage("Open UDP unicast data channel (server), Port= " + port);
    this.Close();
    if (this.DCObj == null) {
        this.DCObj = Nimbus.getDataChannel();
        if (this.DCObj == null) {
            Nimbus.logMessage("Error creating UDP unicast data channel");
            return;
        }
        this.ID = this.DCObj.getID();
    }
    if (this.DCObj.openUDPUnicastServer(port, rawMode)) {
        this.bOpen = true;
        this.bUnicast = true;
        var panel = document.getElementById("stb_info");
        panel.innerHTML = "Opened UDP Unicast Data Chan: ID=[" + this.ID + "]";
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Close a data channel
//////////////////////////////////////////////////////////////////////////////////////////
DataChan.prototype.Close = function () {
    if (this.bOpen) {
        this.DCObj.close();
        this.bOpen = false;
        var panel = document.getElementById("stb_info");
        panel.innerHTML = "Closed Data Chan: ID=[" + this.ID + "]";
    }
}
//////////////////////////////////////////////////////////////////////////////////////////
// Get the current connection status.
//////////////////////////////////////////////////////////////////////////////////////////
DataChan.prototype.ResetConnection = function () {
    if (this.bOpen && this.bUnicast) {
        var panel = document.getElementById("stb_info");
        if (this.DCObj.resetConnection()) {
            panel.innerHTML = "Data Chan: ID=[" + this.ID + "], Connection closed.";
        } else {
            Nimbus.logMessage("Error resetting connection.");
        }
    }

}
//////////////////////////////////////////////////////////////////////////////////////////
// Get the current connection status.
//////////////////////////////////////////////////////////////////////////////////////////
DataChan.prototype.GetConnectionStatus = function () {
    if (this.bOpen && this.bUnicast) {
        var status = this.DCObj.getConnectionStatus();
        if (status == null) {
            return;
        }
        var panel = document.getElementById("stb_info");
        if (status.connected) {
            panel.innerHTML = "Data Chan: ID=[" + this.ID + "], Connected to=[" + status.clientAddress + "]";
        } else {
            panel.innerHTML = "Data Chan: ID=[" + this.ID + "], Not connected.";
        }
    }
}
//////////////////////////////////////////////////////////////////////////////////////////
// Open a unicast data channel (server)
//////////////////////////////////////////////////////////////////////////////////////////
DataChan.prototype.SendMessage = function (message) {
    if (this.bOpen && this.bUnicast) {
        var panel = document.getElementById("stb_info");
        if (this.DCObj.sendMessage(message)) {
            panel.innerHTML = "Sent message [" + message + "] on Unicast Data Chan: ID=[" + this.ID + "]";
        } else {
            Nimbus.logMessage("Error sending message.");
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Open a unicast data channel (server)
//////////////////////////////////////////////////////////////////////////////////////////
DataChan.prototype.SendUDPMessageToLastClient = function (message) {
    if (this.bOpen && this.bUnicast) {
        var panel = document.getElementById("stb_info");
        if (Nimbus.sendDirectUDPMessageTo(this.lastClientAddress,
					                                   this.lastClientPort,
													   message)) {
            panel.innerHTML = "Sent [" + message + "] to [" + this.lastClientAddres + ":" + this.lastClientPort + "]";
        } else {
            Nimbus.logMessage("Error sending message.");
        }
    }
}


//////////////////////////////////////////////////////////////////////////////////////////
// Flush data channel queue
//////////////////////////////////////////////////////////////////////////////////////////
DataChan.prototype.Flush = function () {
    var result = this.DCObj.flush();
    var panel = document.getElementById("stb_info");
    panel.innerHTML = "Data Chan: Flushed, " + (result ? "ok" : "failed");
}

//////////////////////////////////////////////////////////////////////////////////////////
// Reset data channel filter
//////////////////////////////////////////////////////////////////////////////////////////
DataChan.prototype.ResetFilter = function () {
    var result = this.DCObj.resetFilter();
    var panel = document.getElementById("stb_info");
    panel.innerHTML = "Data Chan: ResetFilter, " + (result ? "ok" : "failed");
}

//////////////////////////////////////////////////////////////////////////////////////////
// Set data channel filter duration
//////////////////////////////////////////////////////////////////////////////////////////
DataChan.prototype.SetFilterDuration = function (duration) {
    var result = this.DCObj.setFilterDuration(duration);
    var panel = document.getElementById("stb_info");
    panel.innerHTML = "Data Chan: Set Filter Duration to [" + duration + "], " + (result ? "ok" : "failed");
}

//////////////////////////////////////////////////////////////////////////////////////////
// Get data channel filter duration
//////////////////////////////////////////////////////////////////////////////////////////
DataChan.prototype.GetFilterDuration = function () {
    var result = this.DCObj.getFilterDuration();
    var panel = document.getElementById("stb_info");
    panel.innerHTML = "Data Chan: Get Filter Duration = [" + result + "]";
}


//////////////////////////////////////////////////////////////////////////////////////////
// Handler for volume-up button
//////////////////////////////////////////////////////////////////////////////////////////
function IncrementVolume() {
    var TVController = Nimbus.getTVController();
    if (TVController != null) {
        var CurrentVolume = TVController.getVolume();
        CurrentVolume += 1;
        if (CurrentVolume > 99) CurrentVolume = 99;
        TVController.setVolume(CurrentVolume);
        TVController.setVolumeIndicatorEnable(true);
    } else {
        Nimbus.logMessage("ERROR: No Valid TV Controller")
    }

}

//////////////////////////////////////////////////////////////////////////////////////////
// Handler for volume down button
//////////////////////////////////////////////////////////////////////////////////////////
function DecrementVolume() {
    var TVController = Nimbus.getTVController();
    if (TVController != null) {
        var CurrentVolume = TVController.getVolume();
        CurrentVolume -= 1;
        if (CurrentVolume < 0) CurrentVolume = 0;
        TVController.setVolume(CurrentVolume);
        TVController.setVolumeIndicatorEnable(true);
    } else {
        Nimbus.logMessage("ERROR: No Valid TV Controller")
    }
}


//////////////////////////////////////////////////////////////////////////////////////////
// Handler for mute button
//////////////////////////////////////////////////////////////////////////////////////////
function ToggleMute() {
    var TVController = Nimbus.getTVController();
    if (TVController != null) {
        var CurrentMute = TVController.getMute();
        CurrentMute = !CurrentMute;
        TVController.setMute(CurrentMute);
        TVController.setVolumeIndicatorEnable(true);
    } else {
        Nimbus.logMessage("ERROR: No Valid TV Controller")
    }
}