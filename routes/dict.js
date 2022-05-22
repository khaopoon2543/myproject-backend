const express = require('express');
const app = express();
const JTdic = require('../models/jtdic');
const wanakana = require('wanakana'); 

function PosToEng(pos) {
    if (pos === '名詞') {
        return 'n'
    }else if (pos === '形容詞') {
        return 'adj-i'
    }else if (pos === '形状詞') { //形容動詞
        return 'adj-na'
    }else if (pos === '副詞') {
        return 'adv'
    }else if (pos === '接続詞') {
        return 'conj'
    }else if (pos === '感動詞') {
        return 'int'
    }else if (pos === '代名詞') {
        return 'pn','adj-no'
    }
}

function VerbEng(poses)  {
    let pos4 = poses[4].split('-')
    if (['上一段','下一段'].includes(pos4[0])) {
        return 'v1'
    }else if (pos4[0] === '五段') {
        return 'v5'
    }else if (pos4[0] === 'カ行変格') {
        return 'vk'
    }else if (pos4[0] === 'サ行変格') {
        return 'vs','vs-s','v';
    }else if (pos4[0] === 'ザ行変格') {
        return 'vz'
    } else {
        return 'v'
    }
}

function ResultPOS(poses) {
    if (poses[0] === '動詞') {
        return [VerbEng(poses)]
    }else if (poses[0] === '名詞' && poses[2] === '副詞可能') {
        return ['n-t','n-adv','n','adj-no']
    }else if (poses[0] === '名詞' && poses[2] === '形状詞可能') {
        return ['n','adj-na']
    }else if (poses[0] === '名詞' && poses[1] === '数詞') {
        return ['n','num']
    }else if (poses[0] === '形容詞' && poses[1] === '非自立可能' && ['連体形'].includes(poses[5].split('-')[0])) {
        return ['adj-pn','adj-f'] //なき (廻廻奇譚)
    }else if (poses[0] === '接尾辞' && poses[1] === '形容詞的') { //aux-adj => auxiliary adjective 
        return ['aux-adj']
    }else if (poses[0] === '形状詞' && poses[1] === '助動詞語幹') {
        return ['aux-adj'] 

    }else if (poses[0] === '接頭辞') {
        return ['pref', 'n-pref'] //, 'n-pref'
    }else if (poses[0] === '接尾辞') {
        return ['suf', 'n-suf'] //, 'n-suf'
        
    }else if (poses[0] === '連体詞') {
        return ['adj-pn','adj-f'];
    
    }else if (poses[0] === '名詞' && poses[1] === '助動詞語幹') { //そう
        return ['aux','adv','n'];
    }
        return [PosToEng(poses[0])]
    
}

function CheckV5(result) {
    if (result.includes('v5')) {
        //console.log(result)
        const SearchType = { $in: [/v5/] }
        return SearchType
    }else {
        //console.log(result)
        const SearchType = { $in: result } //[result] 
        return SearchType
    }
}

const problemTypeWords = ['ごらん', 'そうさ']
function EditTypeProblems(dic_form, SearchType) {
    if (problemTypeWords.includes(dic_form)) {
        return { $in: ['int'] }
    } else {
        return SearchType
    }
}

const problemWords = ['とりとめ', '有象', '無象', '置き去る']

function EditWordProblems(dic_form, SearchType, read_form) {
    if (problemWords.includes(dic_form)) {
        return {$or:
            [
                {Kanji: { $regex : dic_form, $options: 'i' }},
                {Yomikata: { $regex : dic_form, $options: 'i' }},
            ] 
        }
    } else { //dict&read มีเหมือนกันส่วนใหญ่ เลยให้เชคส่วนใหญ่ก่อน แต่ก็มีต่างกันด้วย ก็จะเข้า route ต่อไปเล้ยย  
        return {$and:
            [
                {Kanji: dic_form},
                {Yomikata: read_form},            
                {Type: SearchType}
            ] 
        }
    }
}

function SearchDictType(dic_form, SearchType, toKana_dic_form) {
    return {
        $and: [
            {$or: [
                {Kanji: dic_form},
                {Yomikata: toKana_dic_form}
            ]}, 
            {Type: SearchType}
        ] 
    }
}
function SearchAllWithOutType(word, dic_form, read_form, toKana_dic_form) {
    return {
        $and: [
            {$or: [
                {Kanji: word},
                {Kanji: dic_form},            
            ]},
            {$or: [
                {Yomikata: read_form}, 
                {Yomikata: toKana_dic_form},
            ]} 
        ] 
    }
}

app.get('/', async function(req, res) { //{ word : word, dic_form : dic_form, read_form : read_form, poses : poses }
    try {
        let word = req.query.word;
        let dic_form = req.query.dic_form;
        let poses = req.query.poses;
        let read_form = req.query.read_form;
        if (wanakana.isJapanese(dic_form)!==true) {
            return res.status(200).send(null)  
        }
        let toKana_dic_form = wanakana.toHiragana(dic_form);

        const result_poses = ResultPOS(poses)
        const result_verb = CheckV5(result_poses)
        const SearchType = EditTypeProblems(dic_form, result_verb)

        const dict_list = await JTdic.find( EditWordProblems(dic_form, SearchType, read_form) )
        if (dict_list.length > 0) {
            return res.status(200).send(dict_list) 
        } else {
            const dict_list = await JTdic.find( SearchDictType(dic_form, SearchType, toKana_dic_form) )
            if (dict_list.length > 0) {
                //console.log('SearchDictType')
                return res.status(200).send(dict_list) 
            } else {
                const dict_list = await JTdic.find( SearchAllWithOutType(word, dic_form, read_form, toKana_dic_form) )
                if (dict_list.length > 0) {
                    //console.log('SearchAllWithOutType', dict_list)
                    return res.status(200).send(dict_list) 
                } else {
                    //console.log('ERROR--------------', dict_list)
                    return res.status(200).send(dict_list) 

                } 
            }
        }
       
    } catch (err) {
        console.error("Something went wrong")
        console.error(err)
        res.status(400).send(err)
    }   
});

module.exports = app;