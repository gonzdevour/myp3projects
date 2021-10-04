import CreateDB from "./CreateDB";
import CSVToWordDataList from './CSVToWordDataList.js';
import WordDataListToDB from './WordDataListToDB.js'

var PrebuildDB = function (csvString) {
    var db = CreateDB(); //建立loki
    var wordDataList = CSVToWordDataList(csvString); ////csv轉papa，只回傳csv中整理過的必要資料：[{word,pinyins,freq}]
    WordDataListToDB(wordDataList, db);

    return db;
}

export default PrebuildDB;