"""Local OFL fonts: Inter Medium and a Source Han SC Medium website subset."""
import io,pathlib,sys,urllib.request
from fontTools import subset
from fontTools.ttLib import TTFont
out=pathlib.Path('public/fonts');out.mkdir(exist_ok=True)
def get(url):return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read()
def rename_derivative(font):
    # Source is a reserved font name in the upstream OFL. The website subset
    # keeps copyright/license metadata but uses a distinct derivative name.
    names={1:'APOWER Han Medium',2:'Regular',3:'APOWERHan-Medium-WebsiteSubset20261014',4:'APOWER Han Medium',6:'APOWERHan-Medium',16:'APOWER Han',17:'Medium'}
    for record in font['name'].names:
        if record.nameID in names:
            record.string=names[record.nameID].encode(record.getEncoding())
    if 'CFF ' in font:
        cff=font['CFF '].cff
        cff.fontNames=['APOWERHan-Medium']
        top=cff.topDictIndex[0]
        top.FullName='APOWER Han Medium'
        top.FamilyName='APOWER Han'
    return font
if '--rename-existing' in sys.argv:
    source=out/'SourceHanSansSC-Medium-subset.woff'
    font=rename_derivative(TTFont(source))
    font.save(out/'APOWER-Han-Medium.woff')
    print('Renamed the existing website subset to APOWER Han; upstream OFL retained.')
    sys.exit(0)
(out/'Inter-Medium.woff2').write_bytes(get('https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Medium.woff2'))
(out/'OFL-Inter.txt').write_bytes(get('https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt'))
raw=get('https://raw.githubusercontent.com/adobe-fonts/source-han-sans/release/OTF/SimplifiedChinese/SourceHanSansSC-Medium.otf')
font=TTFont(io.BytesIO(raw));options=subset.Options();options.flavor='woff';options.name_IDs=['*'];options.name_languages=['*'];options.name_legacy=True
text=''.join(p.read_text() for folder in ['app','components','content','lib'] for p in pathlib.Path(folder).rglob('*') if p.suffix in ['.ts','.tsx','.json'])
chars={ord(c) for c in text if ord(c)>127}|set(range(0x3000,0x3040))
engine=subset.Subsetter(options=options);engine.populate(unicodes=chars);engine.subset(font);font.flavor='woff';rename_derivative(font).save(out/'APOWER-Han-Medium.woff')
(out/'OFL-SourceHanSans.txt').write_bytes(get('https://raw.githubusercontent.com/adobe-fonts/source-han-sans/release/LICENSE.txt'))
print('Inter + Source Han SC Medium; subset covers',len(chars),'source characters')
