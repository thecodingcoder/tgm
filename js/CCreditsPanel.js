function CCreditsPanel(){
    
    var _oFade;
    var _oPanelContainer;
    var _oButExit;
    var _oLogo;
    var _oHitArea;
    var _oListener;
    
    var _pStartPanelPos;
    
    this._init = function(){
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0;
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0.7},500);
        
        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("#0f0f0f").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oHitArea.alpha = 0.01;
        _oListener = _oHitArea.on("click", this._onLogoButRelease);
        s_oStage.addChild(_oHitArea);
        
        _oPanelContainer = new createjs.Container();        
        s_oStage.addChild(_oPanelContainer);

        var oSprite = s_oSpriteLibrary.getSprite('msg_box');
        var oPanel = createBitmap(oSprite);        
        oPanel.regX = oSprite.width/2;
        oPanel.regY = oSprite.height/2;
        _oPanelContainer.addChild(oPanel);
        
        _oPanelContainer.x = CANVAS_WIDTH/2;
        _oPanelContainer.y = CANVAS_HEIGHT + oSprite.height/2;  
        _pStartPanelPos = {x: _oPanelContainer.x, y: _oPanelContainer.y};
        createjs.Tween.get(_oPanelContainer).to({y:CANVAS_HEIGHT/2},500, createjs.Ease.quartIn);

        var iWidth = 400;
        var iHeight = 60;
        var iTextX = 0;
        var iTextY = -90;
        var oTitle = new CTLText(_oPanelContainer, 
                    iTextX-iWidth/2, iTextY-iHeight/2, iWidth, iHeight, 
                    40, "center", PRIMARY_FONT_COLOUR, PRIMARY_FONT, 1.3,
                    2, 2,
                    TEXT_DEVELOPED,
                    true, true, true,
                    false );


        var iWidth = 400;
        var iHeight = 60;
        var iTextX = 0;
        var iTextY = 70;
        var oLink = new CTLText(_oPanelContainer, 
                    iTextX-iWidth/2, iTextY-iHeight/2, iWidth, iHeight, 
                    40, "center", PRIMARY_FONT_COLOUR, PRIMARY_FONT, 1.3,
                    2, 2,
                    "www.codethislab.com",
                    true, true, true,
                    false );

        
        var oSprite = s_oSpriteLibrary.getSprite('ctl_logo');
        _oLogo = createBitmap(oSprite);
        _oLogo.regX = oSprite.width/2;
        _oLogo.regY = oSprite.height/2;
        _oPanelContainer.addChild(_oLogo);
      
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _oButExit = new CGfxButton(270, -138, oSprite, _oPanelContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this.unload, this);
        
    };
    
    this.unload = function(){
        _oHitArea.off("click", _oListener);
        
        _oButExit.setClickable(false);
        
        createjs.Tween.get(_oFade).to({alpha:0},500);
        createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},400, createjs.Ease.backIn).call(function(){
            s_oStage.removeChild(_oFade);
            s_oStage.removeChild(_oPanelContainer);

            _oButExit.unload();
        });         
        
    };
    
    this._onLogoButRelease = function(){
        window.open("http://www.codethislab.com/index.php?&l=en");
    };
    
    this._onMoreGamesReleased = function(){
        window.open("http://codecanyon.net/collections/5409142-games");
    };
    
    this._init();
    
    
};


