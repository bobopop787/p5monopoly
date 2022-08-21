let boardImg;
let rotateImg;
let fonts = {
  regular: null,
  bold: null,
  inline: null
};

let cards;
let tiles = [];
let players = [];
let dices = [1, 1];
let numPlayers = 4;
let displayingCard;
let doubles = 0;
let needsChance = false;
let needsChest = false;
let propertyPending = false;
let utilityRoll = false;
let askBuy = false;

let tempDelay;

let a = 0;

function testfunc() {
  displayingCard=cards.property[a]
  a++
  a%=cards.property.length
}

let isRolling = false;
let currentPlayer = 0;

const cardType = {
  CHANCE: "CHANCE",
  CHEST: "CHEST",
  PROPERTY: "PROPERTY"
}

const colorGroup = {
  BROWN: {id: 0, color: colorObj(149, 84, 54)},
  LIGHT_BLUE: {id: 1, color: colorObj(170, 224, 250)},
  PINK: {id: 2, color: colorObj(217, 58, 150)},
  ORANGE: {id: 3, color: colorObj(247, 148, 29)},
  RED: {id: 4, color: colorObj(237, 27, 36)},
  YELLOW: {id: 5, color: colorObj(254, 242, 0)},
  GREEN: {id: 6, color: colorObj(33, 177, 90)},
  BLUE: {id: 7, color: colorObj(0, 113, 186)},
  UTILITY: {id: 8},
  RAILROAD: {id: 9}
}

const tilesType = {
  HORIZONTAL: -1, //long side left right
  CORNER: 0,
  VERTICAL: 1     //long side up down
}

//Card object setup
class Card {
  constructor(id) {
    this.id = id;
  }
  
  render() {
    //please implement for all inherited classes
  }
}

//Action card setup
class ActionCard extends Card {
  constructor(id, type, desc, action) {
    super(id);
    this.type = type;
    this.title = (this.type == cardType.CHEST ? "COMMUNITY " : "") + this.type;
    this.desc = desc;
    this.action = action; //must take in one parameter, player
  }
  
  render() {
    fill(255);
    stroke(0);
    strokeWeight(1);
    rect(375, 375, 200, 125);
    textFont(fonts.regular);
    textSize(18);
    fill(0);
    text(this.title, 375, 335);
    push();
    textAlign(CENTER, CENTER);
    textFont(fonts.inline);
    textSize(12);
    text(this.desc, 375, 395);
    pop();
  }
}

//Property card setup
class PropertyCard extends Card {
  constructor(name, group, properties) {
    super(name);
    
    this.group = group;
    this.mortgaged = false;
    this.ownedBy = 0;
    switch(group.id) {
      case colorGroup.UTILITY.id:
        this.price = 150;
        this.mortgage = 75;
        break;
      case colorGroup.RAILROAD.id:
        this.price = 200;
        this.mortgage = 100;
        break;
      default:
        /*
        properties structure
        {
          price: //base price
          house: //house price
          hotel: //hotel price
          incomes: //array:
            [
              baseRent //0
              1houseRent //1
              2houseRent //2
              3houseRent //3
              4houseRent //4
              hotelRent //5
            ]
        }
        */
        this.price = properties.price;
        this.housePrice = properties.house;
        this.hotelPrice = properties.price;

        this.rent = properties.incomes[0];
        this.incomes = properties.incomes;
        
        this.color = group.color;
        this.houses = 0;
        this.mortgage = this.price / 2;
        break;
    }
  }
  
  getIncome() {
    
  }
  
  render() {
    fill(255);
    stroke(0);
    strokeWeight(1);
    rect(375, 375, 125, 200);
    if(this.group.id < colorGroup.UTILITY.id) {
      fill(objColor(this.color));
      noStroke();
      rect(375, 300, 116, 41);
      fill(255);
      if(this.group == colorGroup.YELLOW || this.group == colorGroup.LIGHT_BLUE) fill(0);
      textFont(fonts.bold);
      textSize(14);
      text(this.id, 375, 300);
      fill(0);
      textSize(10);
      text("Rent: $" + this.incomes[0], 375, 330);
      textAlign(LEFT, BASELINE);
      text("With 1 House:            $" + this.incomes[1] +
           "\nWith 2 Houses:          $" + this.incomes[2] +
           "\nWith 3 Houses:          $" + this.incomes[3] +
           "\nWith 4 Houses:          $" + this.incomes[4] +
           "\nWith Hotel:                $" + this.incomes[5], 320, 350);
      textAlign(CENTER, BASELINE);
      text("Mortgage Value: $" + this.mortgage +
           "\n Houses cost $" + this.housePrice + " each" +
           "\nHotels cost $" + this.hotelPrice + " plus 4 houses", 375, 420);
      textSize(6);
      push();
      textLeading(5);
      text("If a player owns all the lots of a color group, the rent is doubled on unimproved lots of that group. Houses may only be bought if a full color group is owned and may not differ more than 1 house than the others in the color group.", 375, 452, 120);
      pop();
      textAlign(CENTER, CENTER);
    } else {
      textFont(fonts.inline);
      fill(0);
      textSize(14);
      text(this.id, 375, 300);
      textFont(fonts.regular);
      textAlign(LEFT, BASELINE);
      textSize(10);
      if(this.group == colorGroup.RAILROAD) {
        text("Rent:                            $25" +
             "\nIf 2 R.R.'s are owned:    $50" +
             "\nIf 3 R.R.'s are owned:    $100" +
             "\nIf 4 R.R.'s are owned:    $200" +
             "\n\nMortgage value:            $100", 320, 350);
      } else {
        text("    If one utility is owned, rent\nis 4x the amount shown\non dice.\n    If both utilities are owned,\nrent is 10x the amount shown\non dice.\n\nMortgage Value:             $75", 320, 350);
      }
      textAlign(CENTER, CENTER);
      
    }
  }
  
  playerRender(xOff, yOff) { //show in player area
    //might stay unused
  }
  
  playerClick(xOff, yOff) {
    //might stay unused
    if(false/* TODO: ACYULALY GET MOUSE POS */) return;
    if(displayingCard != null) return;
    displayingCard = this;
  }
}

//Tiles setup
class Tile {
  constructor(id, tileType, x, y, hasCard, action) {
    this.tileType = tileType; //-1 horizontal, 0 corner, 1 vertical
    this.x = x; //tile middle coord(x)
    this.y = y; //tile middle coord(y)
    this.hasCard = hasCard; //boolean
    this.action = action; //action if above false, card if above true TODO
    if(this.hasCard) this.card = action;
    this.id = id;
  }
  
  checkInfo() {
    //TEST CODE!!!!
    if(this.tileType == tilesType.CORNER) {
      if(mouseX > this.x - 49 && mouseX < this.x + 49 &&
        mouseY > this.y - 49 && mouseY < this.y + 49) {
        console.log(this.id);
      }
    } else {
      if(mouseX > this.x - (this.tileType == tilesType.HORIZONTAL ? 49 : 30) &&
         mouseX < this.x + (this.tileType == tilesType.HORIZONTAL ? 49 : 30) &&
         
         mouseY > this.y - (this.tileType == tilesType.VERTICAL ? 49 : 30) &&
         mouseY < this.y + (this.tileType == tilesType.VERTICAL ? 49 : 30)) {
        console.log(this.id);
        if(this.hasCard && displayingCard == null) {
          displayingCard = this.card;
        } 
      }
    }
    
    if(!this.hasCard || this.tileType == 0) return;
    if(this.tileType == 1) {
       if(mouseX > this.x - 49 && mouseX < this.x + 49 &&
          mouseY > this.y - 49 && mouseY < this.y + 49) {
         //show card
       }
    }
  }
  
