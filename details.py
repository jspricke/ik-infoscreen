#!/usr/bin/python3

from json import _default_decoder, decoder
from os import makedirs
from os.path import basename
from re import compile, search, sub
from urllib.parse import urlencode
from urllib.request import urlopen


urls = compile(r'(((https?|ftp|git|file|mailto|doi)[.:][^	 ,"\'<>\){}]*|www\.[-a-z0-9.]+)[^	 .,"\'<>\){}])')


def get_json():
    data = urlencode({'start': '2018-03-09', 'end': '2018-03-17', 'request': 'see_all'}).encode('ascii')
    return urlopen('https://www.interdisciplinary-college.de/index.php?controller=collections&action=see_detail_from_all_json', data).read().decode('utf-8')


# http://www.benweaver.com/blog/decode-multiple-json-objects-in-python.html
def iload_json(buff, decoder=None, _w=decoder.WHITESPACE.match):
    """Generate a sequence of top-level JSON values declared in the
    buffer.

    >>> list(iload_json('[1, 2] "a" { "c": 3 }'))
    [[1, 2], u'a', {u'c': 3}]
    """

    decoder = decoder or _default_decoder
    idx = _w(buff, 0).end()
    end = len(buff)

    try:
        while idx != end:
            (val, idx) = decoder.raw_decode(buff, idx=idx)
            yield val
            idx = _w(buff, idx).end()
    except ValueError as exc:
        raise ValueError('%s (%r at position %d).' % (exc, buff[idx:], idx))


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
        websites = [f'<a href="{website}">{website}</a>'for website in websites]
        website = '<br />'.join(websites)
        aside.append(f'<p>Website: {website}</p>')

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
    literature = sub(urls, r'<a href="\1">\1</a>', json['attributes']['literature']).strip('<br />')

    details = f'''<!DOCTYPE html>
<head>
    <meta charset="utf-8">
    <title>{json['title'].replace('<b>', '').replace('</b>', '')}</title>
    <link rel="stylesheet" type="text/css" href="/css/detail.css">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <h1>{json['title']}</h1>
    <article>
        <section>
            <h2>Description</h2>
            {json['attributes']['description'].strip('<br />')}
        </section>
        <section>
            <h2>Objectives</h2>
            {json['attributes']['objectives'].strip('<br />')}
        </section>
        <section>
            <h2>Literature</h2>
            {literature}
        </section>
        <section>
            <h2>Requirements</h2>
            {json['attributes']['course_requirements']}
        </section>
        <section>
            <h2>Room</h2>
            {json['attributes']['experiment_location']}
        </section>
    </article>
    <aside>
        {asides}
    </aside>
</body>
</html>'''
    return details, images


def main():
    makedirs('details', exist_ok=True)

    for detail in iload_json(get_json()):
        output, images = create_details(detail['data'])
        open(f'details/detail{detail["collection_id"]}.html', 'w').write(output)

        for image in images:
            print(f'Retrieving {image}.')
            open(f'details/{basename(image)}', 'wb').write(urlopen(image).read())


if __name__ == '__main__':
    main()
