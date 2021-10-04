import 'phaser';
import CreatePanel from '../build/CreatePanel.js';
import CreateModel from '../build/CreateModel.js';

class Test extends Phaser.Scene {
    constructor() {
        super({
            key: 'test'
        })

    }

    preload() {
        // Load db file
        this.load.text('db', '/assets/data/bopomofo.compress'); //讀取壓縮檔
    }

    create() {
        var model = CreateModel({ //將壓縮、解壓縮、query word/character等函數掛進model後，把壓縮檔解壓建立loki
            db: this.cache.text.get('db'),
        })

        var panel = CreatePanel(this)
            .setPosition(384, 667)
            .layout()

        console.log(`${panel.width}x${panel.height}`)

        // var word = model.words.queryRandomWord();
        var word = model.words.queryWord('什麼')[0]; //回傳一個new word class，由db和doc建成，能getCharacters

        //回傳一組new character class array，由db和doc建成，每個character有文字拼音JSON資料，能createQuestion
        var characters = word.getCharacters();
        var characterIndex = Phaser.Math.Between(0, characters.length - 1);
        var character = characters[characterIndex];//隨機取出詞裡的一個character
        var question = character.createQuestion(); //用這個character出題

        panel
            .on('submit', function (result) {
                console.log(result);
                console.log((question.verify(result)) ? 'Pass' : 'Fail');
            })
            .setTitle('2021教育部高頻字詞600注音練習')
            .setWord(characters)
            .setChoicesText(question.choices)
            .layout()
            .drawBounds(this.add.graphics(), 0xff0000)

        console.log(`${panel.width}x${panel.height}`)

        // Style question character
        var characterUI = panel.getCharacter(characterIndex);
        characterUI.setBopomofoVisible(false); // Or characterUI.setBopomofo()
        characterUI.getElement('character.text').setColor('chocolate');
    }

    update() { }
}

export default Test;