  updateAction() {
    if(!this.hasCard) return;
    this.action = async (aPlayer) => {
      displayingCard = this.card;
      propertyPending = true;
      if(this.card.ownedBy == aPlayer) {
        //TODO color set ask buy house?
        propertyPending = false;
      }
      if(this.card.ownedBy != 0) {
        if(this.card.mortgaged) {
          nextTurn();
          return;
        }
        if(this.card.group == colorGroup.UTILITY) {
          utilityRoll = true;
          await new Promise((resolve, reject) => {
            waitFor(() => !utilityRoll, resolve);
          });
        } else if(this.card.group == colorGroup.RAILROAD) {
          aPlayer.money -= 25 * pow(2, this.card.ownedBy.cards.railroads.length);
          this.card.ownedBy.money += 25 * pow(2, this.card.ownedBy.cards.railroads.length);
        } else {
          //TODO bankrupt again
          aPlayer.money -= this.card.incomes[this.card.houses];
          this.card.ownedBy.money += this.card.incomes[this.card.houses];
        }
        nextTurn();
        return;
      }
      askBuy = true;
      await new Promise((resolve, reject) => {
        waitFor(() => !propertyPending, resolve);
      });
      nextTurn();
    }
  }
}

class Player {
  constructor(id) {
    this.id = id; //0-3: 0 red, 1 blue, 2 yellow, 3 green
    if(id < 0 || id > 3) {
      console.log("you messed up your player id lmao");
      return;
    }
    this.money = 1500;
    switch(id) {
      case 0:
        this.color = colorObj(255, 69, 69);
        break;
      case 1:
        this.color = colorObj(69, 69, 255);
        break;
      case 2:
        this.color = colorObj(255, 255, 69);
        break;
      case 3:
        this.color = colorObj(69, 255, 69);
        break;
    }
    this.tile = 0;
    this.inJail = false;
    this.jailCounter = 0;
    this.cards = {
      properties: [],
      utilities: [],
      railroads: []
    };
    this.chanceJail = false;
    this.chestJail = false;
  }
  
  render(thisTurn/* boolean that states whether the current player is on their turn */) {
    fill(this.color.r, this.color.g, this.color.b, 150);
    stroke(thisTurn ? 255 : 0);
    strokeWeight(thisTurn ? 5 : 1);
    this.tile %= 40;
    if(this.inJail) {
      this.tile = 10;
    }
    let tcurrentTile = tiles[this.tile];
    if(this.tile != 10) {
      circle(tcurrentTile.x + (this.id % 2 == 1 ? 15 : -15), tcurrentTile.y + (this.id > 1 ? 15 : -15), thisTurn ? 30 : 20);
    } else {
      if(this.inJail) {
        circle(tcurrentTile.x + (this.id % 2 == 1 ? 30 : 0), tcurrentTile.y + (this.id > 1 ? 0 : -30), thisTurn ? 30 : 20);
      } else {
        switch(this.id) {
          case 0:
            circle(tcurrentTile.x - 35, tcurrentTile.y - 30, thisTurn ? 30 : 20);
            break;
          case 1:
            circle(tcurrentTile.x - 35, tcurrentTile.y + 10, thisTurn ? 30 : 20);
            break;
          case 2:
            circle(tcurrentTile.x - 10, tcurrentTile.y + 35, thisTurn ? 30 : 20);
            break;
          case 3:
            circle(tcurrentTile.x + 30, tcurrentTile.y + 35, thisTurn ? 30 : 20);
            break;
        }
      }
    }
  }
}
  
function colorObj(tr, tg, tb) {
  return {r: tr, g: tg, b: tb};
}

function objColor(obj) {
  return color(obj.r, obj.g, obj.b);
}

function colorGroupId(id) {
  for(let cg in colorGroup) {
    if(id == colorGroup[cg].id) {
      return colorGroup[cg];
    }
  }
  return -1;
}

function nextTurn() {
  tempDelay += 200;
  setTimeout(() => {
    isRolling = false;
  }, tempDelay);
}

function waitFor(condition, f) {
  setTimeout(() => {
    if(condition()) {
      f();
    } else {
      console.log("awaiting...");
      waitFor(condition, f);
    }
  }, 25);
}

function inRect(x, y, w, h) {
  return mouseX > x - w / 2 && mouseX < x + w / 2 &&
         mouseY > y - h / 2 && mouseY < y + w / 2
}

function getPropertyAction(type) {
  if(type.id == null|| type.id < 0 || type > colorGroup.RAILROAD) {
    console.log("Invalid type for getPropertyAction(type)");
    return;
  }
  return (aPlayer, pcard) => {
    if(!(aPlayer instanceof Player && pcard instanceof PropertyCard)) {
      console.log("Invalid inputs in getPropertyAction() output");
      return;
    }
    if(pcard.ownedBy == aPlayer || pcard.mortgaged) {
      return () => {
        //TODO: if is owned by aPlayer && not mortgaged && owns whole group && is street type, then ask to buy house/hotel
      };
    }
    if(pcard.ownedBy == 0) {
      //TODO: prompt player if want to buy
      return () => {
        
      };
    }
    switch(type) {
      //TODO: implement ask to pay income
      case cardType.PROPERTY.UTILITY:
        break;
      case cardType.PROPERTY.RAILROAD:
        break;
      default: 
        break;
    }
  }
}

async function rollDice(r1, r2) {
  dices = [r1, r2];
  askBuy = false;
  isRolling = true;
  tempSum = dices[0] + dices[1];
  console.log(dices[0] + " + " + dices[1] + " = Your roll was: " + tempSum);
  if(utilityRoll) {
    //TODO bankrupt implemetnt
    tempDelay += 200;
    setTimeout(() => {
      console.log(tiles[players[currentPlayer].tile].card);
      let bothu = (tiles[players[currentPlayer].tile].card.ownedBy.cards.utilities.length) == 2;
      players[currentPlayer].money -= tempSum * (bothu ? 10 : 4);
      tiles[players[currentPlayer].tile].card.ownedBy.money += tempSum * (bothu ? 10 : 4);
      utilityRoll = false;
    }, tempDelay);
    return;
  }
  if(dices[0] == dices[1] && doubles >= 2) {
    players[currentPlayer].inJail = true;
    players[currentPlayer].jailCounter++;
    currentPlayer++;
    currentPlayer %= numPlayers;
    doubles = 0;
    isRolling = false;
    return;
  }
  if(!(dices[0] == dices[1]) && players[currentPlayer].inJail) {
    players[currentPlayer].jailCounter++;
    if(players[currentPlayer].jailCounter > 3) return;
    currentPlayer++;
    currentPlayer %= numPlayers;
    doubles = 0;
    isRolling = false;
    return;
  }
  if(dices[0] == dices[1] && players[currentPlayer].inJail) {
    tempDelay = 0;

    for(let i = 0; i < tempSum; i++) {
      tempDelay += 200;
      setTimeout(() => {
        players[currentPlayer].inJail = false;
        players[currentPlayer].jailCounter = 0;
        players[currentPlayer].tile++;
        players[currentPlayer].tile %= 40;
      }, tempDelay);
    }
    tempDelay += 200;
    setTimeout(() => {
      tiles[players[currentPlayer].tile].action(players[currentPlayer]);
    }, tempDelay);
    await new Promise((resolve, reject) => {
      waitFor(() => !isRolling, resolve);
    });
    currentPlayer++;
    currentPlayer %= numPlayers;
    
    return;
  }

  tempDelay = 0;
  let oldTile = players[currentPlayer].tile;

  for(let i = 0; i < tempSum; i++) {
    tempDelay += 200;
    setTimeout(() => {
      players[currentPlayer].tile++;
      players[currentPlayer].tile %= 40;
    }, tempDelay);
  }
  tempDelay += 200;
  setTimeout(() => {
    if(players[currentPlayer].tile < oldTile) players[currentPlayer].money += 200;
    tiles[players[currentPlayer].tile].action(players[currentPlayer]);
  }, tempDelay);
  await new Promise((resolve, reject) => {
    waitFor(() => !isRolling, resolve);
  });
  console.log("turn finished")
  if(dices[0] != dices[1]) {
    currentPlayer++;
    currentPlayer %= numPlayers;
    doubles = 0;
  } else {
    doubles++;
  }
}

