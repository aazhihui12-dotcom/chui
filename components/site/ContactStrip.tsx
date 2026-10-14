import type { Locale } from '@/content/schema';
import { InquiryTrigger } from '@/components/interactive/InquiryTrigger';
export function ContactStrip({ locale }: {locale: Locale}) {
  return <section className="v3-contact-strip"><div><h2>{locale === 'cn' ? '让我们今天就取得联系，找到正确的解决方案！' : 'Let’s connect today and find the right solution.'}</h2><InquiryTrigger locale={locale} title={locale==='cn'?'与家电专家交流':'Consult with an Appliance Expert'}>{locale === 'cn' ? '与家电专家交流' : 'Consult with an Appliance Expert'} ↗</InquiryTrigger></div></section>;
}
