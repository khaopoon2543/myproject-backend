const express = require('express');
const app = express();
const JTdic = require('../models/jtdic');
const wanakana = require('wanakana');

function PosToEng(pos) {
    if (pos === '名詞') {
        const pos = 'n'; return pos
    }else if (pos === '形容詞') {
        const pos = 'adj-i'; return pos
    }else if (pos === '形状詞') { //形容動詞
        const pos = 'adj-na'; return pos
    }else if (pos === '副詞') {
        const pos = 'adv'; return pos
    }else if (pos === '接続詞') {
        const pos = 'conj'; return pos
    }else if (pos === '感動詞') {
        const pos = 'int'; return pos
    }
}

function VerbEng(poses)  {
    let pos4 = poses[4].split('-')
    if (['上一段','下一段'].includes(pos4[0])) {
        const pos = 'v1'; return pos
    }else if (pos4[0] === '五段') {
        const pos = 'v5'; return pos
    }else if (pos4[0] === 'カ行変格') {
        const pos = 'vk'; return pos
    }else if (pos4[0] === 'サ行変格') {
        return 'vs','vs-s';
    }else if (pos4[0] === 'ザ行変格') {
        const pos = 'vz'; return pos
    }
}

function ResultPOS(poses) {
    if (poses[0] === '動詞') {
        return [VerbEng(poses)]
    }else if (poses[0] === '名詞' && poses[2] === '副詞可能') {
        return ['n-t','n-adv','n']
    }else if (poses[0] === '名詞' && poses[1] === '数詞') {
        return ['n','num']
    }else if (poses[0] === '形容詞' && poses[1] === '非自立可能' && ['連体形'].includes(poses[5].split('-')[0])) {
        return ['adj-pn','adj-f'] //なき (廻廻奇譚)
    }else if (poses[0] === '接尾辞' && poses[1] === '形容詞的') { //aux-adj => auxiliary adjective 
        return ['aux-adj']
    }else if (poses[0] === '形状詞' && poses[1] === '助動詞語幹') {
        return ['aux-adj'] 
    //}else if (poses[0] === '接頭辞') {
        //return ['pref', 'n-pref'] //, 'n-pref'
    //}else if (poses[0] === '接尾辞') {
        //return ['suf', 'n-suf'] //, 'n-suf'
    }else if (poses[0] === '連体詞') {
        return ['adj-pn','adj-f'];
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

function EditTypeProblems(dic_form, SearchType) {
    if (dic_form==='ごらん') {
        return { $in: ['int'] }
    } else if (dic_form==='ごらん') {
        return { $in: ['int'] }
    } else {
        return SearchType
    }
}

function EditWordProblems(dic_form, SearchType, read_form) {
    if (dic_form==='有象'||dic_form==='無象') {
        return {$and:
            [
                {Kanji: { $regex : dic_form, $options: 'i' }},
                {Type: SearchType}
            ] 
        }
    } else {
        return {$and:
            [
                {Kanji: dic_form},
                {Yomikata: read_form},                 
                {Type: SearchType}
            ] 
        }
    }
}

function SearchOr(dic_form, SearchType, read_form, toKana_dic_form) {
    return {
        $and: [
            {$or: [
                {Kanji: dic_form},
                {Yomikata: dic_form}, 
                {Yomikata: read_form},
                {Yomikata: toKana_dic_form}
            ]}, 
            {Type: SearchType}
        ] 
    }
}
function SearchOrWord(word, dic_form, read_form, toKana_dic_form) {
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
            res.status(200).send(null)  
        }
        let toKana_dic_form = wanakana.toHiragana(dic_form);

        const result_poses = ResultPOS(poses)
        const result_verb = CheckV5(result_poses)
        const SearchType = EditTypeProblems(dic_form, result_verb)

        const dict_list = await JTdic.find( EditWordProblems(dic_form, SearchType, read_form) )
        if (dict_list.length > 0) {
            res.status(200).send(dict_list) 
        } else {
            const dict_list = await JTdic.find( SearchOr(dic_form, SearchType, read_form, toKana_dic_form) )
            if (dict_list.length > 0) {
                res.status(200).send(dict_list) 
            } else {
                const dict_list = await JTdic.find( SearchOrWord(word, dic_form, read_form, toKana_dic_form) )
                res.status(200).send(dict_list)  
            }
        }
       
    } catch (err) {
        res.status(400).send(err)
    }   
});

module.exports = app;