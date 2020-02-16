#!/usr/bin/python3

from colorsys import rgb_to_yiq

# taken from https://stackoverflow.com/a/12224359
colors = [
    '000000',
    '00FF00',
    '0000FF',
    'FF0000',
    '01FFFE',
    'FFA6FE',
    'FFDB66',
    '006401',
    '010067',
    '95003A',
    '007DB5',
    'FF00F6',
    'FFEEE8',
    '774D00',
    '90FB92',
    '0076FF',
    'D5FF00',
    'FF937E',
    '6A826C',
    'FF029D',
    'FE8900',
    '7A4782',
    '7E2DD2',
    '85A900',
    'FF0056',
    'A42400',
    '00AE7E',
    '683D3B',
    'BDC6FF',
    '263400',
    'BDD393',
    '00B917',
    '9E008E',
    '001544',
    'C28C9F',
    'FF74A3',
    '01D0FF',
    '004754',
    'E56FFE',
    '788231',
    '0E4CA1',
    '91D0CB',
    'BE9970',
    '968AE8',
    'BB8800',
    '43002C',
    'DEFF74',
    '00FFC6',
    'FFE502',
    '620E00',
    '008F9C',
    '98FF52',
    '7544B1',
    'B500FF',
    '00FF78',
    'FF6E41',
    '005F39',
    '6B6882',
    '5FAD4E',
    'A75740',
    'A5FFD2',
    'FFB167',
    '009BFF',
    'E85EBE',
]

for i, color in enumerate(colors):
    r = int(color[0:2], 16) / 255
    g = int(color[2:4], 16) / 255
    b = int(color[4:6], 16) / 255
    if rgb_to_yiq(r, g, b)[0] > 0.5:
        print(f'#lecture_id_{i} {{ background-color: #{color}; color: black; }}')
    else:
        print(f'#lecture_id_{i} {{ background-color: #{color}; }}')
