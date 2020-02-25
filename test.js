const { Tarkov, generate_hwid } = require('tarkov');
const tarkov = new Tarkov();

//READ LOGIN INFO FROM .TXT
var fs = require("fs");
var text = fs.readFileSync("./info.txt").toString('utf-8');
var rText = text.split("\r\n");
let email = "";
let password = "";
let hwid = "";

for (k = 0; k < rText.length; k++) {
    if(rText[k].includes("email:"))
        email = rText[k].replace("email:","").trim();
    if(rText[k].includes("password:"))
        password = rText[k].replace("password:","").trim();
    if(rText[k].includes("hwid:"))
        hwid = rText[k].replace("hwid:","").trim();
}

var profile;
var t;

var itemList =  { // ItemShortName, BuyPrice, item, count, searchResult,
    "Keycard": ["Keycard",80000,null,0,null],
    "GraphicsCard": ["Graphics card", 200000,null,0,null],
    "Keytool": ["Keytool",300000,null,0,null],
    "LEDX": ["LEDX",500000,null,0,null],
    "Red": ["Red",500000,null,0,null],
    "Green": ["Green", 500000,null, 0,null],
    "Violet": ["Violet",500000,null,0,null]
}
var roubles;
var itemName = "Keycard"; var buyPrice = 130000;

(async () => {
    try {

        await setup();
        //await main();
        await buyMultipleItems();
        //await oldMain();
        //await testing();
        //await updateProfile();


    }
    catch(err) {
        console.log("> PROGRAM ENCOUNTERED AN ERROR");
        console.log(error);
    }
})();


async function main(){

        let item = await chooseSearchItem(itemName);

        let roubles = await profile.getRoubles();
        console.log(roubles.stacks[1]);

        console.log(roubles.amount);

        //await mergeStack("Roubles");

        let count = 0;
        roubles.stacks.sort(compare);
        console.log(roubles.stacks);
        let roubleStackIndex = maxArrayIndex(roubles.stacks);

        //let errorCheck = false;
        console.log("Using stack", roubleStackIndex, ":",roubles.stacks[roubleStackIndex].upd.StackObjectsCount);
        while (true) {
            let search = await t.search_market(0, 15, {handbook_id: item.id, max_price: 170000, currency: 1});
            let firstOffer = search.offers[0];
            //await profile.updateItems(chooseSearchItem("Roubles"));
            if (firstOffer.requirementsCost < buyPrice) {
                try {

                    let buy = await t.buy_item(firstOffer._id, 1, {
                        id: roubles.stacks[0]._id,
                        count: firstOffer.requirementsCost
                    });

                    if(buy.new != null) {
                        console.log(itemName, count, ": ", firstOffer.requirementsCost);
                        await updateProfileAfterBuy(buy);
                        console.log("made it past update");
                        //roubleStackIndex = maxArrayIndex(roubles.stacks);
                        roubles.stacks.sort(compare);
                        count++;
                        console.log("Now using stack", roubles.stacks[0].upd.StackObjectsCount);
                    }
                    else {
                        console.log(firstOffer.requirementsCost, ": ", buy.errmsg);
                    }
                } catch (err) {
                    console.log("Error in main, if statement, item probably not found")
                    console.log(err);
                    //errorCheck = true;
                }

            }

    }
}

async function buyMultipleItems(){

    //set all item IDs up
    for (let key in itemList){
        itemList[key][2] = await chooseSearchItem(itemList[key][0]);
    }

    roubles = await profile.getRoubles();
    console.log(roubles.amount);
    let count = 0;
    roubles.stacks.sort(compare);

    while (true) {

            [itemList.Keycard[4], itemList.Keytool[4],itemList.GraphicsCard[4],itemList.LEDX[4],itemList.Red[4],itemList.Green[4],itemList.Violet[4]]
                = await Promise.all([
                t.search_market(0, 5, {handbook_id: itemList.Keycard[2].id, max_price: itemList.Keycard[1], currency: 1}),
                t.search_market(0, 5, {handbook_id: itemList.Keytool[2].id, max_price: itemList.Keytool[1], currency: 1}),
                t.search_market(0, 5, {handbook_id: itemList.GraphicsCard[2].id, max_price: itemList.GraphicsCard[1], currency: 1}),
                t.search_market(0, 5, {handbook_id: itemList.LEDX[2].id, max_price: itemList.LEDX[1], currency: 1}),
                t.search_market(0, 5, {handbook_id: itemList.Red[2].id, max_price: itemList.Red[1], currency: 1}),
                t.search_market(0, 5, {handbook_id: itemList.Green[2].id, max_price: itemList.Green[1], currency: 1}),
                t.search_market(0, 5, {handbook_id: itemList.Violet[2].id, max_price: itemList.Violet[1], currency: 1}),
            ]);

            for (let key in itemList){
                if( itemList[key][4].offers[0] != undefined){
                    await buyItem(itemList[key][4].offers[0], itemList[key]);
                }
            }


    }

}