function setup() {
  createCanvas(1150, 750);
  
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  
  boardImg = loadImage("res/board.jpg");
  rotateImg = loadImage("res/rotate.png");
  
  fonts.regular = loadFont("res/monopolyregular.ttf");
  fonts.bold = loadFont("res/monopolybold.ttf");
  fonts.inline = loadFont("res/monopolyinline.ttf");
  
  cards = {
    chance: [],
    chest: [],
    property: [],
    utility: [],
    railroad: []
  }
  
  //Chance
  {
    cards.chance.push(new ActionCard("chance01", cardType.CHANCE, "Advance to Boardwalk.", (aPlayer) => {
      aPlayer.tile = 39;
      tiles[aPlayer.tile].action(aPlayer);
    }));
    cards.chance.push(new ActionCard("chance02", cardType.CHANCE, "Advance to Go. (Collect $200)", (aPlayer) => {
      aPlayer.money += 200;
      aPlayer.tile = 0;
    }));
    cards.chance.push(new ActionCard("chance03", cardType.CHANCE, "Advance to Illinois Avenue. If you pass\nGo, collect $200.", (aPlayer) => {
      if(aPlayer.tile > 24) aPlayer.money += 200;
      aPlayer.tile = 24;
      tiles[aPlayer.tile].action(aPlayer);
    }));
    cards.chance.push(new ActionCard("chance04", cardType.CHANCE, "Advance to St. Charles Place. If you\npass Go, collect $200.", (aPlayer) => {
      if(aPlayer.tile > 11) aPlayer.money += 200;
      aPlayer.tile = 11;
      tiles[aPlayer.tile].action(aPlayer);
    }));
    cards.chance.push(new ActionCard("chance05", cardType.CHANCE, "Advance to the nearest Railroad. If\nunowned, you may buy it from the Bank.\nIf owned, pay the owner twice the rental\nto which they are otherwise entitled.", (aPlayer) => {
      aPlayer.tile = floor(aPlayer.tile / 10) + 5;
      tiles[aPlayer.tile].action(aPlayer);
    }));
    cards.chance.push(new ActionCard("chance06", cardType.CHANCE, "Advance to the nearest Utility. If unowned,\nyou may buy it from the Bank. If owned,\npay the owner 10 times the amount of\nthe dice value rolled.", (aPlayer) => {
      if(aPlayer.tile >= 22) {
        aPlayer.tile = 28;
      } else {
        aPlayer.tile = 12;
      }
      tiles[aPlayer.tile].action(aPlayer);
    }));
    cards.chance.push(new ActionCard("chance07", cardType.CHANCE, "Bank pays you $50.", (aPlayer) => {
      aPlayer.money += 50;
    }));
    cards.chance.push(new ActionCard("chance08", cardType.CHANCE, "Get Out of Jail Free", (aPlayer) => {
      aPlayer.chanceJail = true;
      doubles = 0;
    }));
    cards.chance.push(new ActionCard("chance09", cardType.CHANCE, "Go back three spaces.", (aPlayer) => {
      tempDelay = 0;
      for(let i = 0; i < 3; i++) {
        setTimeout(() => {
          aPlayer.tile--;
        }, tempDelay);
        tempDelay += 100;
      }
    }));
    cards.chance.push(new ActionCard("chance10", cardType.CHANCE, "Go directly to jail, do not collect $200 if\nyou pass Go.", (aPlayer) => {
      aPlayer.inJail = true;
      aPlayer.jailCounter++;
    }));
    cards.chance.push(new ActionCard("chance11", cardType.CHANCE, "Make general repairs on all your property.\nFor each house pay $25. For each hotel\npay $100.", (aPlayer) => {
      //TODO: IMPLEMENT WHEN PROPERTIES WORK
    }));
    cards.chance.push(new ActionCard("chance12", cardType.CHANCE, "Speeding fine $15.", (aPlayer) => {
      //TODO: SEE IF MONEY IS TOO LOW??
      aPlayer.money -= 15;
    }));
    cards.chance.push(new ActionCard("chance13", cardType.CHANCE, "Take a trip to reading railroad. If you pass\nGo, collect $200.", (aPlayer) => {
      aPlayer.money += 200;
      aPlayer.tile = 5;
    }));
    cards.chance.push(new ActionCard("chance14", cardType.CHANCE, "You have been elected chairman of the\nboard. Pay each player $50.", (aPlayer) => {
      for(let i = 0; i < numPlayers; i++) {
        players[i].money += 50;
      }
      aPlayer.money -= 50 * numPlayers;
    }));
    cards.chance.push(new ActionCard("chance15", cardType.CHANCE, "Your building loan matures.\nCollect $150.", (aPlayer) => {
      aPlayer.money += 150;
    }));
  }
  
  //Chest
  {
    cards.chest.push(new ActionCard("chest01", cardType.CHEST, "Advance to Go. (Collect $200)", (aPlayer) => {
      aPlayer.money += 200;
      aPlayer.tile = 0;
    }));
    cards.chest.push(new ActionCard("chest02", cardType.CHEST, "Bank error in your favor. Collect $200.", (aPlayer) => {
      aPlayer.money += 200;
    }));
    cards.chest.push(new ActionCard("chest03", cardType.CHEST, "Doctor's fee. Pay $50.", (aPlayer) => {
      aPlayer.money -= 50;
    }));
    cards.chest.push(new ActionCard("chest04", cardType.CHEST, "From sale of stock you recieve $50.", (aPlayer) => {
      aPlayer.money += 50;
    }));
    cards.chest.push(new ActionCard("chest05", cardType.CHEST, "Get Out of Jail Free", (aPlayer) => {
      aPlayer.chestJail = true;
    }));
    cards.chest.push(new ActionCard("chest06", cardType.CHEST, "Go directly to jail, do not collect $200 if\nyou pass Go.", (aPlayer) => {
      aPlayer.inJail = true;
      aPlayer.jailCounter++;
    }));
    cards.chest.push(new ActionCard("chest07", cardType.CHEST, "Holiday fund matures. Recieve $100.", (aPlayer) => {
      aPlayer.money += 100;
    }));
    cards.chest.push(new ActionCard("chest08", cardType.CHEST, "Income tax refund. Collect $20.", (aPlayer) => {
      aPlayer.money += 20;
    }));
    cards.chest.push(new ActionCard("chest09", cardType.CHEST, "It's your birthday. Collect $10 from each\nplayer.", (aPlayer) => {
      //TODO, fix if it's not so simple with bankruptcy
      for(let i = 0; i < numPlayers; i++) {
        players[i].money -= 10;
      }
      aPlayer.money += 10 * numPlayers;
    }));
    cards.chest.push(new ActionCard("chest10", cardType.CHEST, "Life insurance matures. Collect $100.", (aPlayer) => {
      aPlayer.money += 100;
    }));
    cards.chest.push(new ActionCard("chest11", cardType.CHEST, "Pay hospital fees for $100.", (aPlayer) => {
      aPlayer.money -= 100;
    }));
    cards.chest.push(new ActionCard("chest12", cardType.CHEST, "Pay school fees for $50.", (aPlayer) => {
      aPlayer.money -= 50;
    }));
    cards.chest.push(new ActionCard("chest13", cardType.CHEST, "Recieve $25 consultancy fee.", (aPlayer) => {
      aPlayer.money += 25;  
    }));
    cards.chest.push(new ActionCard("chest14", cardType.CHEST, "You are assessed for street repairs. Pay\n$40 per house, $115 per hotel.", (aPlayer) => {
      //TODO property stuff
    }));
    cards.chest.push(new ActionCard("chest15", cardType.CHEST, "You have won second place in a beauty\ncontest. Collect $10.", (aPlayer) => {
      aPlayer.money += 10;
    }));
    cards.chest.push(new ActionCard("chest16", cardType.CHEST, "You inherit $100.", (aPlayer) => {
      aPlayer.money += 100;
    })); 
  }
  
  //Streets
  {
    cards.property.push(new PropertyCard("MEDITERRANEAN\nAVENUE", colorGroup.BROWN, {
      price: 60,
      house: 50,
      hotel: 50,
      incomes: [2, 10, 30, 90, 160, 250]
    }));
    cards.property.push(new PropertyCard("BALTIC AVENUE", colorGroup.BROWN, {
      price: 60,
      house: 50,
      hotel: 50,
      incomes: [4, 20, 60, 180, 320, 450]
    }));
    
    cards.property.push(new PropertyCard("ORIENTAL AVENUE", colorGroup.LIGHT_BLUE, {
      price: 100,
      house: 50,
      hotel: 50,
      incomes: [6, 30, 90, 270, 400, 550]
    }));
    cards.property.push(new PropertyCard("VERMONT AVENUE", colorGroup.LIGHT_BLUE, {
      price: 100,
      house: 50,
      hotel: 50,
      incomes: [6, 30, 90, 270, 400, 550]
    }));
    cards.property.push(new PropertyCard("CONNECTICUT\nAVENUE", colorGroup.LIGHT_BLUE, {
      price: 120,
      house: 50,
      hotel: 50,
      incomes: [8, 40, 100, 300, 450, 600]
    }));
    
    cards.property.push(new PropertyCard("ST. CHARLES\nPLACE", colorGroup.PINK, {
      price: 140,
      house: 100,
      hotel: 100,
      incomes: [10, 50, 150, 450, 625, 750]
    }));
    cards.property.push(new PropertyCard("STATES AVENUE", colorGroup.PINK, {
      price: 140,
      house: 50,
      hotel: 100,
      incomes: [10, 50, 150, 450, 625, 750]
    }));
    cards.property.push(new PropertyCard("VIRGINIA AVENUE", colorGroup.PINK, {
      price: 160,
      house: 100,
      hotel: 100,
      incomes: [12, 60, 180, 500, 700, 900]
    }));
    
    cards.property.push(new PropertyCard("ST. JAMES PLACE", colorGroup.ORANGE, {
      price: 180,
      house: 100,
      hotel: 100,
      incomes: [14, 70, 200, 550, 750, 950]
    }));
    cards.property.push(new PropertyCard("TENNESEE\nAVENUE", colorGroup.ORANGE, {
      price: 180,
      house: 100,
      hotel: 100,
      incomes: [14, 70, 200, 550, 750, 950]
    }));
    cards.property.push(new PropertyCard("NEW YORK\nAVENUE", colorGroup.ORANGE, {
      price: 200,
      house: 100,
      hotel: 100,
      incomes: [16, 80, 220, 600, 800, 1000]
    }));
    
    cards.property.push(new PropertyCard("KENTUCKY\nAVENUE", colorGroup.RED, {
      price: 220,
      house: 150,
      hotel: 150,
      incomes: [18, 90, 250, 700, 875, 1050]
    }));
    cards.property.push(new PropertyCard("INDIANA AVENUE", colorGroup.RED, {
      price: 220,
      house: 150,
      hotel: 150,
      incomes: [18, 90, 250, 700, 875, 1050]
    }));
    cards.property.push(new PropertyCard("ILLINOIS AVENUE", colorGroup.RED, {
      price: 240,
      house: 150,
      hotel: 150,
      incomes: [20, 100, 300, 750, 925, 1100]
    }));
    
    cards.property.push(new PropertyCard("ATLANTIC AVENUE", colorGroup.YELLOW, {
      price: 260,
      house: 150,
      hotel: 150,
      incomes: [22, 110, 330, 800, 975, 1150]
    }));
    cards.property.push(new PropertyCard("VENTNOR AVENUE", colorGroup.YELLOW, {
      price: 260,
      house: 150,
      hotel: 150,
      incomes: [22, 110, 330, 800, 975, 1150]
    }));
    cards.property.push(new PropertyCard("MARVIN GARDENS", colorGroup.YELLOW, {
      price: 280,
      house: 150,
      hotel: 150,
      incomes: [24, 120, 360, 850, 1025, 1200]
    }));
    
    cards.property.push(new PropertyCard("PACIFIC AVENUE", colorGroup.GREEN, {
      price: 300,
      house: 200,
      hotel: 200,
      incomes: [26, 130, 390, 900, 1100, 1275]
    }));
    cards.property.push(new PropertyCard("NORTH CAROLINA\nAVENUE", colorGroup.GREEN, {
      price: 300,
      house: 200,
      hotel: 200,
      incomes: [26, 130, 390, 900, 1100, 1275]
    }));
    cards.property.push(new PropertyCard("PENNSYLVANIA\nAVENUE", colorGroup.GREEN, {
      price: 320,
      house: 200,
      hotel: 200,
      incomes: [28, 150, 450, 1000, 1200, 1400]
    }));
    
    cards.property.push(new PropertyCard("PARK PLACE", colorGroup.BLUE, {
      price: 350,
      house: 200,
      hotel: 200,
      incomes: [35, 175, 500, 1100, 1300, 1500]
    }));
    cards.property.push(new PropertyCard("BOARDWALK", colorGroup.BLUE, {
      price: 400,
      house: 200,
      hotel: 200,
      incomes: [50, 200, 600, 1400, 1700, 2000]
    }));
  }
  
  //Railroad and Utility
  {
    cards.utility.push(new PropertyCard("ELECTRIC COMPANY", colorGroup.UTILITY));
    cards.utility.push(new PropertyCard("WATER WORKS", colorGroup.UTILITY));
    
    cards.railroad.push(new PropertyCard("READING RAILROAD", colorGroup.RAILROAD));    
    cards.railroad.push(new PropertyCard("PENNSYLVANIA\nRAILROAD", colorGroup.RAILROAD));    
    cards.railroad.push(new PropertyCard("B. & O. RAILROAD", colorGroup.RAILROAD));    
    cards.railroad.push(new PropertyCard("SHORT LINE", colorGroup.RAILROAD));
  }
  
  //Tiles
  {
    //Go tile
    tiles.push(new Tile(0, tilesType.CORNER, 701, 701, false, player => {
      nextTurn();
    }));
    for(let i = 1; i < 10; i++) {
      tiles.push(new Tile(i, tilesType.VERTICAL, 621 - 61.5 * (i - 1), 701, false, player => {
        nextTurn();
      }));
    }
    //1-9 actions + hasCard
    {
      tiles[1].hasCard = true;
      tiles[1].card = cards.property[0];
      tiles[1].updateAction();
      tiles[2].action = async function(player) {
        needsChest = true;
        await new Promise((resolve, reject) => {
          waitFor(() => !needsChest, resolve);
        });
        displayingCard.action(player);
        console.log("chest drawn");
        nextTurn();
      }
      tiles[3].hasCard = true;
      tiles[3].card = cards.property[1];
      tiles[3].updateAction();
      tiles[4].action = async function(player) {
        player.money -= 200;
        tempDelay += 200;
        nextTurn();
      }
      tiles[5].hasCard = true;
      tiles[5].card = cards.railroad[0];
      tiles[5].updateAction();
      tiles[6].hasCard = true;
      tiles[6].card = cards.property[2];
      tiles[6].updateAction();
      tiles[7].action = async function(player) {
        needsChance = true;
        await new Promise((resolve, reject) => {
          waitFor(() => !needsChance, resolve);
        });
        displayingCard.action(player);
        console.log("chance drawn");
        if(!(displayingCard == cards.chance[0] ||
             displayingCard == cards.chance[1] ||
             displayingCard == cards.chance[2] ||
             displayingCard == cards.chance[3] ||
             displayingCard == cards.chance[4] ||
             displayingCard == cards.chance[5] ||
             displayingCard == cards.chance[9])) nextTurn();
      }
      tiles[8].hasCard = true;
      tiles[8].card = cards.property[3];
      tiles[8].updateAction();
      tiles[9].hasCard = true;
      tiles[9].card = cards.property[4];
      tiles[9].updateAction();
    }
    //Jail tile
    tiles.push(new Tile(10, tilesType.CORNER, 49, 701, false, player => {
      nextTurn();
    }));
    for(let i = 11; i < 20; i++) {
      tiles.push(new Tile(i, tilesType.HORIZONTAL, 49, 621 - 61.5 * (i - 11), false, player => {
        nextTurn();
      }));
    }
    //11-19 actions + hasCard
    {
      tiles[11].hasCard = true;
      tiles[11].card = cards.property[5];
      tiles[11].updateAction();
      tiles[12].hasCard = true;
      tiles[12].card = cards.utility[0];
      tiles[12].updateAction();
      tiles[13].hasCard = true;
      tiles[13].card = cards.property[6];
      tiles[13].updateAction();
      tiles[14].hasCard = true;
      tiles[14].card = cards.property[7];
      tiles[14].updateAction();
      tiles[15].hasCard = true;
      tiles[15].card = cards.railroad[1];
      tiles[15].updateAction();
      tiles[16].hasCard = true;
      tiles[16].card = cards.property[8];
      tiles[16].updateAction();
      tiles[17].action = async function(player) {
        needsChest = true;
        await new Promise((resolve, reject) => {
          waitFor(() => !needsChest, resolve);
        });
        displayingCard.action(player);
        console.log("chest drawn");
        nextTurn();
      }
      tiles[18].hasCard = true;
      tiles[18].card = cards.property[9];
      tiles[18].updateAction();
      tiles[19].hasCard = true;
      tiles[19].card = cards.property[10];
      tiles[19].updateAction();
    }
    //Free parking tile
    tiles.push(new Tile(20, tilesType.CORNER, 49, 49, false, player => {
      nextTurn();
    }));
    for(let i = 21; i < 30; i++) {
      tiles.push(new Tile(i, tilesType.VERTICAL, 129 + 61.5 * (i - 21), 49, false, player => {
        nextTurn();
      }));
    }
    //21-29 actions + hasCard
    {
      tiles[21].hasCard = true;
      tiles[21].card = cards.property[11];
      tiles[21].updateAction();
      tiles[22].action = async function(player) {
        needsChance = true;
        await new Promise((resolve, reject) => {
          waitFor(() => !needsChance, resolve);
        });
        displayingCard.action(player);
        console.log("chance drawn");
        if(!(displayingCard == cards.chance[0] ||
             displayingCard == cards.chance[1] ||
             displayingCard == cards.chance[2] ||
             displayingCard == cards.chance[3] ||
             displayingCard == cards.chance[4] ||
             displayingCard == cards.chance[5] ||
             displayingCard == cards.chance[9])) nextTurn();
      }
      tiles[23].hasCard = true;
      tiles[23].card = cards.property[12];
      tiles[23].updateAction();
      tiles[24].hasCard = true;
      tiles[24].card = cards.property[13];
      tiles[24].updateAction();
      tiles[25].hasCard = true;
      tiles[25].card = cards.railroad[2];
      tiles[25].updateAction();
      tiles[26].hasCard = true;
      tiles[26].card = cards.property[14];
      tiles[26].updateAction();
      tiles[27].hasCard = true;
      tiles[27].card = cards.property[15];
      tiles[27].updateAction();
      tiles[28].hasCard = true;
      tiles[28].card = cards.utility[1];
      tiles[28].updateAction();
      tiles[29].hasCard = true;
      tiles[29].card = cards.property[16];
      tiles[29].updateAction();
    }
    //Go to jail tile
    tiles.push(new Tile(30, tilesType.CORNER, 701, 49, false, player => {
      player.inJail = true;
      nextTurn();
    }));
    for(let i = 31; i < 40; i++) {
      tiles.push(new Tile(i, tilesType.HORIZONTAL, 701, 129 + 61.5 * (i - 31), false, player => {
        nextTurn();
      }));
    }
    //31-39 actions + hasCard
    {
      tiles[31].hasCard = true;
      tiles[31].card = cards.property[17];
      tiles[31].updateAction();
      tiles[32].hasCard = true;
      tiles[32].card = cards.property[18];
      tiles[32].updateAction();
      tiles[33].action = async function(player) {
        needsChest = true;
        await new Promise((resolve, reject) => {
          waitFor(() => !needsChest, resolve);
        });
        displayingCard.action(player);
        console.log("chest drawn");
        nextTurn();
      }
      tiles[34].hasCard = true;
      tiles[34].card = cards.property[19];
      tiles[34].updateAction();
      tiles[35].hasCard = true;
      tiles[35].card = cards.railroad[3];
      tiles[35].updateAction();
      tiles[36].action = async function(player) {
        needsChance = true;
        await new Promise((resolve, reject) => {
          waitFor(() => !needsChance, resolve);
        });
        displayingCard.action(player);
        console.log("chance drawn");
        if(!(displayingCard == cards.chance[0] ||
             displayingCard == cards.chance[1] ||
             displayingCard == cards.chance[2] ||
             displayingCard == cards.chance[3] ||
             displayingCard == cards.chance[4] ||
             displayingCard == cards.chance[5] ||
             displayingCard == cards.chance[9])) nextTurn();
      }
      tiles[37].hasCard = true;
      tiles[37].card = cards.property[20];
      tiles[37].updateAction();
      tiles[38].action = async function(player) {
        player.money -= 100;
        tempDelay += 100;
        nextTurn();
      }
      tiles[39].hasCard = true;
      tiles[39].card = cards.property[21];
      tiles[39].updateAction();
    }
  }
  
  //Players
  for(let i = 0; i < numPlayers; i++) {
    players[i] = new Player(i);
  }
}

