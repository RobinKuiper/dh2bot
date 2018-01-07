// ==UserScript==
// @name		DH2 Bot
// @namespace
// @version		0.5.1
// @description
// @author		Robin Kuiper
// @match		http://*.diamondhunt.co/index.php
// @match		https://*.diamondhunt.co/index.php
// @run-at document-idle
// @grant		none
// ==/UserScript==

(function() {
    'use strict';

    const SECONDS = 0x3E8;
    const MINUTES = 0x3c * SECONDS;
    const HOURS = 0x3c * MINUTES;

    var firstRun = true;

    /*******************/
    /* SMELTING
    /*******************/
    var SMELT_AMOUNT = 360;
    var bar;

    // BAR DATABASE
    const GLASS = { name: 'glass', time: 1, oil: 10, ingredient: 'sand' };

    const BARS = [
        //name: 'glass', time: 1, oil: 10, ingredient: 'sand' },
        //{ name: 'bronzeBar', time: 1, oil: 10, ingredient: 'copper', ingredient2: 'tin' },
        { name: 'ironBar', time: 5, oil: 100, ingredient: 'iron' },
        { name: 'silverBar', time: 10, oil: 300, ingredient: 'silver' },
        //{ name: 'goldBar', time: 30, oil: 1000, ingredient: 'gold' }
    ];

    // SET SMELT AMOUNT
    if(boundPromethiumFurnace == 1)
        SMELT_AMOUNT = 500;
    else if (boundGoldFurnace == 1)
        SMELT_AMOUNT = 300;
    else if (boundSilverFurnace == 1)
        SMELT_AMOUNT = 150;
    else if (boundIronFurnace == 1)
        SMELT_AMOUNT = 75;
    else if (boundBronzeFurnace == 1)
        SMELT_AMOUNT = 30;
    else if (boundStoneFurnace == 1)
        SMELT_AMOUNT = 10;

    if(achCraftingEasyCompleted)
        SMELT_AMOUNT += SMELT_AMOUNT / 100 * 10;

    console.log(SMELT_AMOUNT);

     // FIRST TIME
    setTimeout(function() {
	    if(smeltingPerc === 0 && SMELT_AMOUNT !== null){
	        bar = BARS[0];
	        if(window[bar.ingredient] >= SMELT_AMOUNT && oil >= bar.oil * SMELT_AMOUNT){
	            if(bar.name != "bronzeBar"){
	                sendSmelt(bar.name, SMELT_AMOUNT);
	            } else {
	                if(window[bar.ingredient2] >= SMELT_AMOUNT){
	                    sendSmelt(bar.name, SMELT_AMOUNT);
	                }
	            }
	        }
	    }
    }, 5000);

    // SMELT INTERVAL
    setTimeout(function() {
		setInterval(function()	{
		    if(smeltingPerc === 0 && SMELT_AMOUNT !== null){
                console.log("Not smelting atm");
                bar = BARS[Math.floor((Math.random() * BARS.length) + 0)];
                if(vialOfWater === 0 && sand >= 20){
                    console.log("No more vials, smelting glass");
                    bar = GLASS;
                    SMELT_AMOUNT = sand;
                }
		        if(window[bar.ingredient] >= SMELT_AMOUNT && oil >= bar.oil * SMELT_AMOUNT){
                    console.log("We have the right ingredients for the choosen bar.");
		            if(bar.name != "bronzeBar"){
		                sendSmelt(bar.name, SMELT_AMOUNT);
		            } else {
		                if(window[bar.ingredient2] >= SMELT_AMOUNT){
		                    sendSmelt(bar.name, SMELT_AMOUNT);
		                }
		            }
		        }
		    }
		}, 1 * MINUTES);
	}, 20000);

    function sendSmelt(bar, amount) {
        var cmd = 'SMELT=';
        cBytes(cmd + bar + '~' + amount);
        console.log('smelting', bar, amount);
    }

    function sendCraft(item, amount=1){
    	cBytes("MULTI_CRAFT=" + item + "~" + amount);
    }

    /*******************/
    /* FARMING
    /*******************/
    var SeedsToPlant = ['wheatSeeds', 'dottedGreenLeafSeeds', 'redMushroomSeeds', 'limeLeafSeeds', 'snapegrassSeeds', 'greenLeafSeeds', 'blewitMushroomSeeds', 'carrotSeeds', 'tomatoSeeds', 'treeSeeds', 'oakTreeSeeds' ];

    setInterval(function(){
        for(var i = 0; i < 4; i++) {
        	//console.log("Empty farming-patch-text-" + (i + 1) + ": " + (window["farming-patch-text-" + (i + 1)].innerHTML == "Click to harvest"));
            //if(window["farming-patch-text-" + (i + 1)].innerHTML == "Click to harvest") {
            //    sendHarvest(i + 1);
            //}
            if(window["farming-patch-text-" + (i + 1)].innerHTML == "Click to harvest" || window["farmingPatchTimer" + (i + 1)] == "0") { // || window["farmingPatchTimer" + (i + 1)] == "0"
                sendHarvest(i + 1);
                var seeded = false;
                for(var j = 0; j < SeedsToPlant.length; j++) {
                    if(window[SeedsToPlant[j]] >= 1 && !seeded){
                        sendPlant(SeedsToPlant[j], i + 1);
                        seeded = true;
                        break;
                    }
                }
            }
        }
    }, 5000);

    function sendHarvest(patchId) {
        var cmd = 'HARVEST=';
        cBytes(cmd + patchId);
        console.log('harvesting', patchId);
    }

    function sendPlant(seed, patchId) {
        var cmd = 'PLANT=';
        cBytes(cmd + seed + '~' + patchId);
        console.log('planting', seed, 'in patch:', patchId);
    }

    /*******************/
    /* FARMING
    /*******************/
    var CRAFTS = [
        { name: 'vialOfWater', ingredients: [ { name: 'glass', amount: 5 }] }
    ];

    setInterval(function(){
        for(var i = 0; i < CRAFTS.length; i++){
            var canCraft = false;
            for(var j = 0; j < CRAFTS[i].ingredients.length; j++){
                if(window[CRAFTS[i].ingredients[j].name] >= CRAFTS[i].ingredients[j].amount){
                    canCraft = true;
                }else
                    canCraft = false;
            }

            if(canCraft){
                sendCraft("vialOfWater", Math.floor(glass / 5));
            }
        }
    }, 20 * SECONDS);

    /*******************/
    /* FIGHTING
    /*******************/
    setInterval(function(){
        if(window["fight-cooldown"].innerHTML == "Ready" && combatGlobalCooldown == "0") {
            /*if(energy >= 15000) {
                sendFight('hauntedMansion');
            } else if(energy >= 7000) {
                sendFight('northFields');
            } else*/ if(energy >= 3000) {
                sendFight('volcano');
            } /*else if(energy >= 1000) {
                sendFight('caves');
            } else if(energy >= 100) {
                sendFight('forests');
            } else if (energy >= 50) {
                sendFight('fields');
            }*/
        }
    }, 10000);

    function sendFight(location) {
        var cmd = 'FIGHT=';
        cBytes(cmd + location);
        console.log('fighting at', location);
    }

    /*******************/
    /* BREWING/DRINKING
    /*******************/
    var BREWS = ['stardustPotion', 'superStardustPotion']; //'essencePotion', 'superEssencePotion', 'treePotion', 'seedPotion', 'oilPotion', 'smeltingPotion', 'barPotion', 'superStardustPotion'];

    BREWS = [
    	{
    		name: 'stardustPotion',
    		level: 1,
    		ingredients: [
    			{ name: 'dottedGreenLeaf', amount: 1 },
    			{ name: 'redMushroom', amount: 25 }
    		]
    	},
    	{
    		name: 'barPotion',
    		level: 20,
    		ingredients: [
    			{ name: 'greenLeaf', amount: 3 },
    			{ name: 'blewitMushroom', amount: 50 }
    		]
    	},
        {
    		name: 'oilPotion',
    		level: 20,
    		ingredients: [
    			{ name: 'greenLeaf', amount: 3 },
    			{ name: 'blewitMushroom', amount: 50 }
    		]
    	},
    	{
    		name: 'superStardustPotion',
    		level: 20,
    		ingredients: [
    			{ name: 'limeLeaf', amount: 5 },
    			{ name: 'snapegrass', amount: 50 }
    		]
    	}
    ];

    setInterval(function(){
    	// BREWING
    	/*var canBrew = true;
    	for(var i = 0; i < BREWS.length; i++){
    		if(BREWS[i].level <= brewingLevelCache){
    			for(var j = 0; j < BREWS[i].ingredients.length; j++){
					if(BREWS[i].ingredients[j].amount > window[BREWS[i].ingredients[j].name]){
						canBrew = false;
					}
    			}
    			if(canBrew){
    				var amount1 =
    			}
    		}
    	}*/
        if(dottedGreenLeaf > 0 && vialOfWater > 0 && redMushroom >= 25) {
            var reds = Math.floor(redMushroom / 25);
            sendBrew('stardustPotion', reds >= dottedGreenLeaf ? dottedGreenLeaf : reds);
        }

        if(limeLeaf >= 5 && vialOfWater >= 1 && snapegrass >= 50) {
            var snapes = Math.floor(snapegrass / 50);
            sendBrew('superStardustPotion', snapes >= limeLeaf ? limeLeaf : snapes);
        }

        if(greenLeaf >= 3 && vialOfWater >= 1 && blewitMushroom >= 50) {
            var blewits = Math.floor(blewitMushroom / 50);
            sendBrew('barPotion', blewits >= greenLeaf ? greenLeaf : blewits);
        }

        // Drinking
        for(var j = 0; j < BREWS.length; j++) {
            if(window[BREWS[j].name + "Timer"] == "0") {
                if(window[BREWS[j].name] > 0) {
                    sendDrink(BREWS[j].name);
                }
            }
        }
    }, 5000);

    function sendDrink(potion) {
        var cmd = 'DRINK=';
        cBytes(cmd + potion);
        console.log('drinking', potion);
    }

    function sendBrew(potion, amount) {
        var cmd = "BREW=";
        cBytes(cmd + potion + "~" + amount);
        console.log('brewing', amount, potion);
    }

    /*******************/
    /* FISHING BOAT
    /*******************/
    var BOAT = null;
    var BOATTIMER;

    // SET BOAT
    if(boundSteamBoat == 1)
        BOAT = 'steamBoat';
    else if (boundCanoe == 1){
        BOAT = 'canoe';
        BOATTIMER = 6 * HOURS;
    }
    else if (boundSailBoat == 1)
        BOAT = 'sailBoat';
    else if (boundRowBoat == 1){
        BOAT = 'rowBoat';
        BOATTIMER = 3 * HOURS;
    }

    BOAT = 'rowBoat';
    BOATTIMER = 3 * HOURS;

    if(window[BOAT + "Timer"] === 0)
        sendBoat(BOAT);

    setInterval(function(){
        if(BOAT !== null){
            if(window[BOAT + "Timer"] === 0) {
                sendBoat(BOAT);
            }
        }
    }, 10 * MINUTES);

    function sendBoat(boat) {
        var cmd = ('BOAT=');
        cBytes(cmd + boat);
        console.log('sending', boat);
    }

    /*******************/
    /* WOODCUTTING
    /*******************/
    setInterval(function(){
        for(var tree = 1; tree < 7; tree++) {
            if(window["wc-div-tree-lbl-" + tree].innerHTML == "Ready To Harvest Tree!") {//"(ready)") {
                if(window["treeUnlocked" + tree]) {
                    sendChop(tree);
                }
            }
        }
    }, 5000);

    function sendChop(patch) {
        var cmd = 'CHOP_TREE=';
        cBytes(cmd + patch);
        console.log('chopping', patch);
    }

    /*******************/
    /* UPDATE
    /*******************/
    setInterval(function() {
		update();
	}, 5 * MINUTES);

    function update() {
        if(webSocket.readyState > 1)
            location.reload();
        console.log('UPDATED');
    }
})();