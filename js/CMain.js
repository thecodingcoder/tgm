

function CMain(oData){
    
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;
    
    var _oPreloader;
    var _oMenu;
    var _oHelp;
    var _oGame;

    this.initContainer = function(){
        s_oCanvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(s_oCanvas);
        s_oStage.preventSelection = false;
        createjs.Touch.enable(s_oStage);
		
	s_bMobile = isMobile();
        if(s_bMobile === false){
            s_oStage.enableMouseOver(FPS);  
            $('body').on('contextmenu', '#canvas', function(e){ return false; });
        }
		
        s_iPrevTime = new Date().getTime();

	createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.framerate = FPS;
        
        if(navigator.userAgent.match(/Windows Phone/i)){
                DISABLE_SOUND_MOBILE = true;
        }
        
        s_oSpriteLibrary  = new CSpriteLibrary();

        //ADD PRELOADER
        _oPreloader = new CPreloader();
        
        s_oLocalStorage = new CLocalStorage(GAME_NAME);
        
    };
    
    this.preloaderReady = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            this._initSounds();
        }
        
        this._loadImages();
        _bUpdate = true;
    };
    
    this.soundLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        _oPreloader.refreshLoader(iPerc);
    };
    
    this._initSounds = function(){
        Howler.mute(!s_bAudioActive);
        
        s_aSoundsInfo = new Array();
        
        s_aSoundsInfo.push({path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'});
        s_aSoundsInfo.push({path: './sounds/',filename:'press_button',loop:false,volume:1, ingamename: 'click'});
        s_aSoundsInfo.push({path: './sounds/',filename:'game_over',loop:false,volume:1, ingamename: 'game_over'});
        
        s_aSoundsInfo.push({path: './sounds/',filename:'start_game',loop:false,volume:1, ingamename: 'start_game'});
        s_aSoundsInfo.push({path: './sounds/',filename:'launch',loop:false,volume:1, ingamename: 'launch'});
        s_aSoundsInfo.push({path: './sounds/',filename:'toggle',loop:false,volume:1, ingamename: 'toggle'});
        s_aSoundsInfo.push({path: './sounds/',filename:'gate',loop:false,volume:1, ingamename: 'gate'});
        s_aSoundsInfo.push({path: './sounds/',filename:'bumper',loop:false,volume:1, ingamename: 'bumper'});
        s_aSoundsInfo.push({path: './sounds/',filename:'jumper',loop:false,volume:1, ingamename: 'jumper'});
        s_aSoundsInfo.push({path: './sounds/',filename:'pinball_button_on',loop:false,volume:1, ingamename: 'pinball_button_on'});
        s_aSoundsInfo.push({path: './sounds/',filename:'pinball_button_off',loop:false,volume:1, ingamename: 'pinball_button_off'});
        s_aSoundsInfo.push({path: './sounds/',filename:'in_hole',loop:false,volume:1, ingamename: 'in_hole'});
        s_aSoundsInfo.push({path: './sounds/',filename:'out_hole',loop:false,volume:1, ingamename: 'out_hole'});
        s_aSoundsInfo.push({path: './sounds/',filename:'flipper',loop:false,volume:1, ingamename: 'flipper'});

        ////////WIN SOUNDS
        s_aSoundsInfo.push({path: './sounds/',filename:'all_letters_complete',loop:false,volume:1, ingamename: 'all_letters_complete'});
        s_aSoundsInfo.push({path: './sounds/',filename:'all_lights_on_1',loop:false,volume:1, ingamename: 'all_lights_on_1'});
        s_aSoundsInfo.push({path: './sounds/',filename:'all_lights_on_2',loop:false,volume:1, ingamename: 'all_lights_on_2'});
        s_aSoundsInfo.push({path: './sounds/',filename:'letter',loop:false,volume:1, ingamename: 'letter'});
        s_aSoundsInfo.push({path: './sounds/',filename:'bonus_win_1',loop:false,volume:1, ingamename: 'bonus_win_1'});
        s_aSoundsInfo.push({path: './sounds/',filename:'bonus_win_2',loop:false,volume:1, ingamename: 'bonus_win_2'});
        s_aSoundsInfo.push({path: './sounds/',filename:'ball_out',loop:false,volume:1, ingamename: 'ball_out'});

        RESOURCE_TO_LOAD += s_aSoundsInfo.length;
        
        s_aSounds = new Array();
        for(var i=0; i<s_aSoundsInfo.length; i++){
            this.tryToLoadSound(s_aSoundsInfo[i], false);
        }
    };

    this.tryToLoadSound = function(oSoundInfo, bDelay){
        
       setTimeout(function(){        
            s_aSounds[oSoundInfo.ingamename] = new Howl({ 
                                                            src: [oSoundInfo.path+oSoundInfo.filename+'.mp3'],
                                                            autoplay: false,
                                                            preload: true,
                                                            loop: oSoundInfo.loop, 
                                                            volume: oSoundInfo.volume,
                                                            onload: s_oMain.soundLoaded,
                                                            onloaderror: function(szId,szMsg){
                                                                                for(var i=0; i < s_aSoundsInfo.length; i++){
                                                                                     if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                                                         s_oMain.tryToLoadSound(s_aSoundsInfo[i], true);
                                                                                         break;
                                                                                     }
                                                                                }
                                                                        },
                                                            onplayerror: function(szId) {
                                                                for(var i=0; i < s_aSoundsInfo.length; i++){
                                                                                     if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                                                          s_aSounds[s_aSoundsInfo[i].ingamename].once('unlock', function() {
                                                                                            s_aSounds[s_aSoundsInfo[i].ingamename].play();
                                                                                            if(s_aSoundsInfo[i].ingamename === "soundtrack" && s_oGame !== null){
                                                                                                setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME);
                                                                                            }

                                                                                          });
                                                                                         break;
                                                                                     }
                                                                                 }
                                                                       
                                                            } 
                                                        });

            
        }, (bDelay ? 200 : 0) );
    };

    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );

        s_oSpriteLibrary.addSprite("but_play","./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("msg_box","./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("credits_panel","./sprites/credits_panel.png");
        s_oSpriteLibrary.addSprite("ctl_logo","./sprites/ctl_logo.png");
        s_oSpriteLibrary.addSprite("but_credits","./sprites/but_credits.png");
        s_oSpriteLibrary.addSprite("but_yes","./sprites/but_yes.png");
        s_oSpriteLibrary.addSprite("but_no","./sprites/but_no.png");
        s_oSpriteLibrary.addSprite("score_panel","./sprites/score_panel.png");
        s_oSpriteLibrary.addSprite("keys","./sprites/keys.png");
        s_oSpriteLibrary.addSprite("but_restart","./sprites/but_restart.png");
        s_oSpriteLibrary.addSprite("but_home","./sprites/but_home.png");
        s_oSpriteLibrary.addSprite("hand_anim","./sprites/hand_anim.png");
        s_oSpriteLibrary.addSprite("bg_menu","./sprites/bg_menu.jpg"); 
        
        s_oSpriteLibrary.addSprite("but_settings","./sprites/but_settings.png");
        s_oSpriteLibrary.addSprite("but_exit","./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("audio_icon","./sprites/audio_icon.png");
        s_oSpriteLibrary.addSprite("but_fullscreen","./sprites/but_fullscreen.png");     
        s_oSpriteLibrary.addSprite("bestscore","./sprites/bestscore.png");
        s_oSpriteLibrary.addSprite("extra_ball","./sprites/extra_ball.png");
        s_oSpriteLibrary.addSprite("star","./sprites/star.png");
        
        
        s_oSpriteLibrary.addSprite("pinball_bg","./sprites/pinball_elements/pinball_bg.jpg");

        s_oSpriteLibrary.addSprite("multiplier_light","./sprites/pinball_elements/multiplier_light.png");
        s_oSpriteLibrary.addSprite("multiplier_toggle_light","./sprites/pinball_elements/multiplier_toggle_light.png");
        
        s_oSpriteLibrary.addSprite("bumper","./sprites/pinball_elements/bumper.png");
        s_oSpriteLibrary.addSprite("bumper_button","./sprites/pinball_elements/bumper_button.png");
        s_oSpriteLibrary.addSprite("capsule_0","./sprites/pinball_elements/capsule_0.png");
        s_oSpriteLibrary.addSprite("capsule_1","./sprites/pinball_elements/capsule_1.png");
        s_oSpriteLibrary.addSprite("capsule_2","./sprites/pinball_elements/capsule_2.png");
        s_oSpriteLibrary.addSprite("capsule_3","./sprites/pinball_elements/capsule_3.png");
        for(var i=0; i<6; i++){
            s_oSpriteLibrary.addSprite("button_light_"+i,"./sprites/pinball_elements/button_light_"+i+".png");
        }
        s_oSpriteLibrary.addSprite("curve_light_button","./sprites/pinball_elements/curve_light_button.png");
        s_oSpriteLibrary.addSprite("light_indicator_0","./sprites/pinball_elements/light_indicator_0.png");
        s_oSpriteLibrary.addSprite("light_indicator_1","./sprites/pinball_elements/light_indicator_1.png");
        s_oSpriteLibrary.addSprite("light_indicator_2","./sprites/pinball_elements/light_indicator_2.png");
        
        for(var i=0; i<7; i++){
            s_oSpriteLibrary.addSprite("router_light_"+i,"./sprites/pinball_elements/router_light_"+i+".png");
        }
        
        
        
        s_oSpriteLibrary.addSprite("curve_tunnel","./sprites/pinball_elements/curve_tunnel.png");
        s_oSpriteLibrary.addSprite("eye","./sprites/pinball_elements/eye.png");
        s_oSpriteLibrary.addSprite("arrow_light_0","./sprites/pinball_elements/arrow_light_0.png");
        s_oSpriteLibrary.addSprite("arrow_light_1","./sprites/pinball_elements/arrow_light_1.png");
        for(var i=0; i<7; i++){
            s_oSpriteLibrary.addSprite("letter_"+i,"./sprites/pinball_elements/letter_"+i+".png");
        }
        s_oSpriteLibrary.addSprite("logo","./sprites/pinball_elements/logo.png");
        
        s_oSpriteLibrary.addSprite("jackpot","./sprites/pinball_elements/jackpot.png");
        
        s_oSpriteLibrary.addSprite("tunnel_start","./sprites/pinball_elements/tunnel_start.png");
        s_oSpriteLibrary.addSprite("arrow_start","./sprites/pinball_elements/arrow_start.png");
        s_oSpriteLibrary.addSprite("start_platform","./sprites/pinball_elements/start_platform.png");
        s_oSpriteLibrary.addSprite("spring","./sprites/pinball_elements/spring.png");
        s_oSpriteLibrary.addSprite("flipper_bumper","./sprites/pinball_elements/flipper_bumper.png");
        s_oSpriteLibrary.addSprite("hole","./sprites/pinball_elements/hole.png");
        s_oSpriteLibrary.addSprite("shield","./sprites/pinball_elements/shield.png");
        s_oSpriteLibrary.addSprite("jumper","./sprites/pinball_elements/jumper.png");
        s_oSpriteLibrary.addSprite("safe_pin","./sprites/pinball_elements/safe_pin.png");
        s_oSpriteLibrary.addSprite("gate","./sprites/pinball_elements/gate.png");
        s_oSpriteLibrary.addSprite("ball","./sprites/pinball_elements/ball.png");
        s_oSpriteLibrary.addSprite("flipper","./sprites/pinball_elements/flipper.png");
        
        
        
        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };
    
    this._onImagesLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        _oPreloader.refreshLoader(iPerc);

    };
    
    this._onAllImagesLoaded = function(){
        
    };
    
    this._onRemovePreloader = function(){
        _oPreloader.unload();

        s_oSoundtrack = playSound('soundtrack', 1, true);


        this.gotoMenu();
    };
    
    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };

    this.gotoGame = function(){
        
        _oGame = new CGame(_oData);   						
        _iState = STATE_GAME;
    };
    
    this.gotoHelp = function(){
        _oHelp = new CHelp();
        _iState = STATE_HELP;
    };
	
    this.stopUpdate = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
        $("#block_game").css("display","block");
        Howler.mute(true);
     };

    this.startUpdate = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false;
        $("#block_game").css("display","none");

        if(s_bAudioActive){
                Howler.mute(false);
        }
    };
    
    this._update = function(event){
		if(_bUpdate === false){
			return;
		}
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;
        
        if ( s_iCntTime >= 1000 ){
            s_iCurFps = s_iCntFps;
            s_iCntTime-=1000;
            s_iCntFps = 0;
        }
                
        if(_iState === STATE_GAME){
            _oGame.update();
        }
        
        s_oStage.update(event);

    };
    
    s_oMain = this;
    
    _oData = oData;
    
    ENABLE_FULLSCREEN = oData.fullscreen;
    ENABLE_CHECK_ORIENTATION = oData.check_orientation;
    
    s_bAudioActive = oData.audio_enable_on_startup;
    
    this.initContainer();
}
var s_bMobile;
var s_bAudioActive = false;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;
var s_bFullscreen = false;
var s_aSounds = new Array();
var s_aSoundsInfo = new Array();

var s_oDrawLayer;
var s_oStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oSoundtrack;
var s_oCanvas;
var s_oLocalStorage;