function draw() {
  background(136, 235, 141);
  image(boardImg, 0, 0, 750, 750);
  //image(rotateImg, 350, 346, 50, 50);
  
  if(displayingCard != null) {
    displayingCard.render();
  }
  
  //dice render
  {
    textFont(fonts.inline);
    textSize(24);
    fill((isRolling && !utilityRoll) ? 100 : 255, 100, 100);
    stroke(0);
    rect(375, 500, 150, 40);
    fill(0);
    text("Roll", 375, 498);

    fill(255);
    rect(340, 550, 40, 40, 10);
    rect(410, 550, 40, 40, 10);
    fill(0);
    if(dices[0] == 1 || dices[0] == 3 || dices[0] == 5) {
      circle(340, 550, 7);
    }
    if(dices[0] > 3) {
      circle(330, 540, 7);
      circle(350, 560, 7);
    }
    if(dices[0] != 1) {
      circle(330, 560, 7);
      circle(350, 540, 7);
    }
    if(dices[0] == 6) {
      circle(330, 550, 7);
      circle(350, 550, 7);
    }

    if(dices[1] == 1 || dices[1] == 3 || dices[1] == 5) {
      circle(410, 550, 7);
    }
    if(dices[1] > 3) {
      circle(400, 540, 7);
      circle(420, 560, 7);
    }
    if(dices[1] != 1) {
      circle(400, 560, 7);
      circle(420, 540, 7);
    }
    if(dices[1] == 6) {
      circle(400, 550, 7);
      circle(420, 550, 7);
    }
  }
  
  for(let i = numPlayers - 1; i > -1; i--) {
    players[i].render(currentPlayer == i);
  }
  players[currentPlayer].render(true);
  
  stroke(0);
  strokeWeight(1);
  if(numPlayers != 2) line(750, 375, 1150, 375);
  line(950, 0, 950, 750);
  
  //player side
  {
    push();
    textFont(fonts.bold);
    textAlign(LEFT, CENTER);
    textSize(24);

    fill(255, 69, 69);
    text("Player 1:", 760, 20);
    fill(0);
    text("$" + players[0].money, 845, 20);
    noStroke();
    for(let i = 0; i < 8; i++) {
      fill(objColor(colorGroupId(i).color));
      rect(850, 60 + i * 25, 199, 25);
    }
    fill(0);
    rect(850, 272.5, 199, 50);
    fill(255);
    rect(850, 310, 199, 25);

    let tempPropCounter = 0;
    stroke(0);
    if(cards.property[tempPropCounter].ownedBy == players[0]) {
      fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
      rect(800, 60, 90, 15);
    }
    tempPropCounter++;
    if(cards.property[tempPropCounter].ownedBy == players[0]) {
      fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
      rect(900, 60, 90, 15);
    }
    tempPropCounter++;
    for(let i = 0; i < 6; i++) {
      if(cards.property[tempPropCounter].ownedBy == players[0]) {
        fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
        rect(783, 85 + i * 25, 60, 15);
      }
      tempPropCounter++;
      if(cards.property[tempPropCounter].ownedBy == players[0]) {
        fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
        rect(850, 85 + i * 25, 60, 15);
      }
      tempPropCounter++;
      if(cards.property[tempPropCounter].ownedBy == players[0]) {
        fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
        rect(917, 85 + i * 25, 60, 15);
      }
      tempPropCounter++;
    }
    for(let i = 0; i < 4; i++) {
      if(i == 0) {
        if(cards.property[tempPropCounter].ownedBy == players[0]) {
          fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
          rect(800, 235 + i * 25, 90, 15);
        }
        tempPropCounter++;
        if(cards.property[tempPropCounter].ownedBy == players[0]) {
          fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
          rect(900, 235 + i * 25, 90, 15);
        }
        tempPropCounter++;
      } else if(i < 3) {
        if(cards.railroad[tempPropCounter].ownedBy == players[0]) {
          fill(cards.railroad[tempPropCounter].mortgaged ? 100 : 255);
          rect(800, 235 + i * 25, 90, 15);
        }
        tempPropCounter++;
        if(cards.railroad[tempPropCounter].ownedBy == players[0]) {
          fill(cards.railroad[tempPropCounter].mortgaged ? 100 : 255);
          rect(900, 235 + i * 25, 90, 15);
        }
        tempPropCounter++;
      } else {
        if(cards.utility[tempPropCounter].ownedBy == players[0]) {
          fill(cards.utility[tempPropCounter].mortgaged ? 100 : 255);
          rect(800, 235 + i * 25, 90, 15);
        }
        tempPropCounter++;
        if(cards.utility[tempPropCounter].ownedBy == players[0]) {
          fill(cards.utility[tempPropCounter].mortgaged ? 100 : 255);
          rect(900, 235 + i * 25, 90, 15);
        }
        tempPropCounter++;
      }
      if(i != 1) tempPropCounter = 0;
    }
    stroke(0);

    fill(69, 69, 255);
    text("Player 2:", 960, 20);
    fill(0);
    text("$" + players[1].money, 1045, 20);
    noStroke();
    for(let i = 0; i < 8; i++) {
      fill(objColor(colorGroupId(i).color));
      rect(1050, 60 + i * 25, 199, 25);
    }
    fill(0);
    rect(1050, 272.5, 199, 50);
    fill(255);
    rect(1050, 310, 199, 25);
    stroke(0);
    stroke(0);
    
    if(cards.property[tempPropCounter].ownedBy == players[1]) {
      fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
      rect(800 + 200, 60, 90, 15);
    }
    tempPropCounter++;
    if(cards.property[tempPropCounter].ownedBy == players[1]) {
      fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
      rect(900 + 200, 60, 90, 15);
    }
    tempPropCounter++;
    for(let i = 0; i < 6; i++) {
      if(cards.property[tempPropCounter].ownedBy == players[1]) {
        fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
        rect(783 + 200, 85 + i * 25, 60, 15);
      }
      tempPropCounter++;
      if(cards.property[tempPropCounter].ownedBy == players[1]) {
        fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
        rect(850 + 200, 85 + i * 25, 60, 15);
      }
      tempPropCounter++;
      if(cards.property[tempPropCounter].ownedBy == players[1]) {
        fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
        rect(917 + 200, 85 + i * 25, 60, 15);
      }
      tempPropCounter++;
    }
    for(let i = 0; i < 4; i++) {
      if(i == 0) {
        if(cards.property[tempPropCounter].ownedBy == players[1]) {
          fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
          rect(800 + 200, 235 + i * 25, 90, 15);
        }
        tempPropCounter++;
        if(cards.property[tempPropCounter].ownedBy == players[1]) {
          fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
          rect(900 + 200, 235 + i * 25, 90, 15);
        }
        tempPropCounter++;
      } else if(i < 3) {
        if(cards.railroad[tempPropCounter].ownedBy == players[1]) {
          fill(cards.railroad[tempPropCounter].mortgaged ? 100 : 255);
          rect(800 + 200, 235 + i * 25, 90, 15);
        }
        tempPropCounter++;
        if(cards.railroad[tempPropCounter].ownedBy == players[1]) {
          fill(cards.railroad[tempPropCounter].mortgaged ? 100 : 255);
          rect(900 + 200, 235 + i * 25, 90, 15);
        }
        tempPropCounter++;
      } else {
        if(cards.utility[tempPropCounter].ownedBy == players[1]) {
          fill(cards.utility[tempPropCounter].mortgaged ? 100 : 255);
          rect(800 + 200, 235 + i * 25, 90, 15);
        }
        tempPropCounter++;
        if(cards.utility[tempPropCounter].ownedBy == players[1]) {
          fill(cards.utility[tempPropCounter].mortgaged ? 100 : 255);
          rect(900 + 200, 235 + i * 25, 90, 15);
        }
        tempPropCounter++;
      }
      if(i != 1) tempPropCounter = 0;
    }
    stroke(0);

    if(numPlayers > 2) {
      fill(255, 255, 69);
      text("Player 3:", 760, 395);
      fill(0);
      text("$" + players[2].money, 845, 395);
      noStroke();
      for(let i = 0; i < 8; i++) {
        fill(objColor(colorGroupId(i).color));
        rect(850, 375 + 60 + i * 25, 199, 25);
      }
      fill(0);
      rect(850, 375 + 272.5, 199, 50);
      fill(255);
      rect(850, 375 + 310, 199, 25);
      
      stroke(0);
      if(cards.property[tempPropCounter].ownedBy == players[2]) {
        fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
        rect(800, 375 + 60, 90, 15);
      }
      tempPropCounter++;
      if(cards.property[tempPropCounter].ownedBy == players[2]) {
        fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
        rect(900, 375 + 60, 90, 15);
      }
      tempPropCounter++;
      for(let i = 0; i < 6; i++) {
        if(cards.property[tempPropCounter].ownedBy == players[2]) {
          fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
          rect(783, 375 + 85 + i * 25, 60, 15);
        }
        tempPropCounter++;
        if(cards.property[tempPropCounter].ownedBy == players[2]) {
          fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
          rect(850, 375 + 85 + i * 25, 60, 15);
        }
        tempPropCounter++;
        if(cards.property[tempPropCounter].ownedBy == players[2]) {
          fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
          rect(917, 375 + 85 + i * 25, 60, 15);
        }
        tempPropCounter++;
      }
      for(let i = 0; i < 4; i++) {
        if(i == 0) {
          if(cards.property[tempPropCounter].ownedBy == players[2]) {
            fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
            rect(800, 375 + 235 + i * 25, 90, 15);
          }
          tempPropCounter++;
          if(cards.property[tempPropCounter].ownedBy == players[2]) {
            fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
            rect(900, 375 + 235 + i * 25, 90, 15);
          }
          tempPropCounter++;
        } else if(i < 3) {
          if(cards.railroad[tempPropCounter].ownedBy == players[2]) {
            fill(cards.railroad[tempPropCounter].mortgaged ? 100 : 255);
            rect(800, 375 + 235 + i * 25, 90, 15);
          }
          tempPropCounter++;
          if(cards.railroad[tempPropCounter].ownedBy == players[2]) {
            fill(cards.railroad[tempPropCounter].mortgaged ? 100 : 255);
            rect(900, 375 + 235 + i * 25, 90, 15);
          }
          tempPropCounter++;
        } else {
          if(cards.utility[tempPropCounter].ownedBy == players[2]) {
            fill(cards.utility[tempPropCounter].mortgaged ? 100 : 255);
            rect(800, 375 + 235 + i * 25, 90, 15);
          }
          tempPropCounter++;
          if(cards.utility[tempPropCounter].ownedBy == players[2]) {
            fill(cards.utility[tempPropCounter].mortgaged ? 100 : 255);
            rect(900, 375 + 235 + i * 25, 90, 15);
          }
          tempPropCounter++;
        }
        if(i != 1) tempPropCounter = 0;
      }
      stroke(0);
      if(numPlayers > 3) {
        fill(69, 255, 69);
        text("Player 4:", 960, 395);
        fill(0);
        text("$" + players[3].money, 1045, 395);
        noStroke();
        for(let i = 0; i < 8; i++) {
          fill(objColor(colorGroupId(i).color));
          rect(1050, 375 + 60 + i * 25, 199, 25);
        }
        fill(0);
        rect(1050, 375 + 272.5, 199, 50);
        fill(255);
        rect(1050, 375 + 310, 199, 25);
        
        stroke(0);
        if(cards.property[tempPropCounter].ownedBy == players[3]) {
          fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
          rect(800 + 200, 375 + 60, 90, 15);
        }
        tempPropCounter++;
        if(cards.property[tempPropCounter].ownedBy == players[3]) {
          fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
          rect(900 + 200, 375 + 60, 90, 15);
        }
        tempPropCounter++;
        for(let i = 0; i < 6; i++) {
          if(cards.property[tempPropCounter].ownedBy == players[3]) {
            fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
            rect(783 + 200, 375 + 85 + i * 25, 60, 15);
          }
          tempPropCounter++;
          if(cards.property[tempPropCounter].ownedBy == players[3]) {
            fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
            rect(850 + 200, 375 + 85 + i * 25, 60, 15);
          }
          tempPropCounter++;
          if(cards.property[tempPropCounter].ownedBy == players[3]) {
            fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
            rect(917 + 200, 375 + 85 + i * 25, 60, 15);
          }
          tempPropCounter++;
        }
        for(let i = 0; i < 4; i++) {
          if(i == 0) {
            if(cards.property[tempPropCounter].ownedBy == players[3]) {
              fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
              rect(800 + 200, 375 + 235 + i * 25, 90, 15);
            }
            tempPropCounter++;
            if(cards.property[tempPropCounter].ownedBy == players[3]) {
              fill(cards.property[tempPropCounter].mortgaged ? 100 : 255);
              rect(900 + 200, 375 + 235 + i * 25, 90, 15);
            }
            tempPropCounter++;
          } else if(i < 3) {
            if(cards.railroad[tempPropCounter].ownedBy == players[3]) {
              fill(cards.railroad[tempPropCounter].mortgaged ? 100 : 255);
              rect(800 + 200, 375 + 235 + i * 25, 90, 15);
            }
            tempPropCounter++;
            if(cards.railroad[tempPropCounter].ownedBy == players[3]) {
              fill(cards.railroad[tempPropCounter].mortgaged ? 100 : 255);
              rect(900 + 200, 375 + 235 + i * 25, 90, 15);
            }
            tempPropCounter++;
          } else {
            if(cards.utility[tempPropCounter].ownedBy == players[3]) {
              fill(cards.utility[tempPropCounter].mortgaged ? 100 : 255);
              rect(800 + 200, 375 + 235 + i * 25, 90, 15);
            }
            tempPropCounter++;
            if(cards.utility[tempPropCounter].ownedBy == players[3]) {
              fill(cards.utility[tempPropCounter].mortgaged ? 100 : 255);
              rect(900 + 200, 375 + 235 + i * 25, 90, 15);
            }
            tempPropCounter++;
          }
          if(i != 1) tempPropCounter = 0;
        }
        stroke(0);
      }
    }
    pop();

    textFont(fonts.bold);
    fill(0);
    textSize(18);
    if(needsChance || needsChest) {
      text("Draw a " + (needsChance ? "chance card" : "community chest card"), 375, 150);
    }
    if(players[currentPlayer].inJail) {
      text("You are in jail, choose to\nroll a double to get out\npay $50, or use a\nGet Out of Jail Free\ncard by clicking on it.\nOn your third turn in jail,\nyou must get out through some method", 375, 180);
    }
  }
  //get out of jail stuff
  {
    textSize(10);
    if(players[0].chanceJail) {
      fill(255, 100, 0);
      rect(805, 350, 75, 25);
      fill(0);
      text("Get Out of Jail Free", 805, 350);
    }
    if(players[1].chanceJail) {
      fill(255, 100, 0);
      rect(1005, 350, 75, 25);
      fill(0);
      text("Get Out of Jail Free", 1005, 350);
    }
    if(players[2].chanceJail) {
      fill(255, 100, 0);
      rect(805, 725, 75, 25);
      fill(0);
      text("Get Out of Jail Free", 805, 725);
    }
    if(players[3].chanceJail) {
      fill(255, 100, 0);
      rect(1005, 725, 75, 25);
      fill(0);
      text("Get Out of Jail Free", 1005, 725);
    }

    if(players[0].chestJail) {
      fill(100, 120, 255);
      rect(895, 350, 75, 25);
      fill(0);
      text("Get Out of Jail Free", 895, 350);
    }
    if(players[1].chestJail) {
      fill(100, 120, 255);
      rect(1095, 350, 75, 25);
      fill(0);
      text("Get Out of Jail Free", 1095, 350);
    }
    if(players[2].chestJail) {
      fill(100, 120, 255);
      rect(895, 725, 75, 25);
      fill(0);
      text("Get Out of Jail Free", 895, 725);
    }
    if(players[3].chestJail) {
      fill(100, 120, 255);
      rect(1095, 725, 75, 25);
      fill(0);
      text("Get Out of Jail Free", 1095, 725);
    }

    if(players[currentPlayer].inJail && (!isRolling || players[currentPlayer].jailCounter > 3)) {
      fill(255, 100, 100);
      rect(550, 150, 100, 30);
      fill(0);
      textFont(fonts.inline);
      textSize(14);
      text("Pay $50 fine", 550, 149);
    }
  }
  
  //prop interact
  {
    if(askBuy) {
      textFont(fonts.inline);
      textSize(24);
      fill(players[currentPlayer].money < tiles[players[currentPlayer].tile].card.price ? 100 : 255, 100, 100);
      stroke(0);
      rect(337.5, 250, 75, 40);
      fill(0);
      text("Buy", 337.5, 248);
      fill(255, 100, 100);
      rect(407.5, 250, 75, 40);
      fill(0);
      text("Pass", 407.5, 248);
    }
  }
  
  //tile overlay
  /*
  fill(0, 0, 0, 200);
  stroke(0);
  strokeWeight(1);
  noStroke();
  
  rect(49, 49, 98, 98);
  rect(701, 49, 98, 98);
  rect(49, 701, 98, 98);
  rect(701, 701, 98, 98);
  //from corner offset 80
  //otherwise offset 61.5
  for(let i = 0; i < 9; i++) {
    rect(129 + 61.5 * i, 49, 60, 98);
  }
  for(let i = 0; i < 9; i++) {
    rect(49, 621 - 61.5 * i, 98, 60);
  }
  for(let i = 0; i < 9; i++) {
    rect(621 - 61.5 * i, 701, 60, 98);
  }
  for(let i = 0; i < 9; i++) {
    rect(701, 129 + 61.5 * i, 98, 60);
  }
  */
  
  
  //fill(255, 255, 255, 127);
  //chance triangles
  /*{
    triangle(750, 400, 750, 750, 400, 750);
    triangle(750, 275, 750, 750, 275, 750);
    triangle(0, 750, 660, 750, 0, 90);
    triangle(0, 750, 840, 750, 0, -90);
  }*/
  
  //chest triangles
  /*{
    triangle(750, -400, 750, 750, -400, 750);
    triangle(750, -280, 750, 750, -280, 750);
    triangle(0, 750, 660, 750, 0, 90);
    triangle(0, 750, 840, 750, 0, -90);
  }*/
}

