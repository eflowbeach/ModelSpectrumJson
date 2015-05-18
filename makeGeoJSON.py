#!/usr/bin/python

import os, sys, minify_json

allSites = ['abr', 'aly', 'abq', 'ama', 'afc', 'anc', 'ffc', 'ewx', 'byz', 'bgm', 'bmx', 'bis', 'rnk', 'boi', 'box',
            'bro', 'buf', 'btv', 'car', 'chs', 'rlx', 'cys', 'lot', 'cle', 'cae', 'crp', 'fwd', 'bou', 'dmx', 'dtx',
            'ddc', 'dlh', 'epz', 'lkn',
            'eka', 'afg', 'fgz', 'apx',
            'ggw', 'gld', 'fgf', 'gjt', 'grr', 'gyx', 'tfx', 'grb', 'gsp', 'gum', 'hnx', 'gid', 'hfo', 'hgx', 'hun',
            'ind', 'jan', 'jkl', 'jax', 'ajk', 'eax', 'eyw', 'arx', 'lch', 'vef', 'ilx', 'lzk', 'lox', 'lmk', 'lub',
            'mqt', 'mfr', 'mlb', 'meg', 'mfl', 'maf', 'mkx', 'mso', 'mob', 'mhx', 'mrx', 'phi', 'ohx', 'lix', 'okx',
            'oun', 'lbf', 'iwx', 'oax', 'pah', 'pdt', 'psr', 'pbz', 'pih', 'pqr', 'pub', 'dvn', 'rah', 'unr', 'rev',
            'riw', 'sto', 'slc', 'sjt', 'sgx', 'mtr', 'sju', 'sew', 'shv', 'fsd', 'otx', 'sgf', 'lsx', 'ctp', 'lwx',
            'tae', 'tbw', 'top', 'twc', 'tsa', 'mpx', 'akq', 'ict', 'ilm', 'iln']

allSites = ['rlx', 'btv', 'oax']

# Use https://github.com/mapbox/geojson-merge to merge files by constructing merge string
mergeCommand = 'geojson-merge '
for site in allSites:
    os.system('wget -T 8 -t 5 -O data/' + site + ' "http://www.weather.gov/source/' + site + '/modelspectrum/' + site + 'Sites.json"')

    # Check File Size if > 0 add to string
    statinfo = os.stat('data/' + site)
    if statinfo.st_size != 0:
        mergeCommand += 'data/' + site + ' '

# Finish merge command
mergeCommand += '> merged.geojson'
print mergeCommand
os.system(mergeCommand)

# Read merged file and build a string for https://github.com/getify/JSON.minify/blob/master/minify_json.py
f = open('merged.geojson', 'r')
geostring = ''
for i in f.readlines():
    geostring+= i
f.close()

# Make final minified output file
output = 'ModelSpectrumSites.min.json'
f = open(output, 'w')
f.write(minify_json.json_minify(geostring))
f.close()

print "Final output stored here: "+ output