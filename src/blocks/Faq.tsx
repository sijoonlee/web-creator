import { z } from 'zod'

import { Heading } from '@/components/Heading'
import { registerBlock } from './registerBlock'

export const faqSchema = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      question: z.string(),
      answer: z.string()
    })
  )
})

function Faq(props: z.infer<typeof faqSchema>) {
  return (
    <section className="faq">
      <Heading>{props.title}</Heading>
      <div className="faq-list">
        {props.items.map((item) => (
          <article className="faq-item" key={item.question}>
            <Heading level={3}>{item.question}</Heading>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export const FaqBlock = registerBlock({
  type: 'faq',
  label: 'FAQ',
  schema: faqSchema,
  component: Faq
})
