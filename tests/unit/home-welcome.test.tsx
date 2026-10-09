import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { pages } from '@/content/pages';
import { HomeTemplate } from '@/components/templates/HomeTemplate';
import { SourceVideo } from '@/components/interactive/SourceVideo';

afterEach(cleanup);

it.each(['cn','en'] as const)('%s welcome uses a local photo before activating the supplied video', locale=>{
  const {container}=render(<HomeTemplate page={pages.find(p=>p.id==='home'&&p.locale===locale)!}/>);
  const section=container.querySelector('.home-welcome')!;
  const player=section.querySelector('.source-video')!;
  expect(player.querySelector('img')).toHaveAttribute('src','/media/manufacturing-poster.jpg');
  expect(player.querySelector('iframe')).toBeNull();
  const contact=within(section as HTMLElement).getByRole('link',{name:locale==='cn'?'联系我们':'Contact Us'});
  expect(player.compareDocumentPosition(contact)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  fireEvent.click(within(section as HTMLElement).getByRole('button',{name:locale==='cn'?'播放工厂概览视频':'Play factory overview video'}));
  expect(player.querySelector('img')).toBeNull();
  expect(player.querySelector('iframe')).toHaveAttribute('src','https://www.youtube-nocookie.com/embed/uGqOG4NfbZQ?autoplay=1');
  expect(within(section as HTMLElement).getByRole('link',{name:locale==='cn'?'在 YouTube 打开视频':'Open video on YouTube'})).toHaveAttribute('href','https://www.youtube.com/watch?v=uGqOG4NfbZQ');
});

it('does not change existing players without a homepage poster',()=>{
  const {container}=render(<SourceVideo video="bx1R2NQPTxw" locale="cn"/>);
  expect(container.querySelector('.source-video strong')).toHaveTextContent('APOWER TECH');
  expect(container.querySelector('img')).toBeNull();
});