async function buyItem(firstOffer,item){
    try {

        let buy = await t.buy_item(firstOffer._id, 1, {
            id: roubles.stacks[0]._id,
            count: firstOffer.requirementsCost
        });

        if(buy.new != null) {
            console.log(item[0], item[3], ": ", firstOffer.requirementsCost, "                        ",roubles.stacks[0].upd.StackObjectsCount);
            await updateProfileAfterBuy(buy);
            item[3]++;
        }
        else {
            console.log(item[0],":",firstOffer.requirementsCost, ":", buy.errmsg);
        }
    } catch (err) {
        console.log("> ERROR: buyItem()");
        console.log(err);
        //errorCheck = true;
    }
}

async function oldMain(){

    let item = await chooseSearchItem(itemName);

    let roubles = await profile.getRoubles();
    console.log(roubles.stacks[1]);

    console.log(roubles.amount);
    let roublesInStash = roubles.amount;
    let roubleStackIndex = maxArrayIndex(roubles.stacks);
    //await mergeStack("Roubles");

    let count = 0;
    while (roubles.amount > 200000) {
        let search = await t.search_market(0, 15, {handbook_id: item.id, max_price: 8000000, currency: 1});
        let firstOffer = search.offers[0];
        //await profile.updateItems(chooseSearchItem("Roubles"));
        //let roubles = await profile.getRoubles();
        //let roubleStackIndex = maxArrayIndex(roubles.stacks);


        if (firstOffer.requirementsCost < buyPrice) {
            try {

                let buy = await t.buy_item(firstOffer._id, 1, {
                    id: roubles.stacks[roubleStackIndex]._id,
                    count: firstOffer.requirementsCost
                });

                console.log(itemName, count, ": ", firstOffer.requirementsCost);
                console.log(buy);
                console.log(">You now have ", numberWithCommas(roublesInStash), " roubles");
                count++;
            } catch (err) {
                console.log("Error in main")
                console.log(err);
            }

        }
    }
}

function compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const stackA = a.upd.StackObjectsCount;
    const stackB = b.upd.StackObjectsCount;

    let comparison = 0;
    if (stackA > stackB) {
        comparison = -1;
    } else if (stackA < stackB) {
        comparison = 1;
    }
    return comparison;
}

async function setup(offer_id, quantity, barter_item)
{
    try{
        //let hwid = generate_hwid();
        //console.log(`Save this hwid: ${hwid}`);

        var lv = await tarkov.checkLauncherVersion();
        console.log('>', lv);

        // Check if gameVersion is up-to-date
        var gv = await tarkov.checkGameVersion();
        console.log('>', gv);

        // Login with username, pw, hwidsavedHw
        t = await tarkov.login(email, password, hwid);

        // Get profiles and select your pmc
        let profiles = await t.get_profiles();
        profile = profiles.find(p => p.info.side !== 'Savage');
        await t.select_profile(profile.id);
        console.log(`> Hello, ${profile.info.nickname}!`);

        // Get localization strings.
        await t.get_i18n("en");

    } catch(err) {
        console.log(error);
    }
}

async function chooseSearchItem(itemName){
    try{
        // Find specific items id. Ex. Labcard
        // Get all items
        let items = await t.get_items();
        let item = items.find(i => i.props.shortname == itemName);
        console.log(`>`, itemName ,`item id: ${item.id}`);
        return item;

    }
    catch(err) {
        console.log("FUCK");
        console.log(error);
    }
}

