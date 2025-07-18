function CEndPanel(oSpriteBg){
    
    var _oBestScoreContainer;
    var _oBestScoreText;
    var _oScoreContainer;
    var _oScoreText;
    var _oPanelContainer;
    var _oFade;
    var _oButHome;
    var _oButRestart;
    var _oListener;
    
    var _pStartPanelPos;
    
    this._init = function(oSpriteBg){
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0;
        _oListener = _oFade.on("mousedown",function(){});
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0.7},500);
        
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
        
        
        //////////////////// BEST SCORE
        _oBestScoreContainer = new createjs.Container();
        _oBestScoreContainer.y = -120;
        _oPanelContainer.addChild(_oBestScoreContainer)
       
        var oSprite = s_oSpriteLibrary.getSprite('bestscore');
        var oCup = createBitmap(oSprite);
        oCup.regY = oSprite.height/2;
        _oBestScoreContainer.addChild(oCup);

        
        _oBestScoreText = new createjs.Text("0"," 38px "+PRIMARY_FONT, PRIMARY_FONT_COLOUR);
        _oBestScoreText.x = oCup.x + oSprite.width + 4;
        _oBestScoreText.y = oCup.y;
        _oBestScoreText.textAlign = "left";
        _oBestScoreText.textBaseline = "middle";
        _oBestScoreText.lineWidth = 200;
        _oBestScoreContainer.addChild(_oBestScoreText);
        
       
        //////////////////// SESSION SCORE
        _oScoreContainer = new createjs.Container();
        _oScoreContainer.y = -50;
        _oPanelContainer.addChild(_oScoreContainer)
       
        var oSprite = s_oSpriteLibrary.getSprite('star');
        var oStar = createBitmap(oSprite);
        oStar.regY = oSprite.height/2;
        _oScoreContainer.addChild(oStar);

        
        _oScoreText = new createjs.Text("0"," 28px "+PRIMARY_FONT, PRIMARY_FONT_COLOUR);
        _oScoreText.x = oStar.x + oSprite.width + 4;
        _oScoreText.y = oStar.y;
        _oScoreText.textAlign = "left";
        _oScoreText.textBaseline = "middle";
        _oScoreText.lineWidth = 200;
        _oScoreContainer.addChild(_oScoreText);
        

        _oButRestart = new CGfxButton(110, 80, s_oSpriteLibrary.getSprite('but_restart'), _oPanelContainer);
        _oButRestart.addEventListener(ON_MOUSE_UP, this._onRestart, this);
        _oButRestart.pulseAnimation();

        _oButHome = new CGfxButton(-110, 80, s_oSpriteLibrary.getSprite('but_home'), _oPanelContainer);
        _oButHome.addEventListener(ON_MOUSE_UP, this._onExit, this);
        

    };
    
    this.unload = function(){
        _oFade.off("mousedown",_oListener);
        
        s_oStage.removeChild(_oPanelContainer);
        s_oStage.removeChild(_oFade);
    };

    
    this.show = function(iScore){
	playSound('game_over',1,false);
        
        if(iScore > s_iTotalScore){
            s_iTotalScore = iScore;
            s_oLocalStorage.saveData();
        }
        
        _oBestScoreText.text = s_iTotalScore.toLocaleString();
        _oBestScoreContainer.regX = _oBestScoreContainer.getBounds().width/2;
        
        _oScoreText.text = iScore.toLocaleString();
        _oScoreContainer.regX = _oScoreContainer.getBounds().width/2;

        
        var oParent = this;
        createjs.Tween.get(_oPanelContainer).to({y:CANVAS_HEIGHT/2},500, createjs.Ease.quartIn);
        
        $(s_oMain).trigger("save_score",iScore, "DON'T FORGET TO SET THE MODE");        
        $(s_oMain).trigger("end_level",1);
        
        var szImg = "200x200.jpg";
        var szTitle = "Congratulations!";
        var szMsg = "You collected <strong>" + iScore + " points</strong>!<br><br>Share your score with your friends!";
        var szMsgShare = "My score is " + iScore + " points! Can you do better?";        
        $(s_oMain).trigger("share_event",iScore, szImg, szTitle, szMsg, szMsgShare);
    };

    window.replayResponse = function (json) {
  const data = JSON.parse(json);

  if (data?.d?.success) { 
     s_oGame.restartGame();

    createjs.Tween.get(_oFade).to({ alpha: 0 }, 500);

    createjs.Tween.get(_oPanelContainer).to({ y: _pStartPanelPos.y }, 400, createjs.Ease.backIn).call(() => {
        s_oStage.removeChild(_oFade);
        s_oStage.removeChild(_oPanelContainer);

        // Optional unload check (in case _oPanelContainer is a class with cleanup)
        if (typeof _oPanelContainer.unload === 'function') {
            _oPanelContainer.unload(); 
        }

        // Start session + navigate to game
        $(s_oMain).trigger("start_session");
        s_oMain.gotoGame();
    });
  }
};
    
    this._onRestart = function(){
        _oButRestart.setClickable(false);
        _oButHome.setClickable(false);
        
         import(window.pfSDK).then(() => {
        const eventName = "pay_to_play";
        const callback = "replayResponse";
       // console.log(`Restart: paytoplay request.`);

        const payload = {
            gameVersion: window.gameVersion,
            slug: window.gameSlug,
            token: window.gameToken,
        };

        window.runGacha(eventName, payload, callback);
        }).catch(err => {
        // console.error("Failed to import pfSDK script:", err);
         _oButRestart.setClickable(true);
        _oButHome.setClickable(true);
        });

         
        
         
        

        
    };
    
    this._onExit = function(){
        
        $(s_oMain).trigger("show_interlevel_ad");
        
        s_oGame.onExit();
    };
    
    this._init(oSpriteBg);
    
    return this;
}
