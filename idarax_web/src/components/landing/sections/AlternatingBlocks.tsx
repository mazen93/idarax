import { CheckCircle2 } from 'lucide-react';
import { ThemeMap, SectionStyle } from '../../../utils/theme';
import { AlternatingBlock } from '../../../types/cms';

interface AlternatingBlocksProps {
  blocks: AlternatingBlock[];
  style: SectionStyle;
  cTheme: ThemeMap;
}

export default function AlternatingBlocks({ blocks, style, cTheme }: AlternatingBlocksProps) {
  return (
    <section id="products" className={`py-24 space-y-32 ${style.bg} ${style.text} transition-colors duration-500`}>
      {blocks.map((block, i) => (
        <div key={i} className={`max-w-7xl mx-auto px-6 flex flex-col ${block.imageLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}>
          <div className="lg:w-1/2">
            <h3 className="text-4xl lg:text-5xl font-extrabold mb-6">{block.title}</h3>
            <p className={`text-lg ${style.textMuted} mb-8`}>{block.desc}</p>
            <ul className="space-y-4">
              {(block.bullets || []).map((f, bi) => (
                <li key={bi} className="flex items-center gap-3 font-semibold">
                  <span className={cTheme.text500}><CheckCircle2 className="w-5 h-5" /></span> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className={`aspect-video rounded-3xl overflow-hidden border ${style.isDark ? 'border-border' : 'border-slate-100'} shadow-2xl group`}>
              <div className={`w-full h-full ${
                block.color === 'emerald' ? 'bg-success-50' : 
                block.color === 'purple' ? 'bg-purple-50' : 
                block.color === 'amber' ? 'bg-warning-50' : 'bg-primary-50'
              } flex items-center justify-center relative`}>
                 {block.imageUrl ? (
                   <img 
                    src={block.imageUrl} 
                    alt={block.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                   />
                 ) : (
                   <div className="text-muted-foreground font-bold">Feature Visualization</div>
                 )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
