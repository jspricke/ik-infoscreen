#!/usr/bin/env python3
import json
import os

import requests
from bs4 import BeautifulSoup


def download_course(id):
    url = f'https://www.interdisciplinary-college.de/index.php?controller=collections&action=see_detail&id={id}'
    print(f'Retrieving {url}.')
    return requests.get(url).content


def parse_and_create_details(download, id):
    html = BeautifulSoup(download, 'html.parser')

    title = html.find(class_='panel-heading').get_text().strip()
    desc_body, inst_body = html.find_all(class_='panel-body')

    course_contents = desc_body.find_all('strong')
    for i, course_content in enumerate(course_contents):
        cc = [course_content.next_sibling]
        try:
            while cc[-1].next_sibling.name != 'strong':
                cc.append(cc[-1].next_sibling)
        except AttributeError:
            pass
        course_contents[i] = [c for c in cc if c != '\n']
    description, objectives, literature, location, requirements = [c[0] for c in course_contents]

    website, image, vita = [0, 0, 0]
    instructor = inst_body.div.div.table.tr.td.get_text().strip()

    try:
        website = inst_body.find('a')['href'].strip()
        websites = website.split('<br />')
        websites = [f'<a href="{website}">{website}</a>'for website in websites]
        website = '<br />'.join(websites)
    except TypeError:
        website = 'N/A'

    try:
        image = inst_body.find('img')['src'].strip()
        imagetag = f'<img src="{id}{os.path.splitext(image)[1]}" alt="{instructor}" />'
    except TypeError:
        image = None
        imagetag = ''

    vita = inst_body.find_all('strong')[1].next_sibling.next_sibling.children
    vita = ''.join(str(v) for v in vita)

    details = f'''<!DOCTYPE html>
<head>
    <title>{title}</title>
    <link rel="stylesheet" type="text/css" href="/css/detail.css">
</head>
<body>
    <h1>{title}</h1>
    <article>
        <section>
            <h2>Description</h2>
            {description}
        </section>
        <section>
            <h2>Objectives</h2>
            {objectives}
        </section>
        <section>
            <h2>Literature</h2>
            {literature}
        </section>
        <section>
            <h2>Requirements</h2>
            {requirements}
        </section>
        <section>
            <h2>Room</h2>
            {location}
        </section>
    </article>
    <aside>
        <h2>{instructor}</h2>
        <p>Website: {website}</p>
        <p>{imagetag}
        {vita}</p>
    </aside>
</body>
</html>'''
    return details, image


def main():
    with open('ikschedule.json') as iksched:
        schedule = json.load(iksched)
    ids = sorted(list(set(course['coll_id'] for course in schedule['events'])))
    os.makedirs('details', exist_ok=True)
    for id in ids:
        with open(f'details/detail{id}.html', 'w') as f:
            output, img = parse_and_create_details(download_course(id), id)
            f.write(output)
        if img:
            print(f'Retrieving {img}.')
            resp = requests.get(img, stream=True)
            with open(f'details/{id}{os.path.splitext(img)[1]}', 'wb') as f:
                for block in resp.iter_content(2**10):
                    f.write(block)


if __name__ == '__main__':
    main()
