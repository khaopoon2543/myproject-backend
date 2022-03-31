const express = require('express');
const app = express();
const JTdic = require('../models/jtdic');

function PosToEng(pos) {
    if (pos === '名詞') {
        const pos = 'n'; return pos
    }else if (pos === '形容詞') {
        const pos = 'adj-i'; return pos
    }else if (pos === '形状詞') { //形容動詞
        const pos = 'adj-na'; return pos
    }else if (pos === '連体詞') {
        const pos = 'adj-pn'; return pos
    }else if (pos === '副詞') {
        const pos = 'adv'; return pos
    }else if (pos === '接続詞') {
        const pos = 'conj'; return pos
    }else if (pos === '感動詞') {
        const pos = 'int'; return pos
    }else if (pos === '接尾辞') {
        const pos = 'suf'; return pos
    }else{
        return pos
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
        const pos = 'vs'; return pos
    }else if (pos4[0] === 'ザ行変格') {
        const pos = 'vz'; return pos
    }else {
        return poses
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
        return ['adj-pn']
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

app.get('/', async function(req, res) { //{ word : word, dic_form : dic_form, read_form : read_form, poses : poses }
    try {
        let dic_form = req.query.dic_form;
        let poses = req.query.poses;
        let read_form = req.query.read_form;


        const result = ResultPOS(poses)
        
        const SearchType = CheckV5(result)
        const dict_list = await JTdic.find({ $and: [{$or: [{Kanji: dic_form},{Yomikata: dic_form}]} , {Type: SearchType}] })
        
        if (dict_list.length===0) {
            const dict_list = await JTdic.find({ Yomikata: dic_form , Type: SearchType })
            if (dict_list.length===0) {
                const dict_list = await JTdic.find({ Yomikata: read_form , Type: SearchType })
                res.status(200).send(dict_list) //search in Yomikata (read_form)
            } else {
                res.status(200).send(dict_list) //search in Yomikata (dic_form)
            }
        } else {
            res.status(200).send(dict_list) //search in Kanji
        }

    } catch (err) {
        res.status(400).send(err)
    }   
});

module.exports = app;