function sortArrayDescending(arg1)
{
    /*
    let maxIndex = 0;
    let maxVal = 0;
    for(let k = 0; k < arg1.length ; k++) {
        if (arg1[k] > maxVal) {
            maxIndex = k;
            maxVal = arg1[k];
        }
    }
    return maxIndex;
    */
    arg1.sort(function(a, b){return b-a});
}

function maxArrayIndex(arg)
{
    let maxIndex = 0;
    console.log("arg.length:",arg.length);
    for(let k = 0; k < arg.length ; k++) {
        if (arg[k].upd.StackObjectsCount > arg[maxIndex].upd.StackObjectsCount) { //if new stack > previous biggest stack
            maxIndex = k;
        }
    }
    return maxIndex;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function mergeStack(stackItemName){
    let item = await chooseSearchItem(stackItemName);
    let maxStackSize = 500000;
    let roubles = await profile.getRoubles();

    console.log("> There are", roubles.stacks.length, "stacks of",stackItemName, "in your inventory");
    //console.log("> The max stack size is ",item.props.stackMaxSize);
    console.log("> The max stack size is ",maxStackSize);
    console.log("> You should have", roubles.amount / maxStackSize, "stacks");
    console.log("> remainder: ", roubles.amount % maxStackSize);
    console.log("> Item id 1: ", roubles.stacks[0]._id);
    console.log("> Item id 2: ", roubles.stacks[1]._id);


    if(roubles.amount > maxStackSize) {
        let fullStacks = [];
        let emptyStacks = [];

        for (k = 0; k < roubles.stacks.length; k++) {
            console.log(k, ":", roubles.stacks[k].upd.StackObjectsCount);
            if (roubles.stacks[k].upd.StackObjectsCount == maxStackSize)
                fullStacks.push(roubles.stacks[k]);
            else
                emptyStacks.push(roubles.stacks[k]);
        }

        while(fullStacks.length < Math.floor(roubles.amount / maxStackSize)) { //While there are not the max amount of full stacks


            console.log("> Item id 1: ", emptyStacks[0]._id);
            console.log("> Item id 2: ", emptyStacks[1]._id);


            console.log("> Moving stack 0 of amount", emptyStacks[0].upd.StackObjectsCount, "to stack 1 of amount", emptyStacks[1].upd.StackObjectsCount)
            await t.stack_item(emptyStacks[0]._id, emptyStacks[1]._id);

            roubles = await profile.getRoubles();

            if(emptyStacks[1].upd.StackObjectsCount == 500000) { //If the stack that was just merged to is now full add it to fullstacks and remove it from emptyStacks
                fullStacks.push(emptyStacks[1]);
                emptyStacks.splice(1,1)
            }

            if(emptyStacks[0].upd.StackObjectsCount == 0 || emptyStacks[0] == undefined) { //If all of stack 0 was merged onto stack 1 then delete stack 0
                console.log("> Removing Empty Stack:", emptyStacks[0]);
                emptyStacks.splice(0,1);
            }

        }
        console.log(emptyStacks);
    }
}


async function testing() {
    let iName = "ZT AP"; let bPrice = 1200;
    let item1 = chooseSearchItem(iName);


    let search = await t.search_market(0, 15, {handbook_id: item1.id, max_price: 5000, currency: 1});
    let fO = search.offers[0];
    //await profile.updateItems(chooseSearchItem("Roubles"));
    let roubles = await profile.getRoubles();
    console.log(roubles.stacks[1].upd.StackObjectsCount);

    //console.log(roubles.stacks[1]);
    console.log(1);
    console.log(fO.requirementsCost);
    console.log(2);

    if(fO.requirementsCost < bPrice)
    {
        try {

            var buy = await t.buy_item(fO._id, 1, {
                id: roubles.stacks[1]._id,
                count: fO.requirementsCost
            });
            console.log(buy);
            console.log("bought for", fO.requirementsCost);
        } catch (err) {
            console.log(err);
            console.log("> error in IF statement in Testing()");
        }
    }

    roubles = await profile.getRoubles();
    console.log(roubles.stacks[1].upd.StackObjectsCount);


}

async function updateProfileAfterBuy(buy){
    if(buy.new) await profile.addItems(buy.new);
    if(buy.change) await profile.updateItems(buy.change);
    if(buy.del) await profile.removeItems(buy.del);
    roubles = await profile.getRoubles();
    roubles.stacks.sort(compare);
}