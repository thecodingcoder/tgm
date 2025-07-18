function CInterface(){
    var _oAudioToggle;
    var _oButExit;
    var _oButFullscreen;

    var _aBallRemaining;

    var _oScoreContainer;
    var _oScoreNum;
    var _oBallRemainingPos;
    var _oExtraBall;
    var _oGUIExpandible;
    
    
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    var _pScoreStartPos;
    
    this._init = function(){                
        var oExitX;        
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.width/2)- 10, y: (oSprite.height/2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite,s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);
        
        oExitX = _pStartPosExit.x - (oSprite.width) - 10;
        _pStartPosAudio = {x: oExitX, y: (oSprite.height/2) + 10};
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);   
            
            oExitX = _pStartPosAudio.x - (oSprite.width/2) - 10;
        }

        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen");
            _pStartPosFullscreen = {x:oExitX - 10,y:oSprite.height/2+10};
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP,this._onFullscreenRelease,this);
        }

        var oSprite = s_oSpriteLibrary.getSprite('but_settings');
        _oGUIExpandible = new CGUIExpandible(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oGUIExpandible.addButton(_oButExit);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oGUIExpandible.addButton(_oAudioToggle);
        }
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oGUIExpandible.addButton(_oButFullscreen);
        }
        
        var oSprite = s_oSpriteLibrary.getSprite('score_panel');
        _pScoreStartPos = {x: oSprite.width/2 + 10, y: oSprite.height*2/2+10};
        _oScoreContainer = new createjs.Container();
        _oScoreContainer.x = _pScoreStartPos.x;
        _oScoreContainer.y = _pScoreStartPos.y;
        s_oStage.addChild(_oScoreContainer);  
        
        var oPanel = createBitmap(oSprite);
        oPanel.regX = oSprite.width/2;
        oPanel.regY = oSprite.height/2;
        _oScoreContainer.addChild(oPanel);
        
        var oSprite = s_oSpriteLibrary.getSprite('star');
        var oStar = createBitmap(oSprite);
        oStar.x = -90;
        oStar.y = -16;
        oStar.regX = oSprite.width/2;
        oStar.regY = oSprite.height/2;
        oStar.scaleX = oStar.scaleY = 0.7;
        _oScoreContainer.addChild(oStar);
        
        _oScoreNum = new createjs.Text(0," 28px "+PRIMARY_FONT, PRIMARY_FONT_COLOUR);
        _oScoreNum.x = oStar.x + 28;
        _oScoreNum.y = oStar.y;
        _oScoreNum.textAlign = "left";
        _oScoreNum.textBaseline = "middle";
        _oScoreNum.lineWidth = 200;
        _oScoreContainer.addChild(_oScoreNum);
        
        var oSprite = s_oSpriteLibrary.getSprite('ball');
        _oBallRemainingPos = {startX: oStar.x, startY: oStar.y + 38, offsetX: oSprite.width/2 + 4}
        
        _aBallRemaining = new Array();
        for(var i=0; i<NUM_BALL-1; i++){
            var oBallSprite = createBitmap(oSprite);
            oBallSprite.x = _oBallRemainingPos.startX + _oBallRemainingPos.offsetX*i;
            oBallSprite.y = _oBallRemainingPos.startY;
            oBallSprite.regX = oSprite.width/2;
            oBallSprite.regY = oSprite.height/2;
            oBallSprite.scaleX = oBallSprite.scaleY = 0.5;
            _oScoreContainer.addChild(oBallSprite);
            _aBallRemaining.push(oBallSprite);
        }

        var oSprite = s_oSpriteLibrary.getSprite('extra_ball');
        _oExtraBall = createBitmap(oSprite);
        _oExtraBall.regX = oSprite.width/2;
        _oExtraBall.regY = oSprite.height/2;
        _oExtraBall.alpha = 0;
        _oScoreContainer.addChild(_oExtraBall);
        
        
       this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.unload = function(){
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }

        if (_fRequestFullScreen && screenfull.isEnabled) {
            _oButFullscreen.unload();
        }        
        
        _oGUIExpandible.unload();
        
        s_oInterface = null;
        
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oGUIExpandible.refreshPos(iNewX,iNewY);
        
        _oScoreContainer.x = _pScoreStartPos.x + iNewX;
        _oScoreContainer.y = _pScoreStartPos.y + iNewY;
    };

    this.refreshScore = function(iValue){
        _oScoreNum.text = iValue.toLocaleString();
    };

    this.refreshBallRemaining = function(iNumBall){
        _aBallRemaining[iNumBall].visible = false;
    };

    this.resetBallRemaining = function(){
        for(var i=0; i<_aBallRemaining.length; i++){
            _aBallRemaining[i].visible = true;
        }
    };

    this.activeExtraBallAnim = function(iNumBall){
        _oExtraBall.x = _oBallRemainingPos.startX +iNumBall*_oBallRemainingPos.offsetX;
        _oExtraBall.y = _oBallRemainingPos.startY;
        
        _oExtraBall.alpha = 1;
        
        createjs.Tween.get(_oExtraBall, {loop:true}).to({alpha:0}, 500).to({alpha:1}, 500).wait(1000);
    };

    this.disableExtraBallAnim = function(){
        createjs.Tween.removeTweens(_oExtraBall);
        _oExtraBall.alpha = 0;
    };

    this._onButHelpRelease = function(){
        _oHelpPanel = new CHelpPanel();
    };
    
    this._onButRestartRelease = function(){
        s_oGame.restartGame();
        $(s_oMain).trigger("restart_level", 1);
    };
    
    this.onExitFromHelp = function(){
        _oHelpPanel.unload();
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onExit = function(){
        new CAreYouSurePanel(s_oGame.onExit);
    };
    
    this.resetFullscreenBut = function(){
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setActive(s_bFullscreen);
        }
    };
        
    this._onFullscreenRelease = function(){
	if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };
    
    s_oInterface = this;
    
    this._init();
    
    return this;
}

var s_oInterface = null;