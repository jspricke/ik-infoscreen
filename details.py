#!/usr/bin/env python3

from json import loads
from os import makedirs
from os.path import basename
from re import compile, search, sub
from urllib.parse import urlencode
from urllib.request import urlopen


urls = compile(r'(((https?|ftp|git|file|mailto|doi)[.:][^	 ,"\'<>\){}]*|www\.[-a-z0-9.]+)[^	 .,"\'<>\){}])')


def get_json():
    data = urlencode({'start': '2018-03-09', 'end': '2018-03-17', 'request': 'see_all'}).encode('ascii')
    return urlopen('https://www.interdisciplinary-college.de/index.php?controller=collections&action=see_detail_from_all_json', data).read().decode('utf-8')


def create_aside(attributes, suffix):
    firstname_key = f'experimenter_firstname{suffix}'
    if firstname_key not in attributes:
        return None, None

    firstname = attributes[firstname_key].strip()

    if not firstname:
        return None, None

    lastname = attributes[f'experimenter_lastname{suffix}'].strip()

    instructor = f'{firstname} {lastname}'

    title_key = f'experimenter_title{suffix}'
    if title_key in attributes:
        title = f'{attributes[title_key]}'.strip()
        if title:
            instructor = f'{title} {instructor}'

    aside = []
    aside.append(f'<h2>{instructor}</h2>')

    email = attributes[f'experimenter_email{suffix}'].strip()

    if email and email != 'None' and email != 'TBA':
        aside.append(f'<p>Email: {email}</p>')

    aff_key = f'experimenter_affiliation{suffix}'
    if aff_key in attributes:
        affiliation = attributes[aff_key]
        if affiliation:
            aside.append(f'<p>Affiliation: {affiliation}</p>')

    website = attributes[f'experimenter_website{suffix}'].strip()
    if website and website != 'TBA' and website != 'None':
        websites = website.split('<br />')
        websites = [f'<a href="{website}">Website</a>'for website in websites]
        aside.append(f'<p>{"<br />".join(websites)}</p>')

    vita = attributes[f'experimenter_vita{suffix}']
    vita = sub(urls, r'<a href="\1">\1</a>', vita)

    pic_key = f'experimenter_pic{suffix}'
    image = None
    if pic_key in attributes:
        image_url = search(r'src="([^"]*)"', attributes[pic_key])
        if image_url:
            image = image_url.group(1)
            aside.append(f'<p><img src="{basename(image)}" alt="{instructor}" /> {vita}</p>')
    else:
        aside.append(f'<p>{vita}</p>')

    return '\n'.join(aside), image


def clean_section(section, title):
    section = sub(r'^(<br />)*', '', section)
    section = sub(r'(<br />)*$', '', section).strip()
    section = sub(urls, r'<a href="\1">\1</a>', section)
    if section:
        return f'<section><h2>{title}</h2>{section}</section>'
    return ''


def create_details(json):
    asides = []
    images = []
    for suffix in ('', '_2', '_3'):
        aside, image = create_aside(json['attributes'], suffix)
        if aside:
            asides.append(aside)
        if image:
            images.append(image)

    asides = "\n".join(asides)

    details = f'''<!DOCTYPE html>
<head>
    <meta charset="utf-8">
    <title>{json['title'].replace('<b>', '').replace('</b>', '')}</title>
    <script type="text/javascript" src="/js/ikterminal.js"></script>
    <link rel="stylesheet" type="text/css" href="/css/detail.css">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <noscript>
        <style>
        #favcb + label {{
            display: none;
        }}
        </style>
    </noscript>
</head>
<body onload="document.getElementById('favcb').checked = getFavorites().has({json['collection_id']});"
>
    <h1>{json['title']}
    <input type="checkbox" id="favcb" onclick="toggleFavorite({json['collection_id']});" /><label for="favcb"></label>
    </h1>
    <article>
        {clean_section(json['attributes']['description'], 'Description')}
        {clean_section(json['attributes']['objectives'], 'Objectives')}
        {clean_section(json['attributes']['literature'], 'Literature')}
        {clean_section(json['attributes']['course_requirements'], 'Requirements')}
        {clean_section(json['attributes']['experiment_location'], 'Room')}
    </article>
    <aside>
        {asides}
    </aside>
</body>
</html>'''
    return details, images


def main():
    makedirs('details', exist_ok=True)

    for detail in loads(get_json()):
        output, images = create_details(detail['data'])
        open(f'details/detail{detail["collection_id"]}.html', 'w').write(output)

        for image in images:
            print(f'Retrieving {image}.')
            open(f'details/{basename(image)}', 'wb').write(urlopen(image).read())


if __name__ == '__main__':
    main()
