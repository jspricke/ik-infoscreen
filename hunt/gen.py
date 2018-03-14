#!/usr/bin/python3

import os
import os.path
import shutil
import time
import binascii


PATH_DIR_OUTPUT = '../hack'
PATH_DIR_STATIC = './static'
PATH_FILE_TEMPLATE = './template.html'
PATH_FILE_DATA = './pages.tsv'
PATH_FILE_GOAL = 'goal.html'

PAGE_TITLE = '/ik/hack/hunt'
PAGE_FIRST_PASSWORD = 'start'
PAGE_GLOBAL_SALT = 'ik_rulez'


def tohex(val, nbits):
  hexstr = hex((val + (1 << nbits)) % (1 << nbits))[2:]
  return '0' * (nbits // 4 - len(hexstr)) + hexstr


# https://stackoverflow.com/questions/7253907/python-how-to-convert-int-to-string-represent-a-32bit-hex-number
#def tohex(val, nbits):
#  return '%08x' % val


# https://stackoverflow.com/questions/22845913/function-to-replicate-the-output-of-java-lang-string-hashcode-in-python-and-no#39323089
def pagehash(text):
  hsh = 0
  if not text: return hsh
  for char in text.lower():
    if not char.isalnum(): continue
    hsh = int((((31 * hsh + ord(char)) ^ 0x80000000) & 0xFFFFFFFF) - 0x80000000)
  return tohex(hsh, 32)


# create pages
pages = []
next_filename = 'index.html'
for line in open(PATH_FILE_DATA, 'r'):
  line = line.strip()
  if not line: continue
  tokens = line.split('\t')
  tokens = [token.strip() for token in tokens]
  password, path_image, message = tokens
#  salt = pagehash(str(time.time()) + password)
  salt = pagehash(PAGE_GLOBAL_SALT + password)
  filename = next_filename

  pages.append({
    'title': PAGE_TITLE,
    'path_image': path_image,
    'message': message,
    'salt': salt,
    'filename': filename
  })

  next_filename = 'page_%s.html' % pagehash(salt + password)

shutil.rmtree(PATH_DIR_OUTPUT)
os.mkdir(PATH_DIR_OUTPUT)

# write pages
with open(PATH_FILE_TEMPLATE, 'r') as f:
  page_template = f.read()

for page in pages:
  path = os.path.join(PATH_DIR_OUTPUT, page['filename'])
  with open(path, 'w') as f:
    f.write(page_template % page)

# copy files
for file_name in os.listdir(PATH_DIR_STATIC):
  src_path = os.path.join(PATH_DIR_STATIC, file_name)
  dst_path = os.path.join(PATH_DIR_OUTPUT, file_name)
  if os.path.isdir(src_path):
    shutil.copytree(src_path, dst_path)
  else:
    shutil.copy(src_path, dst_path)

# rename goal page
shutil.move(
  os.path.join(PATH_DIR_OUTPUT, PATH_FILE_GOAL),
  os.path.join(PATH_DIR_OUTPUT, next_filename))
