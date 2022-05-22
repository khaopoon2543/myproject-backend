import sys
import json
from sudachipy import tokenizer, dictionary

tokenizer_obj = dictionary.Dictionary().create()
mode = tokenizer.Tokenizer.SplitMode.C

lyric = sys.argv[1]
#print(lyric, file = sys.stderr)

token_list = []
for m in tokenizer_obj.tokenize(lyric, mode):
    token_dic = {}
    token_dic['surface'] = m.surface()
    token_dic['dictionary_form'] = m.dictionary_form() 
    token_dic['reading_form'] = m.reading_form() 
    poses_list = []
    for pos in m.part_of_speech():#[0:3]:
        poses_list.append(pos)
    token_dic['poses'] = poses_list
    token_list.append(token_dic) 
    
#print(json.dumps(token_list))
sys.stdout.write(json.dumps(token_list))

