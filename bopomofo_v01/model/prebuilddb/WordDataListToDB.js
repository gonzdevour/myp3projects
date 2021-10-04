import ParseBopomofo from '../bopomofo/ParseBopomofo.js';
import { CharactersCollectionName, WordsCollectionName } from './Const.js';
import GetCharacterDoc from "./GetCharacterDoc.js";


var WordDataListToDB = function (wordDataList, db) {
    for (var i = 0, cnt = wordDataList.length; i < cnt; i++) {
        WordDataToDB(wordDataList[i], db);
    }
}

var WordDataToDB = function (wordData, db) { //傳入單條資料
    var word = wordData.word;
    var pinyins = wordData.pinyins; //[[p1],[p2],[p3],[p4]],[[q1],[q2],[q3],[q4]]的組合
    delete wordData.pinyins;
    var wordsCollection = db.getCollection(WordsCollectionName); //'words'
    var charactersCollection = db.getCollection(CharactersCollectionName); //'characters'

    var hasValidPinyin = false;
    wordData.pid = [];
    var characterDocs = [];
    for (var p = 0, pcnt = pinyins.length; p < pcnt; p++) { //對每組破音
        if (!IsValidPinyin(pinyins[p])) { //檢查[[p1],[p2],[p3],[p4]],[[q1],[q2],[q3],[q4]]，無值則跳過
            continue;
        }


        var characterDocIDList = [];//等一下要做目前這個詞在db中的字表索引
        wordData.pid.push(characterDocIDList);
        for (var c = 0, ccnt = word.length; c < ccnt; c++) { //對詞裡的每個字
            var pinyin = pinyins[p][c]; //pinyins[破音組別(p or q)][第幾個字] → 取出這個字的拼音字串
            if (pinyin === '') { //如果這個字沒有填入拼音，即屬於破音字
                pinyin = pinyins[0][c]; //把破音詞無值的那個字用第一組詞的該字音取代
            }

            var characterData = ParseBopomofo(pinyin, { character: word.charAt(c) }) 
            //將拼音字串轉JSON，JSON內含character, initials, media, vowel, tone五個值

            var characterDoc = GetCharacterDoc(characterData, charactersCollection);
            //在character db collection中搜尋並添加目前這組拼音JSON，並回傳添加後的該條doc

            characterDocIDList.push(characterDoc.$loki); //將回傳後的doc id填入字的id list，做出字表索引
            hasValidPinyin = true; //只要任一字有拼音，就可確定這個詞有拼音了
            if (characterDocs.indexOf(characterDoc) === -1) { //建立目前這個詞的字表array
                characterDocs.push(characterDoc);
            }
        }
    }

    if (hasValidPinyin) {
        var wordDoc = wordsCollection.insert(wordData); //如果這個詞有拼音，就在word db collection添加這個詞並回傳doc
        var wordDocId = wordDoc.$loki; //找出詞id
        for (var i = 0, cnt = characterDocs.length; i < cnt; i++) {
            var characterDoc = characterDocs[i];
            if (!characterDoc.hasOwnProperty('wid')) {
                characterDoc.wid = [];
            }
            characterDoc.wid.push(wordDocId); //在字表以array記錄詞id，因為同一字可以有多詞的wid
        }
    }
}

var IsValidPinyin = function (pinyin) {
    for (var i = 0, cnt = pinyin.length; i < cnt; i++) {
        if (pinyin[i] !== '') {
            return true;
        }
    }
    return false;
}

export default WordDataListToDB;