function mouseClicked() {
  
  tiles.forEach(t => {
    t.checkInfo();
  });
  //chance
  if(((mouseX - 275) > (750 - mouseY)) && ((mouseX - 400) < (750 - mouseY)) &&
     ((mouseX + 90) > mouseY) && ((mouseX - 90) < mouseY) && needsChance) {
    let tempIndex = floor(random(0, cards.chance.length));
    let tempnojail = false;
    for(let i = 0; i < numPlayers; i++) {
      if(players[i].chanceJail) {
        tempnojail = true;
        break;
      }
    }
    while(tempnojail && tempIndex == 7) {
      tempIndex = floor(random(0, cards.chance.length));
    }
    displayingCard = cards.chance[tempIndex];
    needsChance = false;
  } else if(((mouseX + 400) > (750 - mouseY)) && ((mouseX + 280) < (750 - mouseY)) &&
     ((mouseX + 90) > mouseY) && ((mouseX - 90) < mouseY) && needsChest) {
    let tempIndex = floor(random(0, cards.chance.length));
    let tempnojail = false;
    for(let i = 0; i < numPlayers; i++) {
      if(players[i].chestJail) {
        tempnojail = true;
        break;
      }
    }
    while(tempnojail && tempIndex == 4) {
      tempIndex = floor(random(0, cards.chest.length));
    }
    displayingCard = cards.chest[tempIndex];
    needsChest = false;
  } else if(mouseX > 300 && mouseX < 450 &&
     mouseY > 480 && mouseY < 520 && (!isRolling || utilityRoll)) {
    rollDice(floor(random(1, 7)), floor(random(1, 7)));
    displayingCard = null;
  } else if(inRect(337.5, 250, 75, 40) && askBuy &&
            players[currentPlayer].money >= tiles[players[currentPlayer].tile].card.price) {
    askBuy = false;
    tiles[players[currentPlayer].tile].card.ownedBy = players[currentPlayer];
    players[currentPlayer].money -= tiles[players[currentPlayer].tile].card.price;
    if(tiles[players[currentPlayer].tile].card.group == colorGroup.UTILITY) {
      players[currentPlayer].cards.utilities.push(tiles[players[currentPlayer].tile].card);
    } else if(tiles[players[currentPlayer].tile].card.group == colorGroup.RAILROAD) {
      players[currentPlayer].cards.railroads.push(tiles[players[currentPlayer].tile].card);
    } else {
      players[currentPlayer].cards.properties.push(tiles[players[currentPlayer].tile].card);
    }
    propertyPending = false;
  } else if(inRect(407.5, 250, 75, 40) && askBuy) {
    askBuy = false;
    propertyPending = false;
  } else if(inRect(550, 150, 100, 30) && players[currentPlayer].inJail &&
            (!isRolling || players[currentPlayer].jailCounter > 3) &&
            players[currentPlayer].money >= 50) {
    players[currentPlayer].money -= 50;
    players[currentPlayer].inJail = false;
    players[currentPlayer].jailCounter = 0;
    isRolling = false;
  } else if(inRect(805, 350, 75, 25) && players[0].inJail && players[0].chanceJail &&
            players[0].jailCounter <= 4 && currentPlayer == 0) {
    players[0].chanceJail = false;
    players[0].inJail = false;
  } else if(inRect(1005, 350, 75, 25) && players[1].inJail && players[1].chanceJail &&
            players[1].jailCounter <= 4 && currentPlayer == 1) {
    players[1].chanceJail = false;
    players[1].inJail = false;
  } else if(inRect(805, 725, 75, 25) && players[2].inJail && players[2].chanceJail &&
            players[2].jailCounter <= 4 && currentPlayer == 2) {
    players[2].chanceJail = false;
    players[2].inJail = false;
  } else if(inRect(1005, 725, 75, 25) && players[3].inJail && players[3].chanceJail &&
            players[3].jailCounter <= 4 && currentPlayer == 3) {
    players[3].chanceJail = false;
    players[3].inJail = false;
  } else if(inRect(895, 350, 75, 25) && players[0].inJail && players[0].chestJail &&
            players[0].jailCounter <= 4 && currentPlayer == 0) {
    players[0].chestJail = false;
    players[0].inJail = false;
  } else if(inRect(1095, 350, 75, 25) && players[1].inJail && players[1].chestJail &&
            players[1].jailCounter <= 4 && currentPlayer == 1) {
    players[1].chestJail = false;
    players[1].inJail = false;
  } else if(inRect(895, 725, 75, 25) && players[2].inJail && players[2].chestJail &&
            players[2].jailCounter <= 4 && currentPlayer == 2) {
    players[2].chestJail = false;
    players[2].inJail = false;
  } else if(inRect(1095, 725, 75, 25) && players[3].inJail && players[3].chestJail &&
            players[3].jailCounter <= 4 && currentPlayer == 3) {
    players[3].chestJail = false;
    players[3].inJail = false;
  } else if(keyCode == 16 && keyIsDown) {
    keyCode = 0;
    displayingCard = null;
  }
  
  // console.log(mouseX);
  // console.log(mouseY);
}