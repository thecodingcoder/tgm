 
    
    function CGame(oData){
    var _bStartGame;
    var _bLeft;
    var _bRight;
    var _bPressDown;
    var _bExtraBall;
    var _bBallInGame;
    
    var _iBallRemaining;
    
    var _oInterface;
    var _oEndPanel = null;
    var _oParent;
    var _oHelpPanel;
    
    var _oTable;
    var _oBall;
    var _oBallSprite;
    var _oHandAnim;
    var _oTouchArea;
    
    var _oLeftFlipper;
    var _oRightFlipper;
    var _oRightFlipperSprite;
    var _oLeftFlipperSprite;
    
    var _oSpriteContainer;
    var _oBackGroundContainer;
    var _oForeGroundContainer;
    var _oPausePanel;
    var _oCameraPos;
    var _oLerpRatio;

    
    this._init = function(){

         
        

        

        
        _bStartGame=false;
        _bLeft = false;
        _bRight = false;
        _bPressDown = false;
        _bExtraBall = false;
        _bBallInGame = false;

        _iBallRemaining = NUM_BALL;
        
        _oLerpRatio = {x: LERP_SLOW.x, y: LERP_SLOW.y};

        new CPhysicsController();
        new CObjectBuilder();
        new CSCoreController();
        
        _oBall = s_oObjectBuilder.addBall(BALL_RADIUS, BALL_STARTPOS.x, BALL_STARTPOS.y, 0.1,0.7,0);

        _oSpriteContainer = new createjs.Container();
        _oSpriteContainer.scaleX = _oSpriteContainer.scaleY = ZOOM;
        s_oStage.addChild(_oSpriteContainer);

        _oBackGroundContainer = new createjs.Container();
        _oSpriteContainer.addChild(_oBackGroundContainer);

        _oForeGroundContainer = new createjs.Container();
        _oSpriteContainer.addChild(_oForeGroundContainer);

        _oTouchArea = new createjs.Shape();
        _oTouchArea.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        s_oStage.addChild(_oTouchArea);

        _oTable = new CTable(_oBackGroundContainer, _oForeGroundContainer);

        _oCameraPos = {x: BALL_STARTPOS.x*ZOOM + CANVAS_WIDTH/2, y:BALL_STARTPOS.y*ZOOM + CANVAS_HEIGHT/2};

        /////////////////DEBUG FUNCTIONS
        //_oBackGroundContainer.on("mousedown", this.moveBall);
        //_oBackGroundContainer.on("pressmove", this.moveBall);
        //_oBackGroundContainer.on("pressup", this.releaseBall);
        ////////////////////////////////

        var oSprite = s_oSpriteLibrary.getSprite('ball');
        _oBallSprite = createBitmap(oSprite);
        _oBallSprite.regX = oSprite.width/2;
        _oBallSprite.regY = oSprite.height/2;
        _oBackGroundContainer.addChild(_oBallSprite);

        _oPausePanel = new CPausePanel(s_oStage);
        
        _oInterface = new CInterface();
        _oInterface.refreshScore(0);
        
        s_oScoreController.addEventListener(ON_INCREASE_JACKPOT, s_oTable.onJackpotIncreased);
        s_oScoreController.addEventListener(ON_INCREASE_SCORE, _oInterface.refreshScore);
        
        var oSprite = s_oSpriteLibrary.getSprite('flipper');
        _oRightFlipperSprite = createBitmap(oSprite);
        _oRightFlipperSprite.x = 726;
        _oRightFlipperSprite.y = 1706;
        _oRightFlipperSprite.regX = oSprite.width-14;
        _oRightFlipperSprite.regY = 28;
        _oBackGroundContainer.addChild(_oRightFlipperSprite);
        
        var oSprite = s_oSpriteLibrary.getSprite('flipper');
        _oLeftFlipperSprite = createBitmap(oSprite);
        _oLeftFlipperSprite.x = 326;
        _oLeftFlipperSprite.y = 1706;
        _oLeftFlipperSprite.regX = oSprite.width-14;
        _oLeftFlipperSprite.regY = 28;
        _oLeftFlipperSprite.scaleX = -1;
        _oBackGroundContainer.addChild(_oLeftFlipperSprite);

        _oTable.activeShield();
        
        
        if(s_bMobile){
            var oSprite = s_oSpriteLibrary.getSprite('hand_anim');
            var iWidth = oSprite.width/5;
            var iHeight = oSprite.height/2;
            var oData = {   
                            images: [oSprite], 
                            // width, height & registration point of each sprite
                            frames: {width: iWidth, height: iHeight, regX: iWidth/2, regY: iHeight/2}, 
                            animations: {start:[5, 9, "stop"], stop: [9,9,"back", 0.02], back: [0,4, "start"] }
                       };
            
            var oSpriteSheet = new createjs.SpriteSheet(oData);
            _oHandAnim = createSprite(oSpriteSheet, "start",iWidth/2,iHeight/2,iWidth,iHeight);
            _oHandAnim.x = CANVAS_WIDTH_HALF;
            _oHandAnim.y = CANVAS_HEIGHT_HALF- 200;
            _oHandAnim.visible = false;
            s_oStage.addChild(_oHandAnim);
        }           
        
        
        _oHelpPanel = new CHelpPanel();
        
        this.updateCamera();
    };
    
    function onKeyDown(evt) { 
        if(!evt){ 
            evt = window.event; 
        } 
        evt.preventDefault();
        
        switch(evt.keyCode) {
            ///////LEFT FLIPPER
            case 37:{
                    _bLeft = true;
                    if(!_bPressDown){
                        ////PREVENT MULTIPLE SHIFT
                        _bPressDown = true;
                        _oTable.shiftElementsToLeft();
                        playSound("flipper", 1, false);
                    }
                    break;
            }
            ///////RIGHT FLIPPER
            case 39:{
                    _bRight = true;
                    if(!_bPressDown){
                        ////PREVENT MULTIPLE SHIFT
                        _bPressDown = true;
                        _oTable.shiftElementsToRight();
                        playSound("flipper", 1, false);
                    }

                    break;
            }
            ///////DOWN-LAUNCH
            case 40:{
                    if(!_bPressDown){
                        _bPressDown = true;
                        s_oTable.loadSpring();
                    }
                    break;
            }
        }  
        
    }
    
    function onKeyUp(evt) { 
        if(!evt){ 
            evt = window.event; 
        } 
        evt.preventDefault();
        _bPressDown = false;
        
        switch(evt.keyCode) {
            ///////LEFT FLIPPER
            case 37:{
                    _bLeft = false;
                    
                    break;
            }
            ///////RIGHT FLIPPER
            case 39:{
                    _bRight = false;
                    
                    break;
            }
            ///////DOWN-LAUNCH
            case 40:{
                    s_oTable.releaseSpring();
                    break;
            }
        }  
    }
    
    ////////////DEBUG FUNCTION
    this.moveBall = function(evt){
        var oPos = {x: evt.localX /WORLD_SCALE, y: evt.localY / WORLD_SCALE};
        
        _oBall.SetLinearVelocity({x:0,y:0});
        _oBall.SetAngularVelocity(0);
        _oBall.SetPosition(oPos);
        
        _oBall.SetActive(false);
    };
 
    this.releaseBall = function(){
        _oBall.SetActive(true);
    };
    /////////////////////////////
    
    this._onPressDown = function(evt){
        if(!_bStartGame){
            return;
        }
        
        if(evt.localX > CANVAS_WIDTH_HALF){
            if(_bBallInGame){
                _bRight = true;
                _oTable.shiftElementsToRight();
            }
        } else {
            if(_bBallInGame){
                _bLeft = true;
                _oTable.shiftElementsToLeft();
            }
        }
        playSound("flipper", 1, false);
        
        if(evt.localY > SETTINGS_HEIGHT){
            s_oTable.loadSpring();
        }
    };
    
    this._onPressUp = function(evt){
        if(!_bStartGame){
            return;
        }
        
        _oHandAnim.visible = false;
        
        if( (_bRight === false && _bLeft === true) || (_bRight === true && _bLeft === false)){
            _bRight = false;
            _bLeft = false;
        }
        
        if(evt.localX > CANVAS_WIDTH_HALF){
            _bRight = false;
        } else {
            _bLeft = false;
        }
        s_oTable.releaseSpring();
    };
    
    this.resetBallPos = function(){
        var oPos = {x: BALL_STARTPOS.x/WORLD_SCALE, y: BALL_STARTPOS.y/WORLD_SCALE};
        
        setTimeout(function(){
            _oBall.SetLinearVelocity({x:0,y:0});
            _oBall.SetAngularVelocity(0);
            _oBall.SetPosition(oPos);
        }, 500);

    };
    
    this.ballInGame = function(bVal){
        _bBallInGame = bVal;
    };
    
    this.restartGame = function () {
        $(s_oMain).trigger("show_interlevel_ad");
        
        s_oScoreController.resetScore();
        s_oTable.reset();
        s_oTable.unblockLaunch();
        s_oTable.activeShield();
        _bStartGame = true;
        
        _iBallRemaining = NUM_BALL;
        _oInterface.resetBallRemaining();

    };        
    
    this.unload = function(){
        _bStartGame = false;
        
        _oInterface.unload();
        if(_oEndPanel !== null){
            _oEndPanel.unload();
        }
        
        if(!s_bMobile) {
            //REMOVE KEY LISTENER
            document.onkeydown   = null; 
            document.onkeyup   = null; 
        } else {
            _oTouchArea.removeAllEventListeners();
        }
        
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren();
        
        s_oPhysicsController.unload();
    };
 
    this.setFlippers = function(oRight, oLeft){
        _oRightFlipper = oRight;
        _oLeftFlipper = oLeft;
    };
 
    this.setNewLaunch = function(){
        s_oGame.resetBallPos();
        _oTable.activeShield();
        
        if(_iBallRemaining===0){
            _bStartGame = false;
            
            s_oTable.blockLaunch();
            s_oGame.gameOver();
        }
    };
 
    this.setExtraBall = function(){
        _bExtraBall = true;
        _oInterface.activeExtraBallAnim(_iBallRemaining-1);
    };
 
    this.isExtraBall = function(){
        return _bExtraBall;
    };
 
    this.launchBall = function(iStrength){
        _oBall.SetActive(true);

        var iX = -0.001 + Math.random()*0.002;

        var vImpulse = {x: iX, y: -iStrength};
        _oBall.ApplyImpulse(vImpulse, _oBall.GetPosition());
        
        _oLerpRatio = LERP_FOLLOW_BALL;
    };
 
    this.onBallLaunched = function(){
        if(_bExtraBall){
            _oInterface.disableExtraBallAnim();
            _bExtraBall = false;
        }else {
            _iBallRemaining--;
        }
    };
 
    this.onBallOut = function(){
        if(_bExtraBall){
            _oInterface.disableExtraBallAnim();
            _bExtraBall = false;
            s_oTable.resetOnExtraBall();
        }else {
            _iBallRemaining--;
            if(_iBallRemaining>0){
                _oInterface.refreshBallRemaining(_iBallRemaining-1);
            }
            s_oTable.reset();
        }
        s_oGame.ballInGame(false);
        _oLerpRatio = LERP_SLOW;
        s_oTable.unblockLaunch();
        s_oGame.setNewLaunch();
        playSound("ball_out",1,false);
    };

    this.getBall = function(){
        return _oBall;
    };
    
    this.getBallSprite = function(){
        return _oBallSprite;
    };

    this.onExit = function(){
        $(s_oMain).trigger("end_session");
        
        s_oGame.unload();
        s_oMain.gotoMenu();

    };
    
    this._onExitHelp = function () {
         _bStartGame = true;
         
         if(s_bMobile){
             _oHandAnim.visible = true;
         }
         
         
         playSound('start_game', 1, false);
         $(s_oMain).trigger("start_level",1);
         
         if(!s_bMobile) {
            //KEY LISTENER
            document.onkeydown   = onKeyDown; 
            document.onkeyup   = onKeyUp; 
        } else {
            
            
            
            _oTouchArea.on("mousedown", this._onPressDown);
            _oTouchArea.on("pressup", this._onPressUp);
            
            //s_oStage.on("mousedown", this._onPressDown);
            //s_oStage.on("pressup", this._onPressUp);
        }
    };
    function z_ch2() {
        const hash_diff = 64;
        const hash_z_s = 8;
    
        // Use window.gameToken instead of a parameter
        if (typeof window.gameToken !== "string" || window.gameToken.length < hash_diff) {
            //console.warn("Invalid or too short gameToken:", window.gameToken);
            return 0;
        }
    
        let z_h = 0;
    
        for (let i = 0; i < hash_diff; i++) {
            const charCode = window.gameToken.charCodeAt(i);
            z_h = (z_h << hash_z_s) - z_h + charCode;
            z_h |= 0;
        }
    
        return z_h;
    }
    window.reportScoreResponse = function (json) {
  const data = JSON.parse(json);

  if (data?.d?.success) { 
     window.gameToken = data.d.token;
  }
};

    this.gameOver = function(){  
        _oEndPanel = CEndPanel(s_oSpriteLibrary.getSprite('msg_box'));
        _oEndPanel.show(s_oScoreController.getScore());

        import(window.pfSDK).then(() => {
        const eventName = "report_score";
        const callback = "reportScoreResponse";

        const payload = {
            score: s_oScoreController.getScore(),
            gameVersion: window.gameVersion,
            slug: window.gameSlug,
            token: window.gameToken
        };

        window.runGacha(eventName, payload, callback);
        }).catch(err => {
        //console.error("Failed to import pfSDK script:", err);
        });
            

    
    };

    this.onPause = function(){
        _bStartGame = false;
        _oPausePanel.show();
    };

    this.onResume = function(){
        _bStartGame = true;
        _oPausePanel.hide();
    };

    this.updateCamera = function(){
        
        var oCenterPos = {};
        oCenterPos.x = -_oBall.GetPosition().x*ZOOM_PER_WORLDSCALE + CANVAS_WIDTH_HALF;
        oCenterPos.y = -_oBall.GetPosition().y*ZOOM_PER_WORLDSCALE + CANVAS_HEIGHT_HALF;

        var oNewPosX = (oCenterPos.x - _oCameraPos.x)*_oLerpRatio.x;
        var oNewPosY = (oCenterPos.y - _oCameraPos.y)*_oLerpRatio.y;

        _oCameraPos.x += oNewPosX;
        _oCameraPos.y += oNewPosY;

        //////////////X BLOCK
        var iXLimit = -(ZOOM_TABLE_SIZE.w - CANVAS_WIDTH + s_iOffsetX);
        if(_oCameraPos.x < iXLimit){
            _oCameraPos.x = iXLimit;
        }
        if(_oCameraPos.x > s_iOffsetX){
            _oCameraPos.x = s_iOffsetX;
        }
        
        //////////////Y BLOCK
        var iYLimit = -(ZOOM_TABLE_SIZE.h - CANVAS_HEIGHT + s_iOffsetY);
        if(_oCameraPos.y < iYLimit){
            _oCameraPos.y = iYLimit;
        }
        if(_oCameraPos.y > s_iOffsetY){
            _oCameraPos.y = s_iOffsetY;
        }     
        
        _oSpriteContainer.x = _oCameraPos.x;
        _oSpriteContainer.y = _oCameraPos.y;

    };
    
    this.update = function(){
        if(!_bStartGame){
            return;
        }
        
        if (_bLeft){
            _oLeftFlipper.SetMotorSpeed(FLIPPER_STRENGTH);
        }
        else{
            _oLeftFlipper.SetMotorSpeed(-FLIPPER_STRENGTH);
        }

        if (_bRight){
            _oRightFlipper.SetMotorSpeed(-FLIPPER_STRENGTH);
        }
        else{
            _oRightFlipper.SetMotorSpeed(FLIPPER_STRENGTH);
        }
        
        this.updateCamera();
        s_oPhysicsController.update(_oCameraPos);
        s_oTable.update();
        
        _oBallSprite.x = _oBall.GetPosition().x*WORLD_SCALE;
        _oBallSprite.y = _oBall.GetPosition().y*WORLD_SCALE;

        _oRightFlipperSprite.rotation = _oRightFlipper.GetBodyA().GetAngle()*TODEGREE_PROPORTION;
        _oLeftFlipperSprite.rotation = _oLeftFlipper.GetBodyA().GetAngle()*TODEGREE_PROPORTION;
        
        ///SAFETY CHECK IN CASE BALL NOT COLLIDE WITH EXIT TRIGGER
        if(_oBall.GetPosition().y > BALL_OUT_SAFE_LIMIT){
            _oBall.SetPosition({x:_oBall.GetPosition().x, y:_oBall.GetPosition().y-BALL_OUT_SAFE_LIMIT/2})
            s_oGame.onBallOut();
        }
        
    };

    s_oGame=this;
    
    _oParent=this;
    this._init();
}

var s_oGame;
