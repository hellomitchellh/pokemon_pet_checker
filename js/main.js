document.querySelector('button').addEventListener('click', getFetch)

function getFetch() {
    const choice = document.querySelector('input').value.replaceAll(' ', '-').replaceAll('.', '').toLowerCase()
    const url = `https://pokeapi.co/api/v2/pokemon/${choice}`

    fetch(url)
        .then(res => res.json()) //parse response as JSON
        .then(data => {
            console.log(data)
            const potentialPet = new PokeInfo (data.name, data.height, data.weight, data.types, data.sprites.other["official-artwork"].front_default, data.location_area_encounters)
            
            potentialPet.getTypes() //run actual method to parse types further
            potentialPet.isItHousePet() // run actual method to see if pet or not
            
            let decision = ''
            document.getElementById('locations').innerText = ''
            if (potentialPet.housepet) {
                decision = `This pokemon is small enough, light enough, and safe enough to be a good pet! You can find ${potentialPet.name} in the following location(s):`
                potentialPet.encounterInfo() // second fetch on extended class
            } else {
                decision = `This Pokemon would not be a good pet because ${potentialPet.reason.join(' and ')}.`
            }
            
            document.querySelector('h2').innerText = decision
            document.querySelector('img').src = potentialPet.image

        })
        .catch(err => {
            console.log(`error ${err}`)
        })
}


// create a Pokemon class with the characteristics we want with associated methods

class Poke {
    constructor(name, height, weight, types, image){
        this.name = name;
        this.height = height; //decimter, divide by 10 for cm
        this.weight = weight; //deciweigh, divid by 10 for 
        this.types = types; //need to parse further down
        this.image = image;
        this.housepet = true //yes or no if would be a good house-pet
        this.reason = [] //might have multiple reasons why
        this.typeList = [] //storage of parsed types
    }
    getTypes(){
        for (const property of this.types){
            this.typeList.push(property.type.name)
        }
    }
    weightToPounds(rawWeight){
        return Math.round((rawWeight / 4.536)*100)/100
    }
    heightToFeet(rawHeight) {
        return Math.round((rawHeight/3.048)*100)/100
    }
    isItHousePet(){
        //check weight, heigh, and types => this.housepet = true;
        const lbs = this.weightToPounds(this.weight) 
        if (lbs > 400) {
            this.reason.push(`it is too heavy at ${lbs} pounds`)
            this.housepet = false;
        }
        
        const feet = this.heightToFeet(this.height)
        if (feet > 7) {
            this.reason.push(`it is too tall at ${feet} feet`)
            this.housepet = false;
        }
        
        const badTypes = ['fire','electric','fighting','poison','psychic','ghost']
        
        if( badTypes.some( e => this.typeList.indexOf(e) >=0 )) {
            this.reason.push(`it is too dangerous`)
            this.housepet = false;
        }
    }
}


class PokeInfo extends Poke {
    constructor(name, height, weight, type, image, location){
        super(name, height, weight, type, image);
        this.locationURL = location;
        this.locationList = [];
        this.locationString = '';
    }
    encounterInfo(){
        fetch(this.locationURL)
            .then(res => res.json())
            .then(data => {
                console.log(data)
                for (const item of data) {
                    this.locationList.push(item.location_area.name)
                }
                let target = document.getElementById('locations')
                target.innerText = this.locationCleanup()
            })
            .catch(err => {
                console.log(`error ${err}`)
            })
    }
    locationCleanup(){
        const words = this.locationList.slice(0,5).join(', ').replaceAll('-', ' ').split(' ') //arbitrary picked 5 locations max
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].slice(1)
        }
        return words.join(' ')
    }
}