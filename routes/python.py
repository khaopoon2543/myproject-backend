import sys ,numpy as np
import json
from sudachipy import tokenizer
from sudachipy import dictionary
import codecs
import io
import requests

#example  first test
#symbol, count = sys.argv[1], sys.argv[2]
#pattern = symbol * int(count)

def read_in():
    lines = sys.stdin.readline()
    decode = json.loads(lines)
    print(decode)
        
def tokenized():
    #lyric = sys.stdin.readlines() #line = ['[1,2,3,4,5,6,7,8,9]']
    #lyric = lines[0].encode('utf-8', 'surrogateescape').decode('utf-8', 'surrogateescape')
    #lyric = read_in()
    
    lines = sys.stdin.readline()
    yattagetta = json.loads(lines) #.encode('unicode-escape').decode('ascii') #T__T ;;;T ^ T;;; ;__; >;<

    tokenizer_obj = dictionary.Dictionary().create()
    mode = tokenizer.Tokenizer.SplitMode.B
    for m in tokenizer_obj.tokenize("ありがとうございました".encode("utf-8").decode("utf-8"), mode):
        ii = m.reading_form()
        print(ii.encode("utf-8"))


if __name__ =='__main__' :
    python = tokenized()
