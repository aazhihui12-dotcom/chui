"""Import only the 3.0 replacement images; never alter the supplied archive."""
import hashlib,io,json,pathlib,re,sys,zipfile
from PIL import Image
source=pathlib.Path(sys.argv[1])
output=pathlib.Path('public/media/apower/v3');output.mkdir(parents=True,exist_ok=True)
assets={};paths={}
icons={'人群':'people','皇冠帽':'crown','币种兑换':'payment','赞':'approval','优惠券':'coupon','金牌':'medal','对勾':'check','吹风机':'dryer','涨幅':'growth'}
with zipfile.ZipFile(source) as z:
    if z.testzip():raise ValueError('Invalid archive CRC')
    for info in z.infolist():
        if info.is_dir() or info.filename.startswith('__MACOSX/'):continue
        name=info.filename if info.flag_bits&2048 else info.filename.encode('cp437').decode('utf-8')
        parts=pathlib.PurePosixPath(name).parts
        if '..' in parts or name.startswith('/') or parts[-1].startswith('.'):continue
        if '/ICON/' in name:key='icon-'+icons[parts[-1].split('_')[0]];limit=200
        elif '/1.首页-' in name:key='home-mission';limit=1400
        elif '/独家销售/' in name:key='exclusive-testing';limit=1200
        elif '/确保每份订单' in name:key='assembly-'+re.search(r'步骤 (\d+)',name).group(1);limit=1200
        elif '视频下方模块图片/' in name:key='manufacturing-'+parts[-2].split('.')[0];limit=1000
        else:continue
        raw=z.read(info);im=Image.open(io.BytesIO(raw));im.thumbnail((limit,1600),Image.Resampling.LANCZOS)
        im=im.convert('RGBA' if 'A' in im.getbands() or 'transparency' in im.info else 'RGB')
        buf=io.BytesIO();im.save(buf,'WEBP',quality=88,method=6);encoded=buf.getvalue();digest=hashlib.sha256(encoded).hexdigest()
        src=paths.get(digest)
        if not src:src='/media/apower/v3/'+key+'.webp';(output/(key+'.webp')).write_bytes(encoded);paths[digest]=src
        assets[key]={'src':src,'width':im.width,'height':im.height,'sourceArchive':source.name,'sourcePath':name,'sourceSha256':hashlib.sha256(raw).hexdigest()}
pathlib.Path('content/apower-v3-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
print('Imported',len(assets),'keys /',len(paths),'unique